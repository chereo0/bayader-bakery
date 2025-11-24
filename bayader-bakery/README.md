# EL-Bayader — Vite + React + TypeScript + Tailwind

A comprehensive bakery management and delivery system with separate dashboards for customers, admin, and drivers. Features complete order management, driver assignment, analytics, and real-time delivery tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB (for backend)

### Installation

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Start dev server**
   ```bash
   npm run dev
   ```
   Frontend runs on: **http://localhost:5174**

3. **Install backend dependencies** (in `/backend` folder)
   ```bash
   cd ../backend
   npm install
   ```

4. **Start backend server** (in `/backend` folder)
   ```bash
   npm run dev
   ```
   Backend runs on: **http://localhost:5000**

---

## 📋 Project Structure

### Frontend (`/bayader-bakery`)
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # UI component library
│   ├── CartPage.tsx    # Shopping cart
│   └── ...
├── admin/              # Admin dashboard
│   ├── components/     # Admin-specific components
│   ├── orders/         # Order management
│   ├── drivers/        # Driver management
│   ├── users/          # User management
│   ├── products/       # Product management
│   ├── events/         # Event management
│   ├── analytics/      # Analytics & reporting
│   ├── AdminDashboard.tsx
│   ├── AnalyticsDashboard.tsx
│   └── Sidebar.tsx
├── driver/             # Driver dashboard features
│   ├── components/     # Driver-specific components
│   ├── services/       # API service layer
│   ├── DriverLayout.tsx
│   ├── DriverNavbar.tsx
│   ├── DriverSidebar.tsx
│   ├── DeliveryDashboard.tsx
│   ├── MyDeliveriesPage.tsx
│   ├── MessagesPage.tsx
│   └── SettingsPage.tsx
├── context/            # React contexts
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── assets/             # Images and media
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

### Backend (`/backend`)
```
controllers/           # Route handlers
├── authController.js
├── driverController.js
├── orderController.js
├── messageController.js
├── userController.js
├── productController.js
└── eventController.js
models/               # MongoDB schemas
├── User.js
├── Order.js          # Order model with driver integration
├── Message.js
├── Product.js
└── Event.js
routes/               # API routes
├── auth.js
├── drivers.js
├── orders.js         # Order management with driver assignment
├── messages.js
├── users.js
├── products.js
├── events.js
└── admin.js          # Admin analytics endpoints
config/               # Configuration files
├── db.js
└── index.js
scripts/              # Utility scripts
├── seed.js
├── create-driver.js
└── seed-data.js
```

---

## 🎨 Features

### 1. **Customer Portal**
- Browse bakery products with categories
- Add items to cart and place orders
- Order tracking and history
- User authentication and profile management

### 2. **Admin Dashboard** ✅ COMPLETE
- **Dashboard** - Overview with key metrics and analytics
- **Products** - Complete product management (CRUD operations)
- **Analytics** - Advanced charts and reporting with Recharts
- **Orders** - Full order lifecycle management (pending → active → shipped → delivered)
- **Drivers** - Driver management and assignment system
- **Users** - Customer and staff user management
- **Events** - Event planning and management
- **Messages** - Communication with drivers and customers
- **Settings** - System configuration and preferences

### 3. **Driver Dashboard** ✅ COMPLETE
- **Dashboard** - Real-time delivery statistics and overview
- **My Orders** - View assigned orders (replacing old deliveries system)
- **Messages** - Staff-only communication system
- **Settings** - Driver-focused profile and notification settings
- **Authentication** - Secure login/logout with JWT tokens

### 4. **Order Management System** ✅ NEW
- **Order Lifecycle**: pending → active → shipped → delivered → cancelled
- **Driver Assignment**: Orders can be assigned to drivers
- **Status Tracking**: Real-time status updates throughout delivery process
- **Analytics Integration**: Order data feeds into admin analytics dashboard

---

## 🔑 Key Technologies

