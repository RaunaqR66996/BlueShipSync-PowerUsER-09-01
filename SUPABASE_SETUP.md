# Blue Ship Sync - Supabase Setup Guide

## 🚀 Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Set a strong database password

### 2. Get Your Supabase Credentials
From your Supabase project dashboard:
- **Project URL**: Found in Settings > API
- **Anon Key**: Found in Settings > API
- **Database URL**: Found in Settings > Database

### 3. Environment Configuration
Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

## 🔧 Database Schema
The application uses a comprehensive Prisma schema with:
- **Users**: Multi-tenant user management
- **Warehouses**: Warehouse locations and capacity
- **Products**: Product catalog with SKUs
- **Inventory**: Real-time inventory tracking
- **Orders**: Order management system
- **Shipments**: Shipment tracking and logistics
- **Chat Messages**: AI chat history

## 🎯 Features Ready
- ✅ Landing page with professional design
- ✅ Authentication pages (login/signup)
- ✅ Dashboard with warehouse management
- ✅ 3D warehouse visualization
- ✅ AI chat interface
- ✅ Inventory management
- ✅ Orders and shipments tracking
- ✅ Real-time data fetching

## 📊 Demo Data
The seed script creates realistic demo data:
- 2 user accounts (ADMIN, OPERATOR)
- 3 warehouses with inventory
- 10 products across categories
- 5 customers with orders
- 3 carriers (FedEx, UPS, DHL)
- Sample shipments and chat messages

## 🔗 Next Steps
1. Set up your Supabase project
2. Configure environment variables
3. Run database migrations
4. Start developing!

Visit `http://localhost:3000` to see your Blue Ship Sync application.
