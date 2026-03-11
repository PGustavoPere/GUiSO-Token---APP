# Arquitectura Técnica: Aplicación GUISO Token

## 🏗️ Visión General de Alto Nivel
La plataforma GUISO está construida como una **Aplicación de Página Única (SPA)** con una capa de **Backend Simulado (Mock)**, diseñada para ser fácilmente intercambiada por una infraestructura real de Web3/API.

## 🎨 Estructura del Frontend
Utilizamos una **Arquitectura Basada en Características (Features)** para asegurar que, a medida que la aplicación crezca, los módulos permanezcan desacoplados.

```text
src/
├── components/     # UI Compartida (Layout, Botones, Modales)
├── context/        # Estado Global (GuisoContext)
├── features/       # Módulos de Lógica de Negocio
│   ├── dashboard/  # Analíticas y Estadísticas
│   ├── impact/     # Proyectos Sociales y Lógica de Apoyo
│   └── profile/    # Datos del Usuario e Historial
├── services/       # Comunicación con API y Blockchain
└── types/          # Definiciones de TypeScript
```

## 🧠 Gestión de Estado (Motor SocialFi)
El núcleo de la experiencia "SocialFi" se gestiona a través del `GuisoProvider` (React Context).

### Variables de Estado:
- `balance`: Tokens GSO actuales disponibles para el usuario.
- `impactScore`: Puntos acumulados de acciones sociales.
- `history`: Array de todas las interacciones sociales previas.

### Flujo de Lógica:
1. El usuario activa `supportProject(amount)`.
2. El contexto valida `amount <= balance`.
3. El contexto actualiza el `balance` y calcula el `impactScore` (10% del monto).
4. La acción se añade al `history` y se persiste en `localStorage`.

## 📡 Backend y Escalabilidad
Actualmente, la aplicación utiliza un servidor **Express.js** para servir el frontend y proporcionar datos JSON simulados a través de rutas `/api`.

### Estrategia de Escalamiento:
1. **Base de Datos:** Reemplazar los arrays simulados con **PostgreSQL** para datos de usuario persistentes.
2. **Indexador Web3:** Implementar un servicio (como Subgraph o un oyente personalizado de Node.js) para rastrear transacciones GSO on-chain.
3. **Autenticación:** Transición de conexión simulada a **SIWE (Sign-In with Ethereum)**.

## 💅 Estilo e Interfaz de Usuario
- **Tailwind CSS 4:** Utilizado para estilos basados en utilidades con un tema personalizado definido en `index.css`.
- **Motion:** Maneja todas las transiciones y animaciones de modales para proporcionar una sensación de "App nativa" premium.
- **Glassmorphism:** Un lenguaje de diseño consistente que utiliza `backdrop-blur` y fondos semitransparentes para evocar una estética moderna de Web3.