### Frontend
- **React 18.2** - UI library
- **TypeScript 5.1** - Type safety with strict mode
- **Vite 5.0** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **React Router 6.30** - Client-side routing
- **Recharts** - Analytics dashboard charts
- **Axios/Fetch** - HTTP client for API calls

### Backend
- **Node.js/Express** - Server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM with schemas
- **JWT** - Stateless authentication
- **Bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### DevTools & Quality
- **Vite HMR** - Hot module replacement
- **PostCSS** - CSS processing
- **ESBuild** - Fast TypeScript transpilation
- **ESLint** - Code linting and quality
- **TypeScript Strict Mode** - Enhanced type safety

---

## 🔐 Authentication

### Login Flow
1. User enters credentials on login page
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token included in all API requests via Bearer header

### Logout
- Click "Logout" button in navbar
- Clears token and user data from localStorage
- Redirects to home page

### Protected Routes
- Driver dashboard requires JWT token
- Automatic redirect to login if token expires
- Demo data fallback for development

---

## 🛣️ API Endpoints

### Authentication
```
POST   /api/auth/login              - Login user (customer/admin/driver)
POST   /api/auth/register           - Register new customer
POST   /api/auth/logout             - Logout user
```

### Orders (Replaces Deliveries)
```
GET    /api/orders                  - Get all orders (admin)
GET    /api/orders/driver           - Get driver's assigned orders  
POST   /api/orders                  - Create new order
GET    /api/orders/:id              - Get order details
PATCH  /api/orders/:id/status       - Update order status
PATCH  /api/orders/:id/assign       - Assign order to driver
PATCH  /api/orders/:id/delivery-status - Update delivery status (driver)
```

### Admin Analytics
```
GET    /api/admin/analytics/summary         - Dashboard summary stats
GET    /api/admin/analytics/sales-by-day    - Sales trend data
GET    /api/admin/analytics/top-products    - Best-selling products
```

### Products
```
GET    /api/products                - Get all products
POST   /api/products                - Create product (admin)
PUT    /api/products/:id            - Update product (admin)
DELETE /api/products/:id            - Delete product (admin)
```

### Drivers
```
GET    /api/admin/drivers           - Get all drivers (admin)
POST   /api/admin/drivers           - Create driver account (admin)
PUT    /api/admin/drivers/:id       - Update driver (admin)
DELETE /api/admin/drivers/:id       - Delete driver (admin)
```

### Messages
```
GET    /api/messages                - Get messages (filtered by role)
PATCH  /api/messages/:id/read       - Mark message as read
POST   /api/messages                - Send new message
DELETE /api/messages/:id            - Delete message
```

### Users & Settings
```
GET    /api/users                   - Get all users (admin)
GET    /api/users/me                - Get current user profile
PATCH  /api/users/me                - Update profile
POST   /api/users/change-password   - Change password
```

---

## 🎨 Theme & Colors

### Bakery Color Scheme
- **Primary Brown**: `#5E372E` - Headings, buttons
- **Secondary Gold**: `#c79a63` - Accents, highlights
- **Background Cream**: `#fffaf4` - Main background
- **Light Tan**: `#f9f3eb` - Hover states
- **Border Light**: `#f3e7d9` - Borders
- **Text Brown**: `#6b4f45` - Body text

---

## 📁 Configuration Files

### Frontend
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript settings
- `tailwind.config.cjs` - Tailwind CSS config
- `postcss.config.cjs` - PostCSS config
- `package.json` - Dependencies and scripts

### Backend
- `config/db.js` - MongoDB connection
- `config/index.js` - Environment config
- `server.js` - Server entry point

---

