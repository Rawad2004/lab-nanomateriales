# 🔬 Laboratorio de Nanomateriales

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

**Sistema SPA + REST API para gestión del laboratorio de nanomateriales**

[📚 Documentación](https://github.com/Rawad2004/lab-nanomateriales/wiki) • [🚀 Deploy](#) • [📧 Contacto](mailto:rawad@example.com)

</div>

---

## 📋 Descripción del Proyecto

Este proyecto es una **Aplicación Web Full Stack** desarrollada como requisito para la sustentación del proyecto universitario del Laboratorio de Nanomateriales.

La aplicación permite:

- ✅ **Gestión de Usuarios** - Registro, login y autenticación JWT
- ✅ **Administración de Muestras** - CRUD completo de nanomuestras
- ✅ **Registro de Experimentos** - Seguimiento de experimentos realizados
- ✅ **Almacenamiento de Resultados** - Datos y métricas de experimentos
- ✅ **Generación de Reportes** - Informes automáticos en PDF

---

## 🛠️ Tecnologías

### Frontend

| Tecnología | Propósito |
|------------|-----------|
| React 18 | Biblioteca de UI |
| Vite | Build tool y servidor de desarrollo |
| TypeScript | Tipado estático |
| React Router | Navegación entre páginas |
| Axios | Cliente HTTP para API |
| CSS Modules | Estilos modulares |

### Backend

| Tecnología | Propósito |
|------------|-----------|
| NestJS | Framework Node.js |
| TypeORM | ORM para base de datos |
| SQLite | Base de datos embebida |
| JWT | Autenticación stateless |
| Passport | Middleware de autenticación |
| Swagger | Documentación automática de API |

---

## 📁 Estructura del Proyecto

```
lab-nanomateriales/
│
├── 📂 frontend/                 # Aplicación React
│   ├── 📂 src/
│   │   ├── 📂 components/      # Componentes reutilizables
│   │   ├── 📂 pages/           # Páginas de la app
│   │   ├── 📂 services/        # Servicios API
│   │   ├── 📂 hooks/           # Custom React hooks
│   │   ├── 📂 types/           # Tipos TypeScript
│   │   ├── App.tsx             # Componente principal
│   │   └── main.tsx            # Punto de entrada
│   ├── package.json
│   └── vite.config.ts
│
├── 📂 backend/                  # API NestJS
│   ├── 📂 src/
│   │   ├── 📂 modules/
│   │   │   ├── 📂 auth/        # Módulo de autenticación
│   │   │   ├── 📂 users/       # Módulo de usuarios
│   │   │   ├── 📂 samples/     # Módulo de muestras
│   │   │   ├── 📂 experiments/ # Módulo de experimentos
│   │   │   └── 📂 reports/     # Módulo de reportes
│   │   ├── 📂 entities/       # Entidades TypeORM
│   │   ├── 📂 config/          # Configuración
│   │   └── main.ts             # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
│
└── 📄 README.md                 # Este archivo
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- Git

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Rawad2004/lab-nanomateriales.git
cd lab-nanomateriales
```

### Paso 2: Configurar el Backend

```bash
# Entrar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run start:dev
```

> 🟢 **Backend disponible en:** `http://localhost:3000`
> 📚 **Swagger (documentación):** `http://localhost:3000/api`

### Paso 3: Configurar el Frontend

```bash
# Abrir nueva terminal y entrar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

> 🔵 **Frontend disponible en:** `http://localhost:5173`

---

## 📌 Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/profile` | Obtener perfil del usuario |

### Muestras

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/samples` | Listar todas las muestras |
| GET | `/samples/:id` | Obtener muestra por ID |
| POST | `/samples` | Crear nueva muestra |
| PUT | `/samples/:id` | Actualizar muestra |
| DELETE | `/samples/:id` | Eliminar muestra |

### Experimentos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/experiments` | Listar experimentos |
| POST | `/experiments` | Crear experimento |
| PUT | `/experiments/:id` | Actualizar experimento |

*(Swagger tiene la lista completa)*

---

## 📸 Capturas de Pantalla

<div align="center">

### Login
![Login](https://placehold.co/800x400/1a1a2e/white?text=Pantalla+de+Login)

### Dashboard
![Dashboard](https://placehold.co/800x400/1a1a2e/white?text=Dashboard+Principal)

### Gestión de Muestras
![Samples](https://placehold.co/800x400/1a1a2e/white?text=Gestión+de+Muestras)

</div>

---

## 🔐 Autenticación JWT

El sistema usa **JWT (JSON Web Tokens)** para autenticación.

### Cómo funciona:

1. El usuario hace login con email y contraseña
2. El servidor devuelve un token JWT
3. El cliente guarda el token (localStorage)
4. En cada request protegida, se envía el token en el header:
   ```
   Authorization: Bearer <token>
   ```

### Ejemplo de Request:

```javascript
const response = await axios.get('http://localhost:3000/samples', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## 🗓️ Cronograma de Desarrollo

| Semana | Actividad |
|--------|-----------|
| Semana 1 | Setup + React Fundamentos |
| Semana 2 | React Intermedio (useState, Router, Axios) |
| Semana 3 | NestJS + Auth JWT + Primera Entidad |
| Semana 4 | Entidades completas + Integración |
| Semana 5 | Pruebas + Pulido + Sustentación |

**📅 Fecha de Entrega:** 19 de Mayo 2026

---

## 👤 Autor

<div align="center">

**Rawad Muñoz**

Estudiante de Ingeniería de Software

📧 rawad@example.com | 🐱 @Rawad2004

</div>

---

## 📝 Licencia

MIT License - Ver archivo `LICENSE` para más detalles.

---

<div align="center">

⭐️ **Si te gusta este proyecto, dale una estrella en GitHub!** ⭐️

</div>