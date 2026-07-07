# Invotrix ERP (Frontend)

A sleek, modern, and high-performance frontend console for inventory, sales operations, and employee management. Built with React 19, TypeScript, Vite, and styled with Tailwind CSS & custom brand design tokens.

---

## 🚀 Minimalistic Overview

Invotrix ERP provides role-based modules for business operations:
- **Admin**: Full dashboard analysis, product control, and administrative settings.
- **Manager**: Inventory replenishment, sales history, and operations reporting.
- **Employee**: Dedicated POS terminal interface for transaction entries and receipt generation.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Dark/Light theme variables
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query + Axios
- **Routing**: React Router v6 (Role-guarded routes)

---

## 💻 Project Setup & Installation

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone the Repository
```bash
git clone https://github.com/sorifulhasan300/invotrix-frontend.git
cd invotrix-frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and specify the API base URL:
```env
VITE_API_BASE_URL=https://invotrix-backend.onrender.com/api/v1
```
*(For local development, you can point this to `http://localhost:5000/api/v1`)*

### 5. Running the Development Server
Start the local server with hot-reload enabled:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 6. Building for Production
To bundle and optimize the project for deployment:
```bash
npm run build
```
The output files will be created in the `dist/` directory.

---

## 📁 Key Directory Structure

```text
src/
├── components/       # Layouts, UI, and reusable custom elements
├── contexts/         # React Contexts (e.g. ThemeProvider)
├── features/         # Module-based features (auth, sales, products)
├── hooks/            # Reusable React hooks
├── lib/              # Utility configurations (axios, helper methods)
├── routes/           # Protected and Public route guards
└── types/            # TypeScript type definitions and interfaces
```
