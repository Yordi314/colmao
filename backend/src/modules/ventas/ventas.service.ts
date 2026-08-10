import prisma from '../../config/prisma';

export class VentaService {
  static async registrarVenta(data: any, usuarioId: number) {
    const { tipo_pago, cliente_id, monto_recibido, items } = data;

    if (!items || items.length === 0) {
      throw new Error('La venta debe tener al menos un ítem');
    }

    return await prisma.$transaction(async (tx: any) => {
      let subtotal = 0;

      for (const item of items) {
        const producto = await tx.producto.findUnique({ where: { id: item.producto_id } });
        if (!producto || !producto.activo) {
          throw new Error(`Producto ${item.producto_id} no existe o no está activo`);
        }

        if (producto.stock.toNumber() < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
        }

        if (!producto.permiteDetalle && !Number.isInteger(item.cantidad)) {
           throw new Error(`El producto ${producto.nombre} no permite venta fraccionada`);
        }

        subtotal += Number(producto.precio) * item.cantidad;
      }

      // 18% ITBIS inverso (precio final, redondeado al peso)
      const sumaPrecios = subtotal; // suma de (precio * cantidad)
      const total = Math.round(sumaPrecios);
      const baseImponible = total / 1.18;
      const itbis = total - baseImponible;
      
      // Sobreescribimos subtotal para guardar la base imponible
      subtotal = baseImponible;
      
      let cambio = 0;

      if (tipo_pago === 'efectivo') {
        if (monto_recibido === null || monto_recibido < total) {
          throw new Error(`El monto recibido (${monto_recibido}) es menor al total (${total})`);
        }
        cambio = Math.round(monto_recibido - total);
      } else if (tipo_pago === 'fiado') {
        if (!cliente_id) throw new Error('Cliente requerido para venta a fiado');
        const cliente = await tx.cliente.findUnique({ where: { id: cliente_id } });
        if (!cliente) throw new Error('Cliente no existe');

        // Calcular saldo actual (Ventas fiado completadas - Abonos)
        const ventasFiado = await tx.venta.aggregate({
          _sum: { total: true },
          where: { clienteId: cliente_id, tipoPago: 'fiado', estado: 'completada' }
        });
        const abonos = await tx.abono.aggregate({
          _sum: { monto: true },
          where: { clienteId: cliente_id }
        });

        const saldoActual = (Number(ventasFiado._sum.total) || 0) - (Number(abonos._sum.monto) || 0);
        
        if (Number(cliente.limiteCredito) > 0 && (saldoActual + total > Number(cliente.limiteCredito))) {
           throw new Error(`Crédito excedido. Límite: ${cliente.limiteCredito}. Saldo anterior: ${saldoActual}. Nueva venta: ${total}`);
        }
      } else {
        throw new Error('Tipo de pago inválido');
      }

      // Crear venta y descontar inventario
      const ventaItemsData = [];
      
      for (const item of items) {
        const producto = await tx.producto.findUnique({ where: { id: item.producto_id } });
        
        const importe = Number(producto!.precio) * item.cantidad;
        ventaItemsData.push({
          productoId: item.producto_id,
          nombre: producto!.nombre,
          precioUnitario: producto!.precio,
          cantidad: item.cantidad,
          importe
        });

        // Descontar stock
        await tx.producto.update({
          where: { id: item.producto_id },
          data: { stock: { decrement: item.cantidad } }
        });

        // Registrar movimiento
        await tx.movimientoInventario.create({
          data: {
            productoId: item.producto_id,
            tipo: 'venta',
            cantidad: -item.cantidad,
            usuarioId,
            referencia: 'Venta', // Se actualizará después de crear la venta
          }
        });
      }

      const venta = await tx.venta.create({
        data: {
          usuarioId,
          clienteId: cliente_id || null,
          tipoPago: tipo_pago,
          subtotal,
          itbis,
          total,
          montoRecibido: tipo_pago === 'efectivo' ? monto_recibido : null,
          cambio: tipo_pago === 'efectivo' ? cambio : null,
          items: {
            create: ventaItemsData
          }
        },
        include: { items: true }
      });

      const numeroFactura = `INV-${String(venta.id).padStart(6, '0')}`;
      const ncf = `B02${String(venta.id).padStart(8, '0')}`;

      const ventaActualizada = await tx.venta.update({
        where: { id: venta.id },
        data: { numeroFactura, ncf },
        include: { items: true }
      });

      // Actualizar referencia de movimientos con el ID de la venta
      // Esto es un detalle para mejorar la auditoría
      await tx.movimientoInventario.updateMany({
        where: { usuarioId, tipo: 'venta', referencia: 'Venta', fecha: { gte: new Date(Date.now() - 5000) } },
        data: { referencia: `Venta #${venta.id}` }
      });

      return ventaActualizada;
    });
  }
}
