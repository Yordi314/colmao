import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpieza de productos duplicados...');

  const duplicados: Array<[string, string]> = [
    ['Queso (libra)', 'Queso Amarillo 1 lb'], // Retener Queso (libra)
    ['Ace (detergente) 1 kg', 'Detergente 1 kg'], // Retener Ace
  ];

  for (const [nombreRetener, nombreEliminar] of duplicados) {
    const prodRetener = await prisma.producto.findFirst({ where: { nombre: nombreRetener } });
    const prodEliminar = await prisma.producto.findFirst({ where: { nombre: nombreEliminar } });

    if (prodRetener && prodEliminar) {
      console.log(`Fusionando "${nombreEliminar}" hacia "${nombreRetener}"...`);

      // Mover VentaItem
      await prisma.ventaItem.updateMany({
        where: { productoId: prodEliminar.id },
        data: { productoId: prodRetener.id, nombre: prodRetener.nombre }
      });

      // Mover MovimientoInventario
      await prisma.movimientoInventario.updateMany({
        where: { productoId: prodEliminar.id },
        data: { productoId: prodRetener.id }
      });

      // Sumar stock real (consolidar ambos inventarios)
      await prisma.producto.update({
        where: { id: prodRetener.id },
        data: { stock: prodRetener.stock + prodEliminar.stock }
      });

      // Borrar el producto duplicado
      await prisma.producto.delete({ where: { id: prodEliminar.id } });
      console.log(`✅ Producto "${nombreEliminar}" eliminado y fusionado.`);
    } else {
      console.log(`⚠️ No se encontraron ambos productos para fusionar: ${nombreRetener} o ${nombreEliminar}`);
    }
  }

  console.log('✨ Limpieza completada.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
