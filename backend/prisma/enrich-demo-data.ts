import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cajero = await prisma.usuario.findFirst({ where: { rol: { nombre: 'cajero' } } });
  const productos = await prisma.producto.findMany({ take: 5, where: { activo: true } });
  
  if (!cajero || productos.length === 0) return;

  // Add 15 random sales spread across the last 6 days
  for (let i = 0; i < 20; i++) {
    // Generate a date between 1 and 6 days ago
    const daysAgo = Math.floor(Math.random() * 6) + 1; 
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Choose 2 random products
    const p1 = productos[Math.floor(Math.random() * productos.length)];
    const p2 = productos[Math.floor(Math.random() * productos.length)];
    
    const qty1 = Math.floor(Math.random() * 3) + 1;
    const qty2 = Math.floor(Math.random() * 2) + 1;
    
    const total1 = Math.round(Number(p1.precio) * qty1);
    const total2 = Math.round(Number(p2.precio) * qty2);
    
    const total = total1 + total2;
    const baseImponible = total / 1.18;
    const itbis = total - baseImponible;

    await prisma.venta.create({
      data: {
        usuarioId: cajero.id,
        tipoPago: 'efectivo',
        subtotal: baseImponible,
        itbis,
        total,
        montoRecibido: total,
        cambio: 0,
        estado: 'completada',
        fecha: date,
        numeroFactura: `INV-${date.getTime().toString().slice(-6)}`,
        ncf: `B02${date.getTime().toString().slice(-8)}`,
        items: {
          create: [
            { productoId: p1.id, nombre: p1.nombre, precioUnitario: p1.precio, cantidad: qty1, importe: total1 },
            { productoId: p2.id, nombre: p2.nombre, precioUnitario: p2.precio, cantidad: qty2, importe: total2 },
          ]
        }
      }
    });
  }
  console.log("Demo data enriched with past sales!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
