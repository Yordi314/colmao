import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  await prisma.producto.updateMany({
    where: { nombre: 'Queso (libra)' },
    data: { stock: 12 }
  });
  console.log('✅ Stock de "Queso (libra)" restaurado a 12');

  await prisma.producto.updateMany({
    where: { nombre: 'Ace (detergente) 1 kg' },
    data: { stock: 18 }
  });
  console.log('✅ Stock de "Ace (detergente) 1 kg" restaurado a 18');
}

fix().catch(console.error).finally(() => prisma.$disconnect());