## 📝 Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (`.env`)
```
MONGODB_URI=mongodb://localhost:27017/bayader
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

---

## 🚀 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173/5174
lsof -ti:5173 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in backend `.env`
- Verify database credentials

### Token Errors
- Clear localStorage: `localStorage.clear()`
- Hard refresh browser: `Ctrl+Shift+R`
- Re-login to get new token

### TypeScript Errors
```bash
npm run build         # Check for compilation errors
npx tsc --noEmit     # Type check without building
npx tsc --noEmit --skipLibCheck  # Type check ignoring lib errors
```

### Common Issues & Solutions
- **Recharts Errors**: Check that all chart data is normalized with `Number(value ?? 0)`
- **Division by Zero**: Ensure proper checks before mathematical operations  
- **NaN Values**: Use null coalescing (`??`) instead of logical OR (`||`) for numbers
- **Build Failures**: Run TypeScript check first, then address type errors

---

## 📚 Documentation

### Recent Implementation Guides
- `DELIVERIES_REMOVAL_COMPLETE.md` - Admin deliveries section removal
- `ANALYTICS_RECHARTS_FIX_COMPLETE.md` - Recharts errors and fixes
- `DRIVER_DASHBOARD_COMPLETE.md` - Driver dashboard implementation
- `ORDERS_IMPLEMENTATION_COMPLETE.md` - Orders system integration
- `DRIVERS_MANAGEMENT_IMPLEMENTATION.md` - Driver management system

### Quick Reference Guides  
- `MESSAGES_AND_SETTINGS_QUICK_START.md` - Messages and settings
- `DRIVERS_QUICK_START.md` - Driver management workflow
- `ORDERS_QUICK_REFERENCE.md` - Order management operations
- `QUICK_TEST_CHECKLIST.md` - Testing procedures

### Architecture & Planning
- `VISUAL_IMPLEMENTATION_GUIDE.md` - System architecture
- `COMPLETION_SUMMARY.md` - Project status overview
- `FINAL_CHECKLIST.md` - Implementation verification
- `PHASE_5_INTEGRATION_TEST_GUIDE.md` - Testing scenarios

---

## 🔄 Development Workflow

### Making Changes
1. Make code changes
2. Save file (HMR auto-reloads)
3. Check browser console for errors
4. Verify functionality

### Before Committing
1. Run `npm run build` to check for errors
2. Test all features in browser
3. Check console for warnings
4. Commit with clear message

---

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to Server
```bash
npm run build
# Upload 'dist' folder to hosting
```

---

## 🤝 Team

### Roles
- **Frontend Developer** - React/TypeScript development
- **Backend Developer** - Node.js/Express/MongoDB
- **Designer** - UI/UX design
- **QA** - Testing and quality assurance

---

## 📄 License

All rights reserved © 2024 EL-Bayader Bakery

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review error messages in console
3. Check browser network tab for API responses
4. Contact development team

---

**Last Updated:** November 24, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

## 🎯 Recent Major Updates (v2.0.0)

### ✅ Admin Dashboard Enhancements
- **Analytics Dashboard**: Fixed all Recharts errors, normalized data handling
- **Orders System**: Complete order lifecycle management with driver integration  
- **Driver Management**: Full CRUD operations for driver accounts
- **Deliveries Removal**: Surgically removed deliveries section, preserved Orders functionality

### ✅ Driver Dashboard Refactoring  
- **Order Integration**: My Deliveries page now uses Orders model instead of separate deliveries
- **Navigation Cleanup**: Streamlined 4-item navigation (Dashboard, My Orders, Messages, Settings)
- **Messages**: Staff-only filtering for relevant communications
- **Settings**: Driver-focused profile management

### ✅ Code Quality Improvements
- **TypeScript**: Fixed all compilation errors, strict type safety
- **Build System**: Clean builds with zero warnings  
- **Data Normalization**: Proper null handling throughout application
- **Error Prevention**: Division by zero protection, NaN value elimination

### ✅ System Integration
- **Backend-Frontend**: Seamless API integration for all features
- **Authentication**: JWT-based auth with role-based access control
- **Database**: MongoDB with proper indexing and relationships
- **Development**: Hot module replacement, fast builds with Vite
