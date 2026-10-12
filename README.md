# Serviqa — Auto Repair & Workshop Intelligence SaaS

[![Live Demo](https://img.shields.io/badge/Live_Demo-serviqa.vercel.app-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://serviqa.vercel.app/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Firebase](https://img.shields.io/badge/Firebase_12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_1.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vitest](https://img.shields.io/badge/Vitest_4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

> **Serviqa** is an enterprise-grade cloud operating system designed for modern automotive repair facilities, independent service shops, and fleet maintenance teams. It unites real-time bay dispatching, customer fleet tracking, parts inventory valuation, calendar scheduling, official PDF invoicing, and live database-grounded AI vehicle diagnostics into a cohesive, responsive web platform.

---

## 📋 Table of Contents

- [Overview & Purpose](#-overview--purpose)
- [Problems Solved](#-problems-solved)
- [Core Features Walkthrough](#-core-features-walkthrough)
  - [1. Executive Workshop Dashboard](#1-executive-workshop-dashboard)
  - [2. Kanban Repair Dispatch Board](#2-kanban-repair-dispatch-board)
  - [3. Customer Fleet & Client Directory](#3-customer-fleet--client-directory)
  - [4. Vehicle Fleet Intelligence](#4-vehicle-fleet-intelligence)
  - [5. Parts Inventory & Stock Valuation](#5-parts-inventory--stock-valuation)
  - [6. Service Calendar & Weekly Dispatch](#6-service-calendar--weekly-dispatch)
  - [7. Mechanic AI Copilot (Powered by Gemini)](#7-mechanic-ai-copilot-powered-by-gemini)
  - [8. Digital Invoice & Vehicle Handover Receipt](#8-digital-invoice--vehicle-handover-receipt)
  - [9. Modern Acrylic Modal Architecture](#9-modern-acrylic-modal-architecture)
- [User Guide (How to Use Serviqa)](#-user-guide-how-to-use-serviqa)
- [Technical Architecture](#-technical-architecture)
  - [MVVM Architectural Pattern](#mvvm-architectural-pattern)
  - [Feature-Sliced Project Structure](#feature-sliced-project-structure)
  - [Database Schemas & Firestore Models](#database-schemas--firestore-models)
  - [Design System & Typography Tokens](#design-system--typography-tokens)
  - [Accessibility & WCAG Compliance](#accessibility--wcag-compliance)
- [Local Development Setup](#-local-development-setup)
- [Testing Infrastructure](#-testing-infrastructure)
- [Deployment Strategy](#-deployment-strategy)

---

## 🎯 Overview & Purpose

Independent automotive repair shops routinely struggle with fragmented operations: clipboards for mechanics, disconnected spreadsheets for inventory, paper invoices prone to calculation errors, and phone-based scheduling.

**Serviqa** delivers an integrated workshop management platform that brings shop managers, service advisors, mechanics, and parts specialists together into a shared digital workflow. Every interaction—from a customer booking an appointment to ordering brake rotors, calculating labor hours, and printing an official vehicle handover receipt—flows smoothly through the platform with live synchronization.

### Live Demo & Test Credentials
- **URL**: [https://serviqa.vercel.app/](https://serviqa.vercel.app/)
- **Demo Account**: `test@serviqa.com`
- **Password**: `test1234`

---

## 🛠️ Problems Solved

| Traditional Workshop Challenge | How Serviqa Solves It |
| :--- | :--- |
| **Lost & Misplaced Paper Work Orders** | Interactive drag-and-drop Kanban board with accessible status step buttons, multi-field search, and live stage indicators. |
| **Inventory Shrinkage & Stockouts** | Real-time catalog with total stock valuation (`$`), low-stock alerts (≤ 5 units), out-of-stock badges, and inline `+`/`-` quick stock adjusters. |
| **Manual Invoicing & Math Mistakes** | Automated repair order calculation combining itemized parts, unit pricing, editable labor fees, and mileage verification with one-click PDF generation. |
| **Unassigned Vehicles & Client Confusion** | Strict relational mapping between customers and their registered vehicles, preventing work orders from being assigned to incorrect owners. |
| **Complex Diagnostic Troubleshooting** | Embedded AI diagnostic copilot with access to live workshop database context, answering OBD-II code questions, torque specs, and parts availability. |
| **Chaotic Drop-Off Schedules** | Visual 7-day timeline calendar with week navigation and one-click "Send to Kanban" conversion for customer drop-offs. |

---

## ⚡ Core Features Walkthrough

### 1. Executive Workshop Dashboard
The central command center for shop owners and service managers:
- **Workshop Bays Operational Status**: Real-time bay occupancy pill showing active bays, repairs underway, and tickets waiting on parts.
- **Executive Metric Cards**: High-visibility cards with watermark iconography:
  - *Active Jobs* (with live in-progress and waiting-parts counters)
  - *Total Clients* (customer fleet accounts)
  - *Pending Revenue* (estimated unpaid pipeline value and average ticket price)
  - *Low Stock Alerts* (critical inventory items needing replenishment)
- **Interactive Multi-Period Revenue Area Chart**: Recharts-powered area graph with segmented controls (**7 Days**, **14 Days**, **30 Days**) and a live period total metric.
- **Repair Pipeline Donut Chart**: Visual distribution of jobs across `To Do`, `In Progress`, `Waiting Parts`, and `Done` with total job counter and interactive legend.
- **Actionable Quick-Access Feeds**: Jump directly to active repairs or restock low-stock parts with one click.

### 2. Kanban Repair Dispatch Board
A responsive visual board powered by `@dnd-kit`:
- **Workflow Columns**: `To Do`, `In Progress`, `Waiting on Parts`, and `Done`.
- **Live Search & Filter**: Real-time filtering across job title, customer name, and license plate number.
- **Accessible Step Advancement**: Step-forward buttons on each job card provide a 1-click alternative to drag-and-drop for keyboard and mobile accessibility.
- **Direct Handover CTA**: When a ticket reaches `Done`, the card illuminates an emerald **"Handover & Invoice"** button routing directly to the invoice generator.
- **Column Quick-Add**: Direct `+` button in each column header to launch a job modal pre-populated with that status.
- **Archived Job History**: Reversible archive modal allowing shops to inspect closed tickets, refund revenues, and restock parts.

### 3. Customer Fleet & Client Directory
Complete customer relationship management for vehicle owners:
- **Relational Data Mapping**: Client rows compute fleet vehicle counts and active repair statuses in real time.
- **One-Click Communication**: Direct click-to-call (`tel:`) and email (`mailto:`) links.
- **Search & Counter**: Filter by name, phone, or email with dynamic counter (`Showing X of Y clients`).
- **Responsive Mobile Layout**: Automatically switches between desktop tables and touch-friendly cards.

### 4. Vehicle Fleet Intelligence
Vehicle management tailored for automotive service:
- **Fleet Metrics Strip**: Total Fleet, In Workshop Now, Completed Services, and Unique Owners.
- **License Plate & VIN Badges**: Monospace styling with one-click click-to-copy utility and checkmark confirmation.
- **Relational Workshop Badges**: Visual indicator displaying whether a car is actively on a lift or idle, plus lifetime completed repair history.
- **1-Click "New Job" Shortcut**: Create a job directly from a vehicle row, opening the job modal pre-filled with the owner and car.
- **Status Filter Tabs**: Segment fleet by `All Fleet`, `In Service`, or `Available / Ready`.

### 5. Parts Inventory & Stock Valuation
Accurate inventory control:
- **Executive Valuation Strip**: Real-time calculation of **Total Stock Valuation ($)**, Total SKUs, Low Stock Alerts, and Out-of-Stock items.
- **Inline Quick Adjusters**: Instant `+` and `–` quantity buttons directly on table rows and mobile cards to deduct parts without opening dialogs.
- **Stock Health Tabs**: Segment catalog into `All Parts`, `Low Stock (≤ 5)`, `Out of Stock (0)`, and `Adequate (> 5)`.
- **SKU Tags**: Monospace part tags with click-to-copy utility.
- **Safety Inventory Guards**: Prevents invoicing or consuming more parts than currently available on the shelf.

### 6. Service Calendar & Weekly Dispatch
Visual scheduling for client drop-offs:
- **Week Switcher Controls**: Navigate backward and forward by week with a dynamic date range label (`Oct 12 – Oct 18, 2026`).
- **Day-Specific Quick Scheduling**: `+` button in each day header to book an appointment pre-set to that date.
- **Rich Appointment Cards**: Displays time, customer name, vehicle details, plate number, and phone link.
- **One-Click "Send to Kanban"**: Converts scheduled appointments directly into active repair jobs on the Kanban board.

### 7. Mechanic AI Copilot (Powered by Gemini)
An automotive diagnostic assistant integrated into the workshop database:
- **Grounded in Live Shop Data**: Injected with real-time JSON snapshots of active jobs, registered vehicles, customer records, and inventory parts.
- **Automotive Diagnostic Guardrails**: Strictly constrained to vehicle diagnostics (OBD-II trouble codes, torque specs, wiring procedures, maintenance intervals) and shop management.
- **Suggestion Prompt Chips**: 1-click prompt chips for diagnostic codes (OBD-II P0420), inventory stock checks, active job summaries, and torque specs.
- **Actionable Chat History**: 1-click "Copy Response" with feedback and "Clear History" chat reset.
- **Enhanced Markdown Rendering**: Tables, monospace code blocks, and structured lists.

### 8. Digital Invoice & Vehicle Handover Receipt
Printable official repair receipts and handover documentation:
- **Dynamic Shop Profile**: Pulls registered shop name, owner, phone, and email from `useShopProfile()`.
- **Odometer Mileage Verification**: Requires entering current mileage before completing the repair order.
- **Itemized Material Calculation**: Select parts from inventory with stock constraints, compute line totals, and adjust service labor fee.
- **Client-Side PDF Generation**: Generates clean printable PDF invoices via `html2pdf.js` with interactive controls stripped during print.
- **Inventory Depletion Mutation**: Automatically deducts used parts from inventory and marks the job as paid and completed.

### 9. Modern Acrylic Modal Architecture
All modal dialogs (`ClientModal`, `VehicleModal`, `JobModal`, `InventoryModal`, `AppointmentModal`, `JobHistoryModal`) feature:
- Deep acrylic frosted scrim (`backdrop-filter: blur(12px)`).
- Smooth spring pop entrance animation (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Contextual header icon badges and descriptive subtitles.
- Accessible form fields with explicit labels, custom selects, and primary focus rings.

---

## 📖 User Guide (How to Use Serviqa)

### Step 1: Sign In & Workshop Profile
1. Navigate to `/login` and sign in using your shop credentials (or the test account `test@serviqa.com` / `test1234`).
2. Your shop name and owner profile automatically populate the top navigation bar and invoice header.

### Step 2: Register Clients & Vehicles
1. Navigate to **Clients** (`/clients`) and click **"Add Client"** to enter the customer's full name, phone number, and email.
2. Navigate to **Vehicles** (`/vehicles`) and click **"Add Vehicle"**. Select the customer from the dropdown, enter the make, model, year, and license plate number.

### Step 3: Book Appointments or Dispatch Jobs
- **Via Calendar (`/calendar`)**: Click **"Schedule Appointment"** or the `+` icon on any day column. When the customer drops off the car, click **"Send to Kanban"**.
- **Via Vehicles (`/vehicles`)**: Click the **"New Job"** button on any vehicle row. The modal will open with the customer and car pre-selected.
- **Via Kanban (`/jobs`)**: Click **"New Job"** or the `+` icon in any column header. Select the client, select their vehicle, enter the service title, and set the estimated cost.

### Step 4: Track Repairs on the Kanban Board
1. Drag repair cards across columns as work progresses: `To Do` → `In Progress` → `Waiting on Parts` → `Done`.
2. Alternatively, click the step-forward button (`→`) on the card for 1-click status progression.

### Step 5: Consult the Mechanic AI Copilot
1. Navigate to **AI Assistant** (`/ai-assistant`).
2. Click any suggestion chip (e.g., *"Diagnose OBD-II P0420"* or *"Check low stock parts"*), or ask custom questions regarding torque specs, diagnostic steps, or active repairs.

### Step 6: Handover, Invoice & Payment
1. When a job reaches the `Done` column, click **"Handover & Invoice"**.
2. Enter the vehicle's current odometer mileage.
3. Add any replacement parts used from the inventory dropdown (stock is validated in real time).
4. Review the itemized parts total and labor fee.
5. Click **"Download PDF"** to generate a printable customer receipt.
6. Click **"Confirm Handover & Payment"** to finalize the order, mark it as completed, and deduct parts from stock.

---

## 🏛️ Technical Architecture

### MVVM Architectural Pattern
Serviqa adapts the **Model-View-ViewModel (MVVM)** pattern for React:

```
┌────────────────────────────────────────────────────────┐
│                        VIEW                            │
│   React Functional Components & Pure CSS Modules       │
│   (Dashboard.tsx, Jobs.tsx, Vehicles.tsx, Modals)      │
└───────────────────────────▲────────────────────────────┘
                            │ Dispatches actions & binds state
┌───────────────────────────┴────────────────────────────┐
│                      VIEWMODEL                         │
│   TanStack Query Hooks & Local Controller Hooks        │
│   (useJobs, useVehicles, useClients, useInventory)     │
└───────────────────────────▲────────────────────────────┘
                            │ Calls asynchronous services
┌───────────────────────────┴────────────────────────────┐
│                        MODEL                           │
│   Firebase SDK & Domain Services                       │
│   (jobService.ts, clientService.ts, inventoryService)  │
└────────────────────────────────────────────────────────┘
```

- **View**: Pure presentation layer utilizing React 19 functional components and scoped CSS Modules. No business or networking logic resides in views.
- **ViewModel**: TanStack Query v5 hooks managing cache keys, loading/error states, optimistic updates, and invalidation triggers.
- **Model**: Modular domain services abstracting Firestore collections, queries, data formatting, and Firebase Authentication.

### Feature-Sliced Project Structure

```
src/
├── components/                  # Shared atomic UI components
│   ├── common/                  # Error boundaries, protected routes
│   └── DataCard/                # Responsive mobile card component
├── config/                      # Infrastructure configuration (Firebase SDK)
├── features/                    # Domain-driven feature slices
│   ├── appointments/            # Booking hooks, modals, and services
│   ├── auth/                    # Auth context, login, signup, shop profile
│   ├── clients/                 # Client directory, hooks, modals, tests
│   ├── inventory/               # Parts catalog, valuation, modals, hooks
│   ├── jobs/                    # Kanban board, invoice generator, modals
│   └── vehicles/                # Vehicle fleet, hooks, modals, types
├── layouts/                     # Global layout shell (Sidebar, Header, Layout)
├── pages/                       # Top-level route views
│   ├── AiAssistant.tsx          # Gemini AI Copilot
│   ├── Calendar.tsx             # Service calendar timeline
│   ├── Clients.tsx              # Customer directory
│   ├── Dashboard.tsx            # Executive KPI dashboard
│   ├── Inventory.tsx            # Parts & stock valuation
│   ├── Jobs.tsx                 # Kanban repair board
│   └── Vehicles.tsx             # Fleet management
├── styles/                      # Design system tokens & reset
│   └── variables.css            # Color palettes, shadows, springs, fonts
└── test-utils/                  # Testing wrappers & provider harnesses
```

### Database Schemas & Firestore Models

```typescript
// Shop Profile (shops/{shopId})
interface ShopProfile {
  shopId: string;
  ownerName: string;
  shopName: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
}

// Client (clients/{clientId})
interface Client {
  id: string;
  shopId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

// Vehicle (vehicles/{vehicleId})
interface Vehicle {
  id: string;
  shopId: string;
  clientId: string;      // Relational foreign key to Client
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;
  createdAt: string;
}

// Job / Repair Order (jobs/{jobId})
interface Job {
  id: string;
  shopId: string;
  clientId: string;      // Relational foreign key to Client
  vehicleId: string;     // Relational foreign key to Vehicle
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "waiting-parts" | "done" | "archived";
  estimatedCost?: number;
  actualCost?: number;
  mileage?: number;
  usedParts?: UsedPart[];
  createdAt: string;
}

// Inventory Item (inventory/{itemId})
interface InventoryItem {
  id: string;
  shopId: string;
  itemName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  createdAt: string;
}

// Appointment (appointments/{appointmentId})
interface Appointment {
  id: string;
  shopId: string;
  clientId: string;
  vehicleId: string;
  title: string;
  date: string;          // ISO string YYYY-MM-DD
  time: string;          // HH:mm format
  notes?: string;
  status: "scheduled" | "converted" | "cancelled";
  createdAt: string;
}
```

### Design System & Typography Tokens
Built with zero external CSS frameworks, using scoped CSS Modules and design tokens defined in `src/styles/variables.css`:

- **Typography**:
  - Primary Interface Font: **Plus Jakarta Sans** (weights 400 to 800) for clean readability.
  - Tabular & Numerical Font: **JetBrains Mono** for all prices, quantities, VINs, license plates, and mileage figures.
- **Color Architecture**:
  - Primary Mechanic Blue: `#2563EB` (accent `#1D4ED8`, light `#EFF6FF`).
  - Executive Slate Neutrals: `#0F172A` down to `#F8FAFC`.
  - Semantic Statuses: Emerald Green (`#059669`), Amber Orange (`#D97706`), Crimson Red (`#DC2626`), Violet Purple (`#7C3AED`).
- **Surface Elevation & Motion**:
  - Acrylic Glassmorphism: `backdrop-filter: blur(16px)` with subtle boundary borders.
  - Fluid Physics Curves: `cubic-bezier(0.16, 1, 0.3, 1)` for smooth hover transitions and modal pop-ins.
  - Multi-Layered Shadows: `var(--shadow-sm)` through `var(--shadow-xl)`.

### Accessibility & WCAG Compliance
- **Full Keyboard Navigation**: Modal dialogs, table rows, and status buttons support complete keyboard interaction (`Tab`, `Enter`, `Escape`).
- **Screen Reader Associations**: Every form control uses explicit `htmlFor` and `id` bindings.
- **Non-Drag Kanban Alternative**: Step-forward buttons allow users unable to perform drag-and-drop to advance job states.
- **High Contrast Ratios**: Adheres to WCAG 2.2 AA/AAA contrast ratios across all text and interactive badges.

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A **Firebase Project** with Firestore and Authentication enabled.
- A **Google Gemini API Key** (optional, for AI diagnostic assistant).

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbdulrahmanBassem/Serviqa.git
   cd Serviqa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Google Gemini API Key (for AI Diagnostic Copilot)
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Available NPM Scripts**:
   ```bash
   npm run dev        # Launches Vite development server with Hot Module Replacement (HMR)
   npm test           # Executes Vitest test suite in single-run mode
   npm run test:ui    # Launches interactive Vitest browser GUI
   npm run lint       # Runs ESLint code quality analysis
   npm run build      # Executes TypeScript typechecking and bundles production assets
   npm run preview    # Previews the production build locally
   ```

---

## 🧪 Testing Infrastructure

The repository employs a multi-layered automated testing pipeline utilizing **Vitest** and **React Testing Library**:

- **Integration Testing**:
  - `JobModal.test.tsx`: Validates relational client-to-vehicle filtering logic, ensuring selecting a client populates only vehicles registered to that customer.
  - `ClientModal.test.tsx`: Validates form payload construction, mutation triggers, and sanitization of optional empty string fields.
  - `Dashboard.test.tsx`: Validates real-time aggregation of active jobs, client counts, pending revenue, and low-stock alerts.
  - `Sidebar.test.tsx`: Validates navigation links, route highlighting, and branding rendering.
- **Provider Test Harness**:
  - `renderWithProviders.tsx`: Supplies an isolated `QueryClientProvider` and `MemoryRouter` wrapper for testing components without live network access.

Run the test suite:
```bash
npx vitest run
```

---

## 🚀 Deployment Strategy

Serviqa is deployed on **Vercel** with continuous deployment on git pushes.

### Client-Side Routing Configuration (`vercel.json`)
To ensure deep links (such as `/dashboard`, `/vehicles`, or `/invoice/:jobId`) resolve correctly upon browser refresh without returning 404 errors, the root includes a rewrite configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.