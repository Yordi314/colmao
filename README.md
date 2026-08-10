# Colmao 🛒

---

## 👥 Equipo
- Yordi Polanco Pujols
- Yohanna Diaz
- Erick Betances

---

**El punto de venta hecho para el colmado dominicano.**

Colmao es un sistema web full-stack de punto de venta y gestión, diseñado
específicamente para las necesidades reales de un colmado en República
Dominicana: ventas rápidas, fiado, venta al detalle por libras, facturación
en formato dominicano e inteligencia de negocio para el dueño.

> ⚠️ Proyecto académico — Proyecto Integrador II. Las imágenes de marcas y los
> datos de facturación (NCF/RNC) son de demostración.

---

## ✨ Características

- **Punto de Venta** — Búsqueda rápida, productos frecuentes, carrito
  persistente y cobro en segundos. Optimizado para teléfono y tablet.
- **Venta al detalle** — Productos vendidos por libras o fracciones (arroz,
  habichuelas, salami, queso), como en un colmado real.
- **Fiado** — Manejo de crédito de clientes: cuentas, saldos y abonos.
- **Cobro dominicano** — Precios finales con ITBIS incluido, totales
  redondeados al peso y botones de billetes rápidos para calcular el vuelto.
- **Facturación** — Recibo en formato dominicano (RNC, NCF, base imponible e
  ITBIS desglosado), imprimible y reconsultable.
- **Inventario** — Productos, stock, ajustes y alertas de stock bajo.
- **Dashboard inteligente** — No solo métricas: recomendaciones de qué
  comprar, a quién cobrar, inventario inmovilizado ("plata muerta"),
  patrones de venta y cierre de caja del día.
- **Roles** — Dueño y cajero, con permisos diferenciados.

---

## 🛠️ Stack tecnológico

| Capa       | Tecnología                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18 · TypeScript · Vite · Tailwind CSS       |
| Backend    | Node.js · Express · TypeScript · Prisma           |
| Base de datos | SQLite (Prisma ORM)                            |
| Gráficos   | Recharts                                          |

**Patrones de diseño aplicados:** Facade (servicios), Observer (alertas de
stock) y Strategy (recomendaciones de reabastecimiento).

---

## 🚀 Cómo ejecutarlo localmente

### Requisitos previos
- Node.js 18 o superior
- npm

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/colmao.git
cd colmao
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # revisa las variables de entorno
npx prisma migrate dev    # crea la base de datos
npx prisma db seed        # carga los datos de demostración
npm run dev               # arranca el backend
```

### 3. Frontend
```bash
cd ../frontend
npm install
npm run dev               # arranca el frontend
```

La aplicación queda disponible en `http://localhost:8080` (o el puerto que
indique la consola).

---

## 👤 Credenciales de prueba

| Rol    | Correo                | Contraseña |
|--------|-----------------------|------------|
| Dueño  | ramon@colmado.do      | Ramon123! |
| Cajero | yamile@colmado.do     | Yamile123! |

O usa el botón **"Probar demo"** en el landing para entrar directo, sin
credenciales.

---

## 📸 Capturas

<img width="1916" height="992" alt="image" src="https://github.com/user-attachments/assets/265fb789-a055-49c2-bf39-d19007fcc71b" />

<img width="1918" height="989" alt="image" src="https://github.com/user-attachments/assets/ff3fcd1e-465f-4de5-9079-e243ab35a5c9" />

<img width="1917" height="991" alt="image" src="https://github.com/user-attachments/assets/db231652-b4d9-4c5c-a748-352dae7495ac" />

<img width="1918" height="990" alt="image" src="https://github.com/user-attachments/assets/78662045-1aab-473d-9cbe-93f1b2334bdb" />

<img width="1916" height="992" alt="image" src="https://github.com/user-attachments/assets/b2ea8c5c-f578-4ca0-a696-45ca96ef1cc8" />

<img width="1919" height="990" alt="image" src="https://github.com/user-attachments/assets/9eceea66-6f39-4230-9f64-f5b2455093a1" />




