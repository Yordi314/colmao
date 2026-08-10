import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
  console.log('--- AUDITORÍA DE CLIENTES ---');
  const clientes = await prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });
  clientes.forEach(c => console.log(`[ID: ${c.id}] ${c.nombre} - Tel: ${c.telefono}`));

  console.log('\n--- AUDITORÍA DE CATEGORÍAS ---');
  const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
  categorias.forEach(c => console.log(`[ID: ${c.id}] ${c.nombre}`));

  console.log('\n--- AUDITORÍA DE PRODUCTOS ---');
  const productos = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } });
  productos.forEach(p => console.log(`[ID: ${p.id}] ${p.nombre} - Stock: ${p.stock}`));
}

audit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
