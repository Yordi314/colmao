# Documento Técnico — Colmao
### Sistema de Punto de Venta y Gestión para Colmados Dominicanos

**Proyecto:** Colmao
**Asignatura:** Proyecto Integrador II
**Equipo:** Grupo Dos — Yordi Polanco Pujols
**Tipo de documento:** Documentación técnica del proyecto (evidencia de proceso y arquitectura)
**Versión:** Final

---

## Tabla de contenido

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [El problema y el cliente](#2-el-problema-y-el-cliente)
3. [Modelo de negocio](#3-modelo-de-negocio)
4. [Decisiones de diseño (razonamiento)](#4-decisiones-de-diseño-razonamiento)
5. [Arquitectura del sistema](#5-arquitectura-del-sistema)
6. [Stack tecnológico y justificación](#6-stack-tecnológico-y-justificación)
7. [Patrones de diseño aplicados](#7-patrones-de-diseño-aplicados)
8. [Modelo de datos](#8-modelo-de-datos)
9. [Módulos funcionales](#9-módulos-funcionales)
10. [Lógica de negocio: ITBIS, redondeo y cobro](#10-lógica-de-negocio-itbis-redondeo-y-cobro)
11. [Seguridad](#11-seguridad)
12. [Calidad de software y experiencia de usuario](#12-calidad-de-software-y-experiencia-de-usuario)
13. [Despliegue](#13-despliegue)
14. [Conocimientos de la carrera integrados](#14-conocimientos-de-la-carrera-integrados)
15. [Limitaciones y trabajo futuro](#15-limitaciones-y-trabajo-futuro)
16. [Acceso al demo](#16-acceso-al-demo)

---

## 1. Resumen ejecutivo

**Colmao** es un sistema web full-stack de punto de venta (POS) y gestión, diseñado específicamente para las necesidades reales de un **colmado dominicano**. A diferencia de un POS genérico, Colmao incorpora las prácticas propias de este tipo de negocio: el **fiado** (crédito informal a clientes), la **venta al detalle** (por libras o unidades sueltas), el cobro en efectivo con **precios redondos e ITBIS incluido**, y la **facturación en formato dominicano**.

Además de operar las ventas, el sistema convierte los datos del negocio en **inteligencia accionable** para el dueño: qué productos reabastecer, a quién cobrarle el fiado, qué inventario no está rotando y cuál fue el cierre del día.

El sistema fue construido como prototipo funcional, desplegado en línea y accesible públicamente mediante una demostración.

---

## 2. El problema y el cliente

### El problema

En República Dominicana, los colmados son un pilar del comercio de barrio, pero la mayoría opera de manera empírica:

- Las ventas se registran en libreta o de memoria.
- El **fiado** se lleva en un cuaderno, con riesgo de pérdida o error.
- No hay visibilidad de **qué productos rotan**, cuáles generan más margen ni cuáles están por agotarse.
- Las decisiones de compra y reabastecimiento se toman por intuición.

Esto se traduce en pérdidas: quiebres de stock en productos de alta demanda, inventario inmovilizado (dinero detenido) y fiados que no se cobran.

### El cliente

- **Usuario principal:** el dueño del colmado y su cajero.
- **Perfil:** personas de aproximadamente 40 a 65 años, con alfabetización digital media-baja.
- **Contexto de uso:** el mostrador del colmado, con prisa, a veces poca luz, y trabajando desde un **teléfono o tablet económica**, no una computadora.
- **Tarea crítica:** registrar y cobrar una venta en pocos segundos, incluyendo la posibilidad de fiado.

Esta comprensión del usuario fue el punto de partida de todo el diseño: el sistema no se organizó alrededor de las tablas de la base de datos, sino alrededor de la tarea real del colmadero.

---

## 3. Modelo de negocio

Colmao se plantea como un producto **SaaS (Software como Servicio) B2B**, con suscripción por colmado:

- **Plan gratuito:** funcionalidades básicas de punto de venta e inventario.
- **Plan de pago (Pro):** analítica avanzada, recomendaciones y reportes.

El modelo se apoya en un costo de infraestructura bajo (herramientas de código abierto y gratuitas) y en el valor diferencial de la inteligencia de negocio, que es lo que justifica la suscripción.

---

## 4. Decisiones de diseño (razonamiento)

Esta sección documenta el **porqué** de las decisiones clave, no solo el qué. Cada una responde a una característica real del usuario o del negocio.

| Decisión | Justificación |
|----------|---------------|
| La pantalla de inicio del cajero es el **Punto de Venta**, no un dashboard | La tarea crítica es cobrar rápido; mostrar métricas primero añade fricción innecesaria. |
| Módulo de **Fiado** | El crédito informal es central en la cultura del colmado dominicano; sin él, el sistema no serviría para el negocio real. |
| **Venta al detalle** (libras, unidades sueltas) | Un colmado vende "media libra de salami" o "un cigarrillo", no empaques cerrados; forzar unidades enteras rompería el uso real. |
| **ITBIS incluido en el precio** y **total redondeado al peso** | En la calle, los precios son finales y redondos; nadie cobra RD$147.34 porque no se usan centavos. |
| **Calculadora de vuelto** con botones de billetes | El error grave es dar mal el cambio; el sistema lo previene calculándolo al instante. |
| **Productos frecuentes** | La mayoría de las ventas son pocos productos repetidos; tenerlos a un toque acelera el flujo. |
| Diseño **mobile-first**, alto contraste y botones grandes | El usuario trabaja desde el teléfono, tiene 40–65 años y opera en un mostrador con poca luz. |
| **Dashboard orientado a acción** | El dueño necesita decidir (qué comprar, a quién cobrar), no ver gráficas decorativas. |

Un principio guía fue: *si se oculta el logotipo, el sistema debe seguir siendo reconociblemente un POS de colmado dominicano* (por el fiado, la venta al detalle y los productos locales), no una plantilla genérica.

---

## 5. Arquitectura del sistema

Colmao sigue una **arquitectura full-stack en capas**, con separación clara de responsabilidades:

```
[ Frontend React ]  ── HTTPS / JSON ──►  [ API REST (Express) ]
                                              │
                                         Controladores
                                              │
                                         Servicios  (Facade) ── Observer, Strategy
                                              │
                                         Repositorios (Prisma ORM)
                                              │
                                         [ Base de datos SQLite ]
```

- El **frontend** (React) es la capa de presentación; no contiene lógica de negocio sensible.
- El **backend** (Express) expone una API REST, valida las solicitudes y concentra la lógica de negocio.
- La capa de **servicios** actúa como fachada (Facade) coordinando las operaciones.
- **Prisma** (ORM) media el acceso a la base de datos, lo que permite trabajar con tipos seguros y facilita una futura migración a PostgreSQL.

En producción, el backend también **sirve el frontend ya compilado**, de modo que todo el sistema corre como un único servicio.

---

## 6. Stack tecnológico y justificación

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | **React 18 + TypeScript** | React es el estándar de la industria y permite componentes reutilizables; TypeScript añade tipado estático que reduce errores. |
| Bundler | **Vite** | Entorno de desarrollo rápido y build optimizado. |
| Estilos | **Tailwind CSS** | Sistema de utilidades que agiliza un diseño consistente y responsivo. |
| Backend | **Node.js + Express + TypeScript** | Mismo lenguaje en front y back (menor fricción), y Express es ligero y directo para construir APIs REST. |
| ORM | **Prisma** | Acceso a datos con tipos seguros y migraciones; desacopla el código de la base y permite cambiar de motor sin reescribir la lógica. |
| Base de datos | **SQLite** | Simplicidad para un prototipo; sin servidor aparte. El diseño permite migrar a PostgreSQL en producción. |
| Gráficos | **Recharts** | Librería de gráficos declarativa para el dashboard. |
| Iconografía | **lucide-react** | Familia de iconos consistente. |
| Autenticación | **JSON Web Tokens (JWT) + bcrypt** | Estándar para sesiones sin estado; bcrypt para el hasheo seguro de contraseñas. |
| Despliegue | **Render** | Plataforma que corre Node y sirve la app públicamente, integrada con GitHub. |
| Control de versiones | **Git / GitHub** | Versionado y evidencia del proceso de desarrollo. |

---

## 7. Patrones de diseño aplicados

El sistema aplica tres patrones de diseño clásicos (catálogo GoF), cada uno resolviendo un problema real de la arquitectura:

- **Facade (estructural).** Cada operación de negocio se expone como un servicio de alto nivel (por ejemplo, el registro de una venta) que coordina internamente la validación, el inventario, el fiado y la persistencia. Los controladores solo invocan la fachada, sin conocer la complejidad interna. **Ventaja:** simplifica los controladores y centraliza la coordinación.

- **Observer (comportamiento).** Cuando cambia el stock de un producto (por una venta o un ajuste), el módulo de inventario notifica a sus observadores, que recalculan las **alertas de stock**. **Ventaja:** desacopla la lógica de ventas de las reacciones, permitiendo añadir nuevos avisos sin modificar el flujo de venta.

- **Strategy (comportamiento).** Las **recomendaciones de reabastecimiento** se calculan mediante estrategias intercambiables (por ejemplo, por ritmo de venta). **Ventaja:** permite agregar o cambiar algoritmos de recomendación sin tocar el resto del sistema.

---

## 8. Modelo de datos

Las entidades principales del sistema:

| Entidad | Descripción |
|---------|-------------|
| **rol** | Rol de usuario: `dueno` o `cajero`. |
| **usuario** | Usuario del sistema: nombre, correo, contraseña hasheada, rol. |
| **categoria** | Categoría de producto (Abarrotes, Bebidas, Lácteos, etc.), con emoji y color. |
| **producto** | Producto: nombre, categoría, precio (final, ITBIS incluido), stock, stock mínimo, unidad (`unidad`/`libra`), `permite_detalle` (venta fraccionada), `es_frecuente`, imagen. |
| **cliente** | Cliente de fiado: nombre, teléfono, estado (activo/inactivo). |
| **venta** | Venta: fecha, cajero, cliente (si es fiado), tipo de pago, subtotal, ITBIS, total, monto recibido, cambio, número de factura y NCF. |
| **venta_item** | Línea de venta: producto, nombre (histórico), precio unitario, cantidad (admite decimales para libras), importe. |
| **abono** | Pago de un cliente hacia su fiado. |
| **movimiento_inventario** | Auditoría de cambios de stock (venta, ajuste, entrada). |

El **saldo de fiado** de un cliente es un valor **derivado** (suma de ventas a crédito menos suma de abonos), calculado por consulta para evitar inconsistencias. Las relaciones garantizan la integridad: una venta a fiado exige cliente, el descuento de inventario ocurre en una transacción, y no se elimina un cliente con historial (se desactiva).

---

## 9. Módulos funcionales

### Landing y acceso demo
Página pública de presentación con un botón de acceso a la demostración, que inicia sesión automáticamente como usuario demo. Muestra un aviso de "modo demostración".

### Autenticación
Inicio de sesión con correo y contraseña. Roles diferenciados: el **cajero** accede al POS y al fiado; el **dueño** accede además a inventario (edición), anulaciones y dashboard.

### Punto de Venta (POS)
El corazón del sistema, diseñado para ventas rápidas:
- Buscador de productos y pestaña de **frecuentes**.
- Catálogo en tarjetas grandes con imagen, precio y estado de stock.
- **Carrito persistente**; en móvil, un botón flotante abre un panel deslizable.
- **Venta al detalle** (cantidades fraccionadas por libra, con botones ½, 1, 2 lb).
- Cálculo automático de subtotal, ITBIS y total.
- **Cobro en efectivo** con botones de billetes rápidos y cálculo de vuelto, o **cobro a fiado** seleccionando cliente.
- Descuento de inventario en transacción al cobrar.

### Facturación
Al completar una venta se genera una **factura en formato dominicano**: encabezado del negocio, RNC, NCF ("Consumidor Final"), fecha, cajero, número de factura, detalle de ítems, base imponible, ITBIS desglosado y total. Es **imprimible** (formato tipo ticket) y **reconsultable** desde el módulo Ventas / Facturas.

### Fiado
Gestión del crédito de clientes: lista con saldos, detalle con historial de cargos (rojo) y abonos (verde), registro de abonos, y creación/eliminación de clientes (con desactivación protegida cuando hay historial).

### Inventario
Gestión de productos y stock: alta y edición de productos, ajuste de stock con auditoría, y alertas de stock bajo/crítico. Restringido al dueño.

### Dashboard (inteligencia de negocio)
El diferenciador del sistema. Cada elemento habilita una decisión:
- **KPIs del día** (ingresos, fiado, tickets, ticket promedio) con comparación vs. el día anterior.
- **Qué comprar:** recomendaciones de reabastecimiento según el ritmo de venta.
- **A quién cobrar:** fiados con mayor antigüedad de deuda.
- **Plata muerta:** productos sin rotación y el dinero inmovilizado.
- **Patrón de ventas** y **cierre de caja** del día (efectivo vs. fiado).

---

## 10. Lógica de negocio: ITBIS, redondeo y cobro

Uno de los aspectos más cuidados por su relevancia cultural y contable:

- **El precio del producto es el precio final**, con el ITBIS (18%) **ya incluido**. El subtotal de la venta es la suma directa de precios; no se agrega impuesto por encima.
- **El total se redondea al peso entero más cercano**, porque en República Dominicana no se manejan centavos en efectivo.
- En la **factura**, el ITBIS se desglosa "hacia atrás" a partir del total redondeado: `base = total ÷ 1.18` e `ITBIS = total − base`. De este modo siempre se cumple **Base + ITBIS = Total**, sin descuadres, y el recibo respeta el formato fiscal dominicano.
- En el **cobro en efectivo**, botones de billetes comunes (RD$50, 100, 200, 500, 1000) y un botón "Exacto" calculan el vuelto al instante, sin centavos.

---

## 11. Seguridad

- **Autenticación con JWT:** el usuario inicia sesión y recibe un token firmado que acompaña cada solicitud; el backend lo valida en cada petición.
- **Contraseñas hasheadas con bcrypt:** nunca se almacenan en texto plano.
- **Control de acceso por roles (RBAC):** middleware que restringe rutas según el rol (dueño vs. cajero).
- **Validación en el servidor:** toda entrada se valida en el backend, no solo en el frontend.
- **Secretos por variable de entorno:** la clave de firma de los tokens (`JWT_SECRET`) se lee del entorno, nunca se escribe en el código del repositorio.
- **Transacciones:** el registro de venta y el descuento de inventario ocurren de forma atómica (todo o nada).

---

## 12. Calidad de software y experiencia de usuario

- **Tipado estático** con TypeScript en todo el dominio.
- **Componentes reutilizables** y estructura de carpetas por dominio.
- **Estados de interfaz** manejados en cada pantalla: vacío, cargando, error y éxito, no solo el "caso feliz".
- **Diseño accesible:** alto contraste, objetivos táctiles grandes, texto legible y estados que no dependen solo del color.
- **Responsividad real (mobile-first):** en teléfono el carrito es un panel deslizable y la navegación una barra inferior; en escritorio, columnas fijas.
- **Formato consistente** de moneda (RD$) y de la lógica de ITBIS en todo el sistema.
- **Control de versiones** con Git y desarrollo por fases.

---

## 13. Despliegue

El sistema está desplegado en **Render** como un único servicio web:

- El proceso de build instala dependencias, genera el cliente de Prisma, compila el backend y el frontend, y deja el backend sirviendo el frontend compilado.
- Al arrancar, se crean las tablas y se ejecuta un **seed idempotente** que carga datos de demostración (productos, clientes, ventas históricas), de modo que la demo siempre tenga contenido.
- El acceso es público mediante una URL, con un botón de demostración que no requiere registrarse.

*Nota: al usar el plan gratuito, la aplicación se "duerme" tras inactividad, por lo que la primera carga puede tardar algunos segundos.*

---

## 14. Conocimientos de la carrera integrados

Este proyecto integra conocimientos de distintas áreas de la carrera:

- **Análisis y diseño de sistemas:** definición del usuario, sus necesidades y la tarea crítica antes de implementar.
- **Ingeniería de software:** arquitectura en capas, patrones de diseño y separación de responsabilidades.
- **Bases de datos:** modelo entidad-relación, normalización, relaciones e integridad referencial mediante un ORM.
- **Redes:** comunicación cliente-servidor por HTTP/REST y despliegue en la nube.
- **Seguridad:** autenticación, cifrado de contraseñas y control de acceso por roles.
- **Calidad de software:** manejo de estados, validaciones, accesibilidad y diseño responsivo.
- **Gestión de proyectos:** desarrollo por fases, control de versiones y documentación.
- **Arquitectura de software:** diseño de la solución en capas con patrones reconocidos.

---

## 15. Limitaciones y trabajo futuro

Al tratarse de un prototipo, existen aspectos deliberadamente fuera de alcance que se abordarían en una versión productiva:

- **Migración a PostgreSQL** para persistencia robusta en producción (el diseño con Prisma ya lo facilita).
- **Motor de recomendaciones más profundo** con datos históricos extensos y el tier Pro de analítica.
- **Modo sin conexión** para colmados con conectividad intermitente.
- **Multi-sucursal / multi-tenant** para cadenas de colmados.
- **Integración de pagos electrónicos** y reportes fiscales formales.

---

## 16. Acceso al demo

**URL del sistema:** _(agregar el enlace del despliegue en Render)_

**Credenciales de prueba:**

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Dueño | ramon@colmado.do | _(ver seed)_ |
| Cajero | yamile@colmado.do | _(ver seed)_ |

También disponible el botón **"Probar demo"** en la página de inicio, que da acceso directo sin credenciales.
