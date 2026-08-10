import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // --- ROLES ---
  const rolDueno = await prisma.rol.upsert({
    where: { nombre: 'dueno' },
    update: {},
    create: { nombre: 'dueno' },
  });

  const rolCajero = await prisma.rol.upsert({
    where: { nombre: 'cajero' },
    update: {},
    create: { nombre: 'cajero' },
  });

  // --- USUARIOS ---
  const passwordHashRamon = await bcrypt.hash('Ramon123!', 10);
  const ramon = await prisma.usuario.upsert({
    where: { email: 'ramon@colmado.do' },
    update: { nombre: 'Ramón Pérez' },
    create: {
      nombre: 'Ramón Pérez',
      email: 'ramon@colmado.do',
      password_hash: passwordHashRamon,
      rolId: rolDueno.id,
    },
  });

  const passwordHashYamile = await bcrypt.hash('Yamile123!', 10);
  const yamile = await prisma.usuario.upsert({
    where: { email: 'yamile@colmado.do' },
    update: { nombre: 'Yamile Rodríguez' },
    create: {
      nombre: 'Yamile Rodríguez',
      email: 'yamile@colmado.do',
      password_hash: passwordHashYamile,
      rolId: rolCajero.id,
    },
  });

  // --- CLEANUP DUPLICATES ---
  // Eliminar producto viejo (si no tiene ventas asociadas)
  try {
    await prisma.producto.deleteMany({
      where: { nombre: 'Agua Cristal 1 gal' }
    });
  } catch (e) {
    // Si tiene ventas, simplemente lo desactivamos para que no salga duplicado
    await prisma.producto.updateMany({
      where: { nombre: 'Agua Cristal 1 gal' },
      data: { activo: false }
    });
  }

  // Limpiar categorías y productos duplicados (dejando solo 1 por nombre)
  const allCategorias = await prisma.categoria.findMany({ orderBy: { id: 'asc' } });
  const catNombres = new Set();
  for (const cat of allCategorias) {
    if (catNombres.has(cat.nombre)) {
      // Si ya existe otra, tratar de borrarla si no tiene productos
      try { await prisma.categoria.delete({ where: { id: cat.id } }); } catch(e) {}
    } else {
      catNombres.add(cat.nombre);
    }
  }

  const allProductos = await prisma.producto.findMany({ orderBy: { id: 'asc' } });
  const prodNombres = new Set();
  for (const prod of allProductos) {
    if (prodNombres.has(prod.nombre)) {
      // Intentar borrar duplicado (si tiene ventas asociadas, fallará, pero intentamos limpiar lo generado por el seed)
      try { await prisma.producto.delete({ where: { id: prod.id } }); } catch(e) {}
    } else {
      prodNombres.add(prod.nombre);
    }
  }

  // Limpiar clientes duplicados (dejando solo 1 por nombre)
  const allClientes = await prisma.cliente.findMany({ orderBy: { id: 'asc' } });
  const clienteNombres = new Set();
  for (const cli of allClientes) {
    if (clienteNombres.has(cli.nombre)) {
      try { await prisma.cliente.delete({ where: { id: cli.id } }); } catch(e) {}
    } else {
      clienteNombres.add(cli.nombre);
    }
  }

  // --- CATEGORÍAS ---
  const categoriasData = [
    { nombre: 'Abarrotes', emoji: '🛒', color: '#6E7169', orden: 1 },
    { nombre: 'Bebidas', emoji: '🥤', color: '#6E7169', orden: 2 },
    { nombre: 'Lácteos', emoji: '🥛', color: '#6E7169', orden: 3 },
    { nombre: 'Limpieza', emoji: '🧼', color: '#6E7169', orden: 4 },
    { nombre: 'Snacks', emoji: '🍪', color: '#6E7169', orden: 5 },
    { nombre: 'Víveres', emoji: '🍌', color: '#6E7169', orden: 6 },
    { nombre: 'Embutidos', emoji: '🥩', color: '#6E7169', orden: 7 },
  ];

  const categorias = [];
  for (const cat of categoriasData) {
    let creada = await prisma.categoria.findFirst({ where: { nombre: cat.nombre } });
    if (!creada) {
      creada = await prisma.categoria.create({ data: cat });
    } else {
      creada = await prisma.categoria.update({ where: { id: creada.id }, data: cat });
    }
    categorias.push(creada);
  }
  const [catAbarrotes, catBebidas, catLacteos, catLimpieza, catSnacks, catViveres, catEmbutidos] = categorias;

  // --- PRODUCTOS ---
  const productosData = [
    { nombre: 'Arroz Selecto 1 lb', categoriaId: catAbarrotes.id, precio: 38, costo: 30, unidad: 'libra', permiteDetalle: true, stock: 50, stockMinimo: 20, esFrecuente: true, emoji: '🍚', imagenUrl: '/productos/arroz.png' },
    { nombre: 'Habichuelas Rojas 1 lb', categoriaId: catAbarrotes.id, precio: 50, costo: 40, unidad: 'libra', permiteDetalle: true, stock: 30, stockMinimo: 15, esFrecuente: true, emoji: '🫘', imagenUrl: '/productos/habichuelas.png' },
    { nombre: 'Aceite Vegetal 1 L', categoriaId: catAbarrotes.id, precio: 150, costo: 120, unidad: 'unidad', permiteDetalle: false, stock: 12, stockMinimo: 10, esFrecuente: false, emoji: '🛢️', imagenUrl: '/productos/aceite.png' },
    { nombre: 'Spaghetti 1 lb', categoriaId: catAbarrotes.id, precio: 45, costo: 35, unidad: 'unidad', permiteDetalle: false, stock: 25, stockMinimo: 15, esFrecuente: false, emoji: '🍝' },
    { nombre: 'Leche en Polvo 400 g', categoriaId: catLacteos.id, precio: 250, costo: 210, unidad: 'unidad', permiteDetalle: false, stock: 3, stockMinimo: 10, esFrecuente: false, emoji: '🥛', imagenUrl: '/productos/leche-polvo.png' },
    { nombre: 'Huevos (unidad)', categoriaId: catLacteos.id, precio: 7, costo: 5, unidad: 'unidad', permiteDetalle: true, stock: 100, stockMinimo: 30, esFrecuente: true, emoji: '🥚' },
    { nombre: 'Coca-Cola 2 L', categoriaId: catBebidas.id, precio: 95, costo: 75, unidad: 'unidad', permiteDetalle: false, stock: 20, stockMinimo: 15, esFrecuente: true, emoji: '🥤', imagenUrl: '/productos/coca-cola.png' },
    { nombre: 'Botella Planet Azul', categoriaId: catBebidas.id, precio: 70, costo: 55, unidad: 'unidad', permiteDetalle: false, stock: 2, stockMinimo: 10, esFrecuente: true, emoji: '💧', imagenUrl: '/productos/planeta-azul.png' },
    { nombre: 'Jugo Rica 1 L', categoriaId: catBebidas.id, precio: 80, costo: 65, unidad: 'unidad', permiteDetalle: false, stock: 15, stockMinimo: 10, esFrecuente: false, emoji: '🧃', imagenUrl: '/productos/jugo-rica.png' },
    { nombre: 'Jabón de Cuaba', categoriaId: catLimpieza.id, precio: 30, costo: 20, unidad: 'unidad', permiteDetalle: false, stock: 40, stockMinimo: 15, esFrecuente: false, emoji: '🧼', imagenUrl: '/productos/jabon-cuaba.png' },
    { nombre: 'Ace (detergente) 1 kg', categoriaId: catLimpieza.id, precio: 120, costo: 95, unidad: 'unidad', permiteDetalle: false, stock: 18, stockMinimo: 10, esFrecuente: false, emoji: '🫧', imagenUrl: '/productos/ace.png' },
    { nombre: 'Papel Higiénico 4u', categoriaId: catLimpieza.id, precio: 110, costo: 85, unidad: 'unidad', permiteDetalle: false, stock: 12, stockMinimo: 15, esFrecuente: false, emoji: '🧻' },
    { nombre: 'Galletas Hatuey', categoriaId: catSnacks.id, precio: 25, costo: 18, unidad: 'unidad', permiteDetalle: false, stock: 60, stockMinimo: 20, esFrecuente: false, emoji: '🍘', imagenUrl: '/productos/galletas.png' },
    { nombre: 'Plátano (unidad)', categoriaId: catViveres.id, precio: 25, costo: 15, unidad: 'unidad', permiteDetalle: true, stock: 45, stockMinimo: 30, esFrecuente: true, emoji: '🍌' },
    { nombre: 'Salami Induveca 1 lb', categoriaId: catEmbutidos.id, precio: 180, costo: 140, unidad: 'libra', permiteDetalle: true, stock: 8, stockMinimo: 15, esFrecuente: true, emoji: '🥩', imagenUrl: '/productos/salami.png' },
    { nombre: 'Cigarrillos (unidad)', categoriaId: catAbarrotes.id, precio: 20, costo: 14, unidad: 'unidad', permiteDetalle: true, stock: 200, stockMinimo: 50, esFrecuente: true, emoji: '🚬' },
    { nombre: 'Queso (libra)', categoriaId: catLacteos.id, precio: 220, costo: 170, unidad: 'libra', permiteDetalle: true, stock: 12, stockMinimo: 10, esFrecuente: false, emoji: '🧀', imagenUrl: '/productos/queso.png' },
    { nombre: 'Papas (libra)', categoriaId: catViveres.id, precio: 40, costo: 25, unidad: 'libra', permiteDetalle: true, stock: 35, stockMinimo: 20, esFrecuente: false, emoji: '🥔' },
    { nombre: 'Café Santo Domingo', categoriaId: catAbarrotes.id, precio: 150, costo: 120, unidad: 'libra', permiteDetalle: true, stock: 25, stockMinimo: 10, esFrecuente: true, emoji: '☕', imagenUrl: '/productos/cafe.png' },
    { nombre: 'Azúcar Crema 1 lb', categoriaId: catAbarrotes.id, precio: 35, costo: 25, unidad: 'libra', permiteDetalle: true, stock: 40, stockMinimo: 20, esFrecuente: true, emoji: '🥄', imagenUrl: '/productos/azucar.png' },
  ];

  const productos = [];
  for (const prod of productosData) {
    let p = await prisma.producto.findFirst({ where: { nombre: prod.nombre } });
    if (!p) {
      p = await prisma.producto.create({ data: prod });
    } else {
      p = await prisma.producto.update({ where: { id: p.id }, data: prod });
    }
    productos.push(p);
  }

  // --- CLIENTES FIADO ---
  let clienteA = await prisma.cliente.findFirst({ where: { nombre: 'Doña Altagracia' } });
  if (!clienteA) {
    clienteA = await prisma.cliente.create({
      data: { nombre: 'Doña Altagracia', telefono: '809-555-1234', limiteCredito: 5000 },
    });
  } else {
    clienteA = await prisma.cliente.update({
      where: { id: clienteA.id },
      data: { telefono: '809-555-1234', limiteCredito: 5000 }
    });
  }
  
  let juan = await prisma.cliente.findFirst({ where: { nombre: 'Juan el de la esquina' } });
  if (!juan) {
    juan = await prisma.cliente.create({
      data: { nombre: 'Juan el de la esquina', telefono: '829-555-5678', limiteCredito: 2000 },
    });
  } else {
    juan = await prisma.cliente.update({
      where: { id: juan.id },
      data: { telefono: '829-555-5678', limiteCredito: 2000 }
    });
  }
  
  let pedro = await prisma.cliente.findFirst({ where: { nombre: 'Pedro (Taller)' } });
  if (!pedro) {
    pedro = await prisma.cliente.create({
      data: { nombre: 'Pedro (Taller)', telefono: null, limiteCredito: 3000 },
    });
  } else {
    pedro = await prisma.cliente.update({
      where: { id: pedro.id },
      data: { limiteCredito: 3000 }
    });
  }

  // --- VENTAS HISTÓRICAS ---
  console.log('Generando ventas históricas (solo si no existen)...');
  
  const existingVentas = await prisma.venta.count();
  if (existingVentas <= 2) {
    // Limpiar ventas viejas generadas por seed anterior si las hay
    await prisma.venta.deleteMany({});
    await prisma.abono.deleteMany({});

    // Generar ventas aleatorias en los últimos 30 días
    const hoy = new Date();
    for (let i = 30; i >= 0; i--) {
      // Generar entre 2 y 5 ventas por día
      const numVentas = Math.floor(Math.random() * 4) + 2;
      for (let j = 0; j < numVentas; j++) {
        // Hora aleatoria entre 8 AM y 9 PM
        const hora = Math.floor(Math.random() * 14) + 8;
        const minuto = Math.floor(Math.random() * 60);
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        fecha.setHours(hora, minuto, 0, 0);

        // Elegir productos al azar, excluyendo algunos para que sean "plata muerta"
        // Excluimos explícitamente: Leche en Polvo (index 4), Jabón de Cuaba (index 9)
        const activeProducts = productos.filter((_, idx) => idx !== 4 && idx !== 9);
        const numItems = Math.floor(Math.random() * 3) + 1;
        const itemsToBuy = [];
        let subtotal = 0;

        for (let k = 0; k < numItems; k++) {
          const prod = activeProducts[Math.floor(Math.random() * activeProducts.length)];
          const qty = Math.floor(Math.random() * 3) + 1;
          itemsToBuy.push({ productoId: prod.id, nombre: prod.nombre, precioUnitario: prod.precio, cantidad: qty, importe: prod.precio * qty });
          subtotal += prod.precio * qty;
        }

        const itbis = subtotal * 0.18;
        const total = subtotal + itbis;
        
        // El 20% son fiadas a clientes al azar
        const esFiado = Math.random() < 0.2;
        let clienteId = null;
        if (esFiado) {
          const clientes = [clienteA, juan, pedro];
          clienteId = clientes[Math.floor(Math.random() * clientes.length)].id;
        }

        await prisma.venta.create({
          data: {
            usuarioId: yamile.id,
            clienteId: clienteId,
            tipoPago: esFiado ? 'fiado' : 'efectivo',
            subtotal,
            itbis,
            total,
            montoRecibido: esFiado ? null : total + (Math.random() * 50),
            cambio: esFiado ? null : (Math.random() * 50),
            numeroFactura: `INV-${Date.now().toString().slice(-6)}${j}`,
            fecha,
            items: {
              create: itemsToBuy
            }
          }
        });
      }
    }

    // Abonos
    await prisma.abono.create({
      data: {
        clienteId: clienteA.id,
        monto: 100,
        usuarioId: ramon.id,
        fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Hace 10 días
      },
    });
    await prisma.abono.create({
      data: {
        clienteId: juan.id,
        monto: 50,
        usuarioId: yamile.id,
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
      },
    });
  }

  console.log('✅ Seed completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
