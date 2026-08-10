import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpieza de clientes duplicados...');
  
  const allClientes = await prisma.cliente.findMany({
    orderBy: { id: 'asc' }
  });

  const gruposPorNombre: Record<string, any[]> = {};
  
  allClientes.forEach(cli => {
    const nombre = cli.nombre.trim();
    if (!gruposPorNombre[nombre]) {
      gruposPorNombre[nombre] = [];
    }
    gruposPorNombre[nombre].push(cli);
  });

  let eliminados = 0;
  let ventasReasignadas = 0;
  let abonosReasignados = 0;

  for (const [nombre, clientes] of Object.entries(gruposPorNombre)) {
    if (clientes.length > 1) {
      console.log(`\nEncontrado duplicado para: "${nombre}" (${clientes.length} registros)`);
      
      // Conservar el primero (más antiguo)
      const keeper = clientes[0];
      const duplicados = clientes.slice(1);
      
      console.log(`  Conservando ID: ${keeper.id}`);
      
      for (const dup of duplicados) {
        console.log(`  Procesando duplicado ID: ${dup.id}...`);
        
        // Reasignar Ventas
        const updateVentas = await prisma.venta.updateMany({
          where: { clienteId: dup.id },
          data: { clienteId: keeper.id }
        });
        if (updateVentas.count > 0) {
          console.log(`    - ${updateVentas.count} ventas reasignadas.`);
          ventasReasignadas += updateVentas.count;
        }

        // Reasignar Abonos
        const updateAbonos = await prisma.abono.updateMany({
          where: { clienteId: dup.id },
          data: { clienteId: keeper.id }
        });
        if (updateAbonos.count > 0) {
          console.log(`    - ${updateAbonos.count} abonos reasignados.`);
          abonosReasignados += updateAbonos.count;
        }
        
        // Eliminar Cliente
        await prisma.cliente.delete({
          where: { id: dup.id }
        });
        console.log(`    - Cliente duplicado ID ${dup.id} eliminado.`);
        eliminados++;
      }
    }
  }

  console.log('\n--- RESUMEN DE LIMPIEZA ---');
  console.log(`Clientes duplicados eliminados: ${eliminados}`);
  console.log(`Ventas reasignadas: ${ventasReasignadas}`);
  console.log(`Abonos reasignados: ${abonosReasignados}`);
  console.log('¡Limpieza completada con éxito!');
}

main()
  .catch(e => {
    console.error('Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
