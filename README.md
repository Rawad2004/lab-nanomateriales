<div align="center">

# 🧪 Lab Nanomateriales

### Sistema de Gestión de Laboratorio de Síntesis de Nanomateriales

**Aplicación Web Full-Stack para gestión de inventario, equipamiento y órdenes de síntesis**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[Demo](#) · [Documentación API](#-documentación-de-la-api) · [Roadmap](#%EF%B8%8F-roadmap) · [Reportar Bug](https://github.com/Rawad2004/lab-nanomateriales/issues)

---

</div>

## 📖 Sobre el Proyecto

**Lab Nanomateriales** es una plataforma SPA + REST API que digitaliza la operación completa de un laboratorio de síntesis y caracterización de nanomateriales. Sustituye procesos manuales (planillas, hojas de cálculo dispersas) por un sistema centralizado con control de roles, trazabilidad de órdenes de producción y validación automatizada de reglas de negocio.

> **Contexto académico:** proyecto integrador de la materia *Desarrollo de Aplicaciones Web* — Tecnológico de Antioquia, semestre 2026-1. Entrega final: **19 de mayo de 2026**.

### 🎯 Problema que resuelve

Un laboratorio de nanomateriales necesita controlar simultáneamente:
- Inventario de **reactivos químicos** (con vencimientos y stock mínimo)
- **Equipamiento** disponible y su mantenimiento
- **Catálogo de nanomateriales** que produce
- **Órdenes de síntesis** que consumen reactivos y reservan equipos
- **Trazabilidad** de quién hizo qué y cuándo

Sin un sistema, esto se traduce en stock vencido sin detectar, órdenes que se aprueban sin verificar inventario, y conflictos por equipos doblemente asignados. La aplicación elimina estos riesgos con validaciones estrictas a nivel API.

---

## ✨ Funcionalidades Principales

### 🔐 Autenticación y Autorización
- Login con email + password (hash bcrypt)
- JWT con refresh implícito
- Roles diferenciados: **Administrador**, **Científico/Investigador**, **Operador de Inventario**
- Rutas protegidas por rol con guards a nivel API y frontend
- Sesión persistente en localStorage

### 🧴 Gestión de Reactivos Químicos
- CRUD completo con validación de tipos
- Alertas visuales de vencimiento próximo (≤ 30 días) y vencido
- Tracking de stock con descuento automático al completar órdenes
- Filtros por estado, fecha de vencimiento, búsqueda por nombre

### 🔬 Catálogo de Nanomateriales
- Listado con propiedades fisicoquímicas y aplicaciones
- Activación/desactivación (soft toggle) — solo activos pueden iniciar nuevas órdenes
- Vista de detalle con histórico de órdenes asociadas

### ⚙️ Control de Equipamiento
- Estados: `DISPONIBLE`, `EN_USO`, `MANTENIMIENTO`
- Alertas de próximo mantenimiento programado
- No se puede asignar equipo no disponible a una orden

### 📋 Órdenes de Síntesis (entidad central)
- Flujo de estado estricto: `BORRADOR → APROBADA → EN_PROCESO → COMPLETADA`
- Cancelación permitida solo desde `BORRADOR` o `APROBADA`
- Solo `ADMIN` puede aprobar o cancelar
- Validación automática al crear:
  - Nanomaterial debe estar activo
  - Stock suficiente y no vencido para todos los reactivos
  - Equipos asignados deben estar disponibles
- Descuento automático del inventario al completar

### 📊 Dashboard Resumen
- Vista consolidada del estado del laboratorio
- KPIs: reactivos por vencer, equipos en mantenimiento, órdenes activas
- Últimas órdenes con acceso rápido

---

## 🛠️ Stack Tecnológico

<table>
<tr>
<td><strong>Frontend</strong></td>
<td><strong>Backend</strong></td>
<td><strong>DevOps</strong></td>
</tr>
<tr>
<td>

- React 18 + Vite
- TypeScript
- React Router DOM v6
- Axios
- CSS Modules
- Context API

</td>
<td>

- NestJS 10
- TypeORM
- MySQL 8
- JWT + Passport
- bcrypt
- class-validator
- Swagger / OpenAPI

</td>
<td>

- Docker (MySQL local)
- ESLint + Prettier
- Conventional Commits
- GitHub PRs + branch protection
- Variables de entorno (.env)

</td>
</tr>
</table>

---

## 👥 Roles y Permisos

| Acción | Administrador | Científico | Operador |
|--------|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Ver inventario | ✅ | ✅ | ✅ |
| Crear/editar reactivos | ✅ | ❌ | ✅ |
| Ver/editar nanomateriales | ✅ | ❌ | ❌ |
| Crear órdenes de síntesis | ✅ | ✅ | ❌ |
| **Aprobar/cancelar órdenes** | ✅ | ❌ | ❌ |
| Avanzar estado (EN_PROCESO, COMPLETADA) | ✅ | ✅ | ❌ |
| Gestionar equipamiento | ✅ | ❌ | ✅ |
| Crear/desactivar usuarios | ✅ | ❌ | ❌ |

---

## 📁 Estructura del Monorepo

```
lab-nanomateriales/
├── backend/                      # API NestJS + MySQL
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/             # JWT, login, guards, roles
│   │   │   ├── users/            # CRUD usuarios (admin)
│   │   │   ├── reactivos/        # Inventario químico
│   │   │   ├── nanomateriales/   # Catálogo
│   │   │   ├── equipamiento/     # Equipos del laboratorio
│   │   │   ├── ordenes/          # Órdenes de síntesis (state machine)
│   │   │   └── dashboard/        # Endpoint de resumen
│   │   ├── common/               # Decorators, guards, filters compartidos
│   │   ├── database/             # Seed scripts, migraciones
│   │   ├── config/               # Configuración tipada
│   │   └── main.ts
│   ├── test/                     # Tests e2e
│   ├── docker-compose.yml        # MySQL local
│   ├── package.json
│   └── README.md
│
├── frontend/                     # SPA React + Vite
│   ├── src/
│   │   ├── components/           # UI reutilizable
│   │   ├── pages/                # Vistas (Dashboard, Login, Reactivos, etc.)
│   │   ├── services/             # Clientes Axios por módulo
│   │   ├── hooks/                # useAuth, useApi, etc.
│   │   ├── context/              # AuthContext
│   │   ├── types/                # Tipos compartidos con backend
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                         # Diagramas, decisiones de arquitectura
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Setup local

### Prerrequisitos
- Node.js 20+ (`nvm install 20 && nvm use 20`)
- Docker Desktop (para MySQL local sin instalar nada)
- Git

### 1️⃣ Clonar

```bash
git clone https://github.com/Rawad2004/lab-nanomateriales.git
cd lab-nanomateriales
```

### 2️⃣ Levantar MySQL con Docker

```bash
cd backend
docker compose up -d
```

Esto levanta MySQL 8 en `localhost:3306` con la base `lab_nanomateriales`. Credenciales en `docker-compose.yml`.

### 3️⃣ Backend

```bash
# (estás dentro de /backend)
cp .env.example .env       # ajustar credenciales si hace falta
npm install
npm run seed               # crea tablas + 3 usuarios + datos demo
npm run start:dev
```

✅ API en `http://localhost:3000/api`
📚 Swagger en `http://localhost:3000/api/docs`

### 4️⃣ Frontend

```bash
# en otra terminal, desde la raíz del monorepo
cd frontend
cp .env.example .env
npm install
npm run dev
```

✅ App en `http://localhost:5173`

### 🔑 Credenciales de prueba (post-seed)

| Rol | Email | Password |
|-----|-------|----------|
| Administrador | `admin@lab.test` | `Admin123!` |
| Científico | `cientifico@lab.test` | `Ciencia123!` |
| Operador | `operador@lab.test` | `Operador123!` |

---

## 📡 Documentación de la API

La API REST está auto-documentada con **Swagger UI**. Una vez corriendo el backend, abre `http://localhost:3000/api/docs` para explorarla interactivamente.

### Resumen de recursos

| Recurso | Endpoints | Auth |
|---------|-----------|:---:|
| `POST /api/auth/login` | Iniciar sesión, devuelve JWT | ❌ |
| `GET /api/auth/me` | Usuario autenticado actual | 🔐 |
| `/api/users` | CRUD usuarios | 🔐 ADMIN |
| `/api/reactivos` | CRUD inventario químico | 🔐 |
| `/api/nanomateriales` | CRUD catálogo | 🔐 |
| `/api/equipamiento` | CRUD equipos + cambio de estado | 🔐 |
| `/api/ordenes` | Crear, listar, detalle | 🔐 |
| `PATCH /api/ordenes/:id/estado` | Avanzar/cancelar orden (con validación) | 🔐 |
| `GET /api/dashboard/resumen` | KPIs consolidados | 🔐 |

### Códigos de respuesta

`200` OK · `201` Created · `400` Validación · `401` No autenticado · `403` Sin permisos · `404` No existe · `409` Conflicto de negocio · `500` Error servidor

### Reglas de negocio críticas (validadas en backend)

1. No se puede crear orden si nanomaterial está inactivo → `400`
2. No se puede crear orden con reactivo vencido o sin stock → `409`
3. Solo `ADMIN` puede aprobar/cancelar → `403`
4. Transiciones de estado fuera del flujo permitido → `409`
5. Asignar equipo no disponible → `409`
6. Al completar orden, el stock se descuenta atómicamente (transaction)

---

## 🌳 Workflow de Git

Trabajo con **trunk-based development** simplificado:

main (protegida) ← solo recibe merges vía PR
│
└── feat/nombre-corto         # nueva funcionalidad
└── fix/descripcion           # bugfix
└── docs/seccion              # documentación
└── refactor/area             # refactor sin cambio funcional
└── chore/tarea               # config, deps, build

Cada feature → rama nueva → PR → auto-revisión del diff → merge → delete branch.

**Convención de commits:** [Conventional Commits](https://www.conventionalcommits.org)

---

## 🗓️ Roadmap

- [x] Setup monorepo + repo en GitHub
- [ ] **Semana 1 (25 abr – 2 may):** Backend completo (auth, CRUD, órdenes, dashboard)
- [ ] **Semana 2 (3 – 9 may):** Frontend core (auth, layout, listas)
- [ ] **Semana 3 (10 – 16 may):** Frontend complejo (órdenes, dashboard, alertas)
- [ ] **17 – 19 may:** Testing E2E, README final, sustentación

📅 **Entrega final:** 19 de mayo 2026

---

## 🧪 Testing

```bash
# Backend
cd backend
npm run test              # unit tests
npm run test:e2e          # tests end-to-end
npm run test:cov          # coverage report
```

---

## 🚧 Mejoras futuras (post-entrega)

- [ ] Generación de reportes PDF de órdenes completadas
- [ ] Notificaciones por email al cambiar estado de orden
- [ ] Dashboard con gráficos (Chart.js / Recharts)
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Deploy a Railway/Render con CI/CD

---

## 👤 Autor

<div align="center">

**Rawad Yecith Muñoz Romero**
Estudiante de Ingeniería de Software — Tecnológico de Antioquia

[![GitHub](https://img.shields.io/badge/GitHub-Rawad2004-181717?style=flat-square&logo=github)](https://github.com/Rawad2004)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](#)

</div>

---

## 📝 Licencia

Distribuido bajo licencia MIT. Ver [`LICENSE`](LICENSE) para más información.

---

<div align="center">

⭐ **Si este proyecto te resultó útil, considera darle una estrella en GitHub** ⭐

</div>