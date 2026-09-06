# Serviqa: Vehicle Maintenance Management System

Serviqa is a production-grade Single Page Application (SPA) designed to digitize and streamline operations for auto repair shops. Built to demonstrate architectural maturity, this capstone project emphasizes scalable state management, rigorous accessibility compliance, and a comprehensive automated testing pipeline.

## Table of Contents
*   [System Architecture](#system-architecture)
*   [Core Features & Engineering Solutions](#core-features--engineering-solutions)
*   [Accessibility & Responsive UI](#accessibility--responsive-ui)
*   [Testing Infrastructure](#testing-infrastructure)
*   [Project Structure](#project-structure)
*   [Local Development](#local-development)
*   [Deployment Strategy](#deployment-strategy)

---

## System Architecture

Serviqa adheres to a customized **Model-View-ViewModel (MVVM)** pattern adapted for React, ensuring strict separation of concerns between UI rendering, business logic, and API communication.

| Layer | Implementation | Responsibility |
| :--- | :--- | :--- |
| **View** | React Functional Components | Handles DOM rendering, CSS Modules styling, and capturing user interactions. |
| **ViewModel** | Custom React Hooks (`useVehicles`, `useClients`) | Manages local state, forms, and orchestrates mutations. |
| **Model** | Firebase Services (`authService`, `jobService`) | Abstracts external API calls, database schema logic, and data fetching. |
| **State** | React Query (`queryClient.ts`) | Caches server state, manages loading/error UI states, and deduplicates network requests. |

---

## Core Features & Engineering Solutions

*   **Relational Data Mapping:** Implemented chained dropdown logic in `JobModal.tsx`. The system queries the `Clients` array, then dynamically filters the `Vehicles` array to ensure mechanics can only assign jobs to vehicles explicitly owned by the selected client.
*   **Real-Time Analytics Dashboard:** The `Dashboard.tsx` component aggregates arrays of jobs and inventory to compute live operational metrics, including pending revenue calculations and kanban pipeline distribution.
*   **AI Assistant Integration:** Includes an integrated context-aware AI assistant (`AiAssistant.tsx`) to aid mechanics with diagnostic queries or parts lookup.
*   **Secure Authentication Gateway:** Protected routes are guarded by an `AuthContext` provider that evaluates Firebase authentication state before allowing access to the dashboard.

---

## Accessibility & Responsive UI

The UI is built from scratch using pure CSS Modules, intentionally avoiding component libraries to demonstrate deep CSS architecture capabilities.

*   **CSS Grid & Flexbox:** The application layout utilizes a responsive CSS Grid (`DashboardLayout.module.css`) that gracefully transitions into an off-canvas mobile sidebar (`transform: translateX`) for smaller viewports.
*   **Mobile-First Tables:** Data-heavy routes (`Clients`, `Jobs`, `Vehicles`, `Inventory`) employ horizontal scroll wrappers to prevent viewport stretching on mobile devices.
*   **Strict W3C ARIA Compliance:** All interactive elements, custom modals, and forms are fully accessible. Inputs are explicitly bound via `htmlFor` and `id` attributes, ensuring total compatibility with screen readers and keyboard-only navigation. Evaluated and verified via WAVE audits.
*   **Error Boundaries:** A `GlobalErrorBoundary` component catches unexpected JavaScript errors anywhere in the component tree, preventing blank-screen crashes and presenting a fallback UI.

---

## Testing Infrastructure

The repository implements a robust, multi-tiered testing pyramid to guarantee relational logic and UI stability.

*   **Unit & Integration Testing (Vitest + React Testing Library):** 
    *   Validates component rendering and complex UI interactions (e.g., chained dropdowns).
    *   Utilizes a custom `renderWithProviders` wrapper to supply necessary React Query and Context wrappers during isolated test runs.
    *   API hooks are strictly mocked using Vitest's `vi.mock()` to test logic without touching the live Firebase instance.
*   **End-to-End Testing (Playwright):** 
    *   Automates headless browser testing for critical user journeys.
    *   Verifies the complete login flow, ensuring that valid credentials successfully route the user through the authentication gateway and load the protected dashboard.

---

## Project Structure

The codebase is organized by **Features** rather than strictly by file type, reducing cognitive load when scaling the application.

*   `/src/features/*`: Contains domain-specific logic (`auth`, `clients`, `jobs`, `vehicles`, `inventory`, `ai`). Each feature module acts as its own ecosystem with dedicated `api`, `components`, and `types` folders.
*   `/src/layouts/*`: Global structural components (`Sidebar`, `Header`, `DashboardLayout`).
*   `/src/pages/*`: Top-level route components that compose features together.
*   `/src/test-utils/*`: Shared testing mocks and provider wrappers.

---

## Local Development

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   A Firebase project with Authentication and Firestore enabled.

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AbdulrahmanBassem/Serviqa.git](https://github.com/AbdulrahmanBassem/Serviqa.git)
    cd serviqa
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env.local` file in the root directory and populate it with your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id

    VITE_GEMINI_API_KEY=your_api_key
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
5.  **Run the test suite:**
    ```bash
    npm run test       # Runs Vitest unit/integration tests
    ```

---

## Deployment Strategy

Serviqa is deployed continuously via **Vercel**. 

To handle React Router's client-side routing, the repository includes a root `vercel.json` file. This configuration catches all incoming route requests and rewrites them to `index.html`. This ensures that hard refreshes or direct navigation to routes like `/dashboard` or `/clients` resolve correctly without throwing 404 errors from the Vercel edge servers.