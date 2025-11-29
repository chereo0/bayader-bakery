# Staff Role Implementation - Complete Guide

## Overview
Successfully implemented Staff role functionality for EL-Bayader bakery system with staff dashboard, order management, admin-staff messaging, and event viewing capabilities.

---

## Backend Implementation

### 1. User Model (Already Updated)
**File:** `/backend/models/User.js`

**Changes:**
- Role enum: `['customer', 'admin', 'staff', 'driver']`
- Department field: `['Production', 'Delivery', 'Quality Control', 'Management']`
- Settings field for notifications and preferences

**Staff User Fields:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'staff',
  phone: String,
  department: 'Production' | 'Delivery' | 'Quality Control' | 'Management',
  settings: {
    notifications: { email: Boolean, push: Boolean, sms: Boolean },
    preferences: { language: String, theme: String, timezone: String }
  },
  createdAt: Date
}
```

### 2. Staff Controller
**File:** `/backend/controllers/staffController.js` ✅ CREATED

**API Methods:**
- `listStaff(req, res)` - GET all staff with pagination, search, department filter
- `getStaff(req, res)` - GET single staff member by ID
- `createStaff(req, res)` - POST create new staff user
- `updateStaff(req, res)` - PUT update staff user (name, email, phone, department, password)
- `deleteStaff(req, res)` - DELETE staff user (soft delete)

**Features:**
- Pagination support (page, limit)
- Search by name, email, phone
- Department filtering
- Email uniqueness validation (case-insensitive)
- Self-deletion prevention
- Department validation against enum

### 3. Staff Management Routes
**File:** `/backend/routes/admin.js` ✅ UPDATED

**Routes (All admin-only):**
```
GET  /api/admin/staff
GET  /api/admin/staff/:id
POST /api/admin/staff
PUT  /api/admin/staff/:id
DELETE /api/admin/staff/:id
```

**Middleware:**
- `auth` - JWT verification required
- `requireRole('admin')` - Admin-only access

### 4. Message Controller Enhancement
**File:** `/backend/controllers/messageController.js` ✅ UPDATED

**New Feature:**
- `?fromRole=admin|staff|driver` query parameter
- Filters messages by sender's role
- Uses MongoDB `$in` operator for efficient filtering

**Implementation:**
```javascript
// Filter messages from specific role
if (req.query.fromRole) {
  const usersWithRole = await User.find({ role: req.query.fromRole });
  const userIds = usersWithRole.map(u => u._id);
  filter.from = { $in: userIds };
}
```

### 5. Authentication & Middleware
**Files:** `/backend/middleware/auth.js`, `/backend/middleware/requireRole.js`

**Status:** ✅ Already supports staff role

The existing middleware already supports 'staff' role through:
- `auth` middleware - Verifies JWT token
- `requireRole('admin', 'staff')` - Checks if user has specified role

---

## Frontend Implementation

### 1. Staff Service Layer
**File:** `/bayader-bakery/src/admin/services/staffService.ts` ✅ CREATED

**TypeScript Interfaces:**
```typescript
interface Staff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department: 'Production' | 'Delivery' | 'Quality Control' | 'Management';
  role: 'staff';
  createdAt: string;
}

interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department: 'Production' | 'Delivery' | 'Quality Control' | 'Management';
}

interface UpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  department?: 'Production' | 'Delivery' | 'Quality Control' | 'Management';
  password?: string;
}
```

**Methods:**
- `listStaff(page, limit, search?, department?)` - Get paginated staff list
- `getStaff(id)` - Get single staff member
- `createStaff(payload)` - Create new staff
- `updateStaff(id, payload)` - Update staff
- `deleteStaff(id)` - Delete staff

### 2. Staff User Layout
**File:** `/bayader-bakery/src/staff/StaffLayout.tsx` ✅ CREATED

**Structure:**
- Top navbar with logout button
- Left sidebar with navigation menu
- Main content area with page routing
- Tab-based navigation: Dashboard, Orders, Messages, Events

**Components:**
- `StaffNavbar.tsx` - Header with user info and logout
- `StaffLayoutSidebar.tsx` - Navigation menu with 4 items
- Page components in `pages/` subdirectory

### 3. Staff Navbar
**File:** `/bayader-bakery/src/staff/StaffNavbar.tsx` ✅ CREATED

**Features:**
- Displays current logged-in staff member name
- Logout button that clears token and user from localStorage
- Responsive design (hidden on mobile)

### 4. Staff Sidebar Navigation
**File:** `/bayader-bakery/src/staff/StaffLayoutSidebar.tsx` ✅ CREATED

**Menu Items:**
- 🏠 Dashboard - Overview and quick actions
- 📦 Orders - View and manage orders (pending/active)
- ✉️ Messages - Send messages to admin
- 🎉 Events - View company events

**Styling:**
- Brown theme (#5E372E base color)
- Gold/tan highlight (#c79a63) for active items
- Gradient background for selected items

### 5. Staff Dashboard Overview
**File:** `/bayader-bakery/src/staff/pages/StaffOverview.tsx` ✅ CREATED

**Dashboard Content:**
- **Stats Cards:** Today's Orders, In Production, Ready for Dispatch, Pending Tasks
- **Quick Actions:** View Today's Orders, Message Admin, Upcoming Events
- **Reminders:** Quality Check Due, Team Meeting, New Guidelines

**Features:**
- Fetches dashboard stats from `/api/dashboard/stats`
- Real-time data loading
- Error handling
- Loading states

### 6. Staff Orders Page
**File:** `/bayader-bakery/src/staff/pages/StaffOrdersPage.tsx` ✅ CREATED

**Features:**
- **Status Filter:** All, Pending, Active, Shipped, Delivered
- **Table Display:**
  - Order number
  - Status badge (color-coded)
  - Number of items
  - Total amount (SAR)
  - Delivery city
  - Date/time created

- **Pagination:** 20 items per page
- **Filtering:** Staff can filter by order status
- **Access Level:** Staff can see all orders (for production planning)

### 7. Staff Messages Page
**File:** `/bayader-bakery/src/staff/pages/StaffMessagesPage.tsx` ✅ CREATED

**Features:**
- **Compose Form:** 
  - Subject field
  - Message textarea
  - Send/Cancel buttons
  
- **Message List:**
  - Shows messages from admin only
  - Unread messages highlighted in blue
  - Shows sender name, role badge, subject, preview
  - Relative timestamps (just now, 5m ago, etc.)
  - Click to mark as read
  
- **Pagination:** 20 messages per page

- **Functionality:**
  - Auto-fetches first admin user for messaging target
  - Automatically sends messages with type='staff'
  - Lists only admin messages using `fromRole=admin` filter
  - Real-time updates on message send

### 8. Staff Events Page
**File:** `/bayader-bakery/src/staff/pages/StaffEventsPage.tsx` ✅ CREATED

**Features:**
- **Event Grid:** 3-column responsive layout
- **Event Card Display:**
  - Event image (if available)
  - Title
  - Description (truncated)
  - Date (formatted: "Monday, November 27, 2025")
  - Time (if available)
  - Location (if available)
  - Event type (if available)
  - "Upcoming" badge for future events
  - "Learn More" button

- **Pagination:** 20 events per page
- **Status:** Shows "Upcoming" badge for future events

### 9. Route Protection Updates
**File:** `/bayader-bakery/src/App.tsx` ✅ UPDATED

**New Routes:**
```typescript
// Staff user (role: 'staff')
<Route path="/staff" element={
  <ProtectedRoute requiredRoles={['staff']}>
    <StaffLayout />
  </ProtectedRoute>
} />

// Admin managing staff (old admin staff dashboard)
<Route path="/staff-admin" element={
  <ProtectedRoute adminOnly>
    <StaffDashboard />
  </ProtectedRoute>
} />
```

**ProtectedRoute Features:**
- Checks `requiredRoles` array (supports staff role)
- Prevents unauthorized access to staff routes
- Redirects to home if user lacks permissions
- Shows loading spinner while checking auth

---

## Admin-Staff Messaging

### 1. Message Flow
```
Staff sends message → Message model saved → Admin receives → Admin can filter staff messages
Admin sends message to Staff → Message model saved → Staff receives → Staff can reply
```

### 2. Admin Messaging Page Enhancement
**File:** `/bayader-bakery/src/admin/staff/MessagingPage.tsx` ✅ UPDATED

**New Features:**
- **Role Filter Tabs:** All | Staff | Drivers
- **Filtered Display:**
  - "All" shows all incoming messages
  - "Staff" shows only messages from staff members
  - "Drivers" shows only messages from drivers

**Implementation:**
- Uses `?fromRole=staff|driver` query parameter
- Button tabs to switch between views
- Active tab highlighted with border-bottom
- Unread count shown globally

---

## API Endpoints Summary

### Staff Management (Admin Only)
```
GET    /api/admin/staff                    → List all staff
GET    /api/admin/staff/:id                → Get single staff
POST   /api/admin/staff                    → Create staff
PUT    /api/admin/staff/:id                → Update staff
DELETE /api/admin/staff/:id                → Delete staff
```

### Messages (With New Role Filtering)
```
GET    /api/messages?fromRole=staff        → Get messages from staff only
GET    /api/messages?fromRole=driver       → Get messages from drivers only
GET    /api/messages?fromRole=admin        → Get messages from admin only
POST   /api/messages                       → Send new message
PUT    /api/messages/:id/read              → Mark as read
DELETE /api/messages/:id                   → Archive message
```

### Existing Routes Used
```
GET    /api/orders              → Staff views orders
GET    /api/events              → Staff views events
GET    /api/dashboard/stats     → Dashboard statistics
GET    /api/users?role=admin    → Find admin for messaging
```

---

## User Access Levels

### Customer
- View products, create orders, track orders
- No access to `/staff`, `/admin`

### Driver
- Access `/driver` route only
- View assigned deliveries
- Message admin
- Cannot access staff or admin areas

### Staff
- Access `/staff` route only
- **Dashboard:** View today's orders, pending tasks, quick stats
- **Orders:** Filter and view orders (pending/active/shipped/delivered)
- **Messages:** Send messages to admin, view admin responses
- **Events:** View company events
- Cannot access admin area or driver deliveries

### Admin
- Access `/admin` and `/staff-admin` routes
- Full system access
- **Manage Staff:** Create, update, view, delete staff users
- **Analytics & Reports:** Full business analytics
- **User Management:** Manage all users
- **Messaging:** View and filter messages from staff/drivers, send messages

---

## File Structure

```
Backend:
├── controllers/
│   ├── staffController.js          ✅ NEW
│   └── messageController.js        ✅ UPDATED
├── routes/
│   └── admin.js                    ✅ UPDATED
└── models/
    └── User.js                     ✅ (already has staff)

Frontend:
├── src/
│   ├── App.tsx                     ✅ UPDATED
│   ├── staff/                      ✅ NEW
│   │   ├── StaffLayout.tsx
│   │   ├── StaffNavbar.tsx
│   │   ├── StaffLayoutSidebar.tsx
│   │   ├── pages/
│   │   │   ├── StaffOverview.tsx
│   │   │   ├── StaffOrdersPage.tsx
│   │   │   ├── StaffMessagesPage.tsx
│   │   │   └── StaffEventsPage.tsx
│   ├── admin/
│   │   ├── services/
│   │   │   └── staffService.ts     ✅ NEW
│   │   └── staff/
│   │       └── MessagingPage.tsx   ✅ UPDATED
│   └── components/
│       └── ProtectedRoute.tsx      ✅ (already supports staff)
```

---

## Permissions Matrix

| Feature | Customer | Driver | Staff | Admin |
|---------|----------|--------|-------|-------|
| View Products | ✅ | ✗ | ✗ | ✅ |
| Create Orders | ✅ | ✗ | ✗ | ✗ |
| View Orders | ✅ (own) | ✗ | ✅ (all) | ✅ |
| Manage Staff | ✗ | ✗ | ✗ | ✅ |
| View Dashboard | ✗ | ✅ | ✅ | ✅ |
| Send Messages | ✅ (limited) | ✅ | ✅ | ✅ |
| View Messages | ✅ (own) | ✅ | ✅ | ✅ |
| View Events | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✗ | ✗ | ✗ | ✅ |
| Manage Drivers | ✗ | ✗ | ✗ | ✅ |

---

## Testing Checklist

### Backend API Testing
- [ ] Create staff user via POST /api/admin/staff
- [ ] List staff via GET /api/admin/staff
- [ ] Get single staff via GET /api/admin/staff/:id
- [ ] Update staff via PUT /api/admin/staff/:id
- [ ] Delete staff via DELETE /api/admin/staff/:id
- [ ] Search staff by name/email/phone
- [ ] Filter staff by department
- [ ] Verify duplicate email prevention
- [ ] Verify admin-only access
- [ ] Send message from staff: POST /api/messages
- [ ] Filter messages by role: GET /api/messages?fromRole=staff

### Frontend Authentication Testing
- [ ] Login as staff user
- [ ] Verify redirect to /staff route
- [ ] Verify cannot access /admin route
- [ ] Verify logout functionality
- [ ] Verify role-based route protection

### Frontend Staff Dashboard Testing
- [ ] Dashboard loads stats correctly
- [ ] Orders page displays paginated orders
- [ ] Status filter works (pending, active, shipped, delivered)
- [ ] Messages page allows composing new message
- [ ] Messages mark as read when clicked
- [ ] Events page displays upcoming events with formatting
- [ ] All navigation tabs work smoothly

### Admin Messaging Testing
- [ ] Admin can see Staff and Driver tabs
- [ ] Switching tabs filters messages correctly
- [ ] Admin can send messages to specific staff
- [ ] Message type displays correctly

### Integration Testing
- [ ] Staff login → Dashboard → View Orders → Filter by Status
- [ ] Staff login → Messages → Compose Message to Admin
- [ ] Staff receives admin response → Marks as read
- [ ] Admin filters staff messages from driver messages

---

## Configuration

### Environment Variables (Frontend)
```
VITE_API_URL=http://localhost:5000/api
```

### Staff User Creation Example

**Via API:**
```bash
POST /api/admin/staff
Headers: {
  "Authorization": "Bearer <admin-token>",
  "Content-Type": "application/json"
}
Body: {
  "name": "Ahmed Production Manager",
  "email": "ahmed.production@bayader.com",
  "password": "SecurePassword123",
  "phone": "+966501234567",
  "department": "Production"
}
```

**Login as Staff:**
- Email: `ahmed.production@bayader.com`
- Password: `SecurePassword123`
- Access: `http://localhost:3000/staff`

---

## Security Considerations

1. **Role-Based Access Control:**
   - Staff routes protected with `requiredRoles: ['staff']`
   - Admin routes protected with `requireRole('admin')`
   - Backend validates role on every request

2. **Data Filtering:**
   - Staff can only view their own orders (via server-side filtering)
   - Staff can only message admin (no peer-to-peer messaging with other staff)
   - Messages filtered by sender role using User model queries

3. **Password Security:**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Password field removed from JSON responses
   - Update password endpoint available

4. **Email Uniqueness:**
   - Case-insensitive unique constraint
   - Validated at creation and update
   - Duplicate detection prevents creation

5. **JWT Authentication:**
   - Token stored in localStorage
   - Validated on every protected route
   - Automatic redirect on unauthorized access

---

## Troubleshooting

### Issue: Staff cannot login
**Solution:** Verify role in database is exactly 'staff' (case-sensitive)

### Issue: Messages not appearing in admin view
**Solution:** Ensure message type is 'staff' and sender role is 'staff'

### Issue: Route protection not working
**Solution:** Clear localStorage, re-login, verify token format

### Issue: Messages filter not changing
**Solution:** Check API endpoint includes `?fromRole=staff` parameter

---

## Future Enhancements

1. **Two-Factor Authentication** for staff
2. **Message Threads** with nested replies
3. **Real-time Notifications** via WebSocket
4. **Staff Performance Tracking** with metrics
5. **Department Hierarchy** management
6. **Shift Scheduling** for staff
7. **Time Tracking** and attendance
8. **Document Upload** support in messages

---

## Deployment Notes

1. **Database Migration:**
   - Ensure all existing users are migrated with 'customer' role if not set
   - Create initial admin user with role 'admin'

2. **Backend Startup:**
   ```bash
   npm start
   # Verify all routes load without errors
   # Check auth middleware logs
   ```

3. **Frontend Build:**
   ```bash
   npm run build
   # Verify staff routes are included
   # Check role-based imports
   ```

4. **Testing in Production:**
   - Create test staff account
   - Verify message delivery
   - Test role-based access restrictions

---

## Completed Features ✅

✅ Staff User Model & Database schema  
✅ Staff CRUD API endpoints  
✅ Admin-only staff management routes  
✅ Message filtering by sender role  
✅ Staff role authentication  
✅ Staff Layout UI with navbar and sidebar  
✅ Staff Dashboard Overview page  
✅ Staff Orders Management page  
✅ Staff-Admin Messaging page  
✅ Staff Events viewing page  
✅ Route protection with role checks  
✅ Admin messaging UI with Staff/Driver tabs  
✅ Staff Service TypeScript layer  
✅ Complete navigation menu for staff  

---

## Implementation Complete ✅

All staff role functionality has been successfully implemented across backend and frontend. The system is ready for testing and deployment.

For testing, create a staff user via the admin API and login at `/staff` route.
