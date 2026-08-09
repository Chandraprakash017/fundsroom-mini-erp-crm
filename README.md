# Mini ERP + CRM Operations Portal

A complete, full-stack Mini ERP and CRM Operations Portal built for a case study. 

## Project Overview

This portal handles core operations including User Authentication, Customer Relationship Management (CRM), Product and Inventory Management, and Sales Challan generation. The dashboard provides quick analytics and summaries of operations.

## Tech Stack

### Backend
- **Node.js** & **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (Neon)

### Frontend
- **React** (Vite)
- **TypeScript**
- **Tailwind CSS**
- **React Router**
- **Axios**

## Folder Structure

- `frontend/` - Contains the React Vite application
- `backend/` - Contains the Node.js Express application

## Database Schema (Prisma)

- `User`: Handles authentication and roles (ADMIN, SALES, WAREHOUSE, ACCOUNTS).
- `Customer`: Stores CRM data and `FollowUpNote`s.
- `Product`: Stores inventory items, pricing, and stock limits.
- `StockMovement`: Logs every IN/OUT transaction for products.
- `Challan` & `ChallanItem`: Handles the sales workflow from DRAFT to CONFIRMED.

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Customers**: `/api/customers` (CRUD + Notes)
- **Products**: `/api/products` (CRUD)
- **Inventory**: `/api/inventory/logs`, `/api/inventory/movement`
- **Challans**: `/api/challans` (Create, Confirm, Cancel)
- **Dashboard**: `/api/dashboard/stats`

## Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (Neon or local)

### Backend Setup
```bash
cd backend
npm install
# Create a .env file based on environment variables below
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

**Backend (`backend/.env`)**
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp?schema=public"
JWT_SECRET="super-secret-jwt-key"
```

## Deployment Prep

- **Frontend**: Ready to be deployed on Vercel (`npm run build`). Make sure to set `API_URL` appropriately for production (it's currently hardcoded to `http://localhost:5000/api` in frontend pages for local dev, which needs to be parameterized via `.env.production`).
- **Backend**: Ready to be deployed on Render (`npm run build` and `npm start`). Environment variables (`DATABASE_URL`, `JWT_SECRET`) must be provided.
- **Database**: Neon PostgreSQL connection string should be provided to the backend environment variables.

## Future Improvements

- Add pagination for all lists.
- Better error handling and toast notifications on frontend.
- PDF generation for Challans.
- Parameterize `API_URL` using Vite's `import.meta.env`.
