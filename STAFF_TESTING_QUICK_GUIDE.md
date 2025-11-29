# Staff Role - Quick Start Testing Guide

## Quick Setup

### 1. Create Staff User (as Admin)

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/admin/staff \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Staff Member",
    "email": "staff@test.com",
    "password": "Password123",
    "phone": "+966501234567",
    "department": "Production"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test Staff Member",
    "email": "staff@test.com",
    "role": "staff",
    "department": "Production",
    "createdAt": "2025-11-27T..."
  },
  "message": "Staff member created successfully"
}
```

### 2. Login as Staff

1. Go to `http://localhost:3000/login`
2. Enter email: `staff@test.com`
3. Enter password: `Password123`
4. Click Login
5. Should redirect to `/staff` dashboard

---

## Testing Each Feature

### ✅ Dashboard
- Navigate to `/staff` after login
- Should see:
  - Today's Orders count
  - In Production count
  - Ready for Dispatch count
  - Pending Tasks count
  - Quick action buttons
  - Reminders section
- All stats should load within 2-3 seconds

### ✅ Orders Page
- Click "Orders" in sidebar
- Should display orders table with:
  - Order number
  - Status (color-coded badges)
  - Number of items
  - Total amount (SAR)
  - Delivery city
  - Date created

**Test Filters:**
- Select "Pending" → only pending orders shown
- Select "Active" → only active orders shown
- Select "All Orders" → all orders shown
- Pagination working (Previous/Next buttons)

### ✅ Messages Page
- Click "Messages" in sidebar
- Click "New Message" button
- Form should appear with:
  - Subject input
  - Message textarea
  - Send/Cancel buttons

**Test Compose:**
1. Enter subject: "Test Message"
2. Enter message: "This is a test message from staff"
3. Click "Send Message"
4. Success notification should appear
5. Form should close

**Test List:**
- Messages from admin should appear in list
- Each message shows:
  - Sender name (admin)
  - Role badge (ADMIN)
  - Subject line
  - Message preview
  - Relative timestamp
- New messages highlighted in blue
- Click message → marks as read
- Blue highlight disappears after reading

**Test Pagination:**
- If more than 20 messages, "Previous/Next" buttons appear
- Navigation between pages works

### ✅ Events Page
- Click "Events" in sidebar
- Should display event cards in 3-column grid
- Each event card shows:
  - Event image (if available)
  - Title
  - Description (truncated)
  - Date in format "Monday, November 27, 2025"
  - Time (if available)
  - Location (if available)
  - Event type (if available)
  - "Upcoming" badge (for future events)
  - "Learn More" button

**Test Pagination:**
- If more than 20 events, pagination controls appear
- Navigation between pages works

---

## Admin Messaging with Staff Filtering

### ✅ Admin Messages Tab
1. Login as admin → `/admin`
2. Navigate to Messaging page (in staff dashboard or admin menu)
3. Should see message list with new **Filter Tabs**:
   - "All" - shows all messages
   - "Staff" - shows only messages from staff users
   - "Drivers" - shows only messages from drivers

**Test Filtering:**
1. Click "Staff" tab
2. Only messages from staff members should appear
3. Click "Drivers" tab
4. Only messages from drivers should appear
5. Click "All" tab
6. All messages appear again

**Test Sending:**
1. Click "New Message"
2. Select a staff member as recipient
3. Send message
4. Message should appear in "Staff" tab only

---

## API Testing (Backend)

### List Staff
```bash
curl -X GET "http://localhost:5000/api/admin/staff?page=1&limit=20" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Get Single Staff
```bash
curl -X GET "http://localhost:5000/api/admin/staff/<STAFF_ID>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Update Staff
```bash
curl -X PUT "http://localhost:5000/api/admin/staff/<STAFF_ID>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "department": "Quality Control"
  }'
```

### Delete Staff
```bash
curl -X DELETE "http://localhost:5000/api/admin/staff/<STAFF_ID>" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Send Message from Staff
```bash
curl -X POST "http://localhost:5000/api/messages" \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "<ADMIN_ID>",
    "subject": "Test Subject",
    "message": "Test message content",
    "type": "staff"
  }'
```

### Get Messages Filtered by Role
```bash
curl -X GET "http://localhost:5000/api/messages?fromRole=staff" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## Permission Testing

### ✅ Staff Cannot Access Admin
1. Login as staff
2. Try to navigate to `http://localhost:3000/admin`
3. Should redirect to home page
4. Should NOT show admin dashboard

### ✅ Admin Cannot Impersonate Staff
1. Create staff account
2. Login as admin
3. Verify `/staff` route redirects (admin not in required roles)
4. Admin should access `/admin` instead

### ✅ Non-Authenticated Cannot Access Staff
1. Logout
2. Try to navigate to `http://localhost:3000/staff`
3. Should redirect to login page

### ✅ Staff Cannot Create Other Staff
1. Login as staff
2. Try to POST to `/api/admin/staff`
3. Should get 403 Forbidden error
4. Error message: "Forbidden - insufficient permissions"

---

## Sample Test Data Commands

### Create Multiple Staff (bash/terminal)
```bash
# Admin token - replace with actual token
TOKEN="your_admin_token_here"

# Create Production Staff
curl -X POST http://localhost:5000/api/admin/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ahmed Production","email":"ahmed@production.com","password":"Pass123","department":"Production"}'

# Create Delivery Staff
curl -X POST http://localhost:5000/api/admin/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Fatima Delivery","email":"fatima@delivery.com","password":"Pass123","department":"Delivery"}'

# Create QC Staff
curl -X POST http://localhost:5000/api/admin/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hassan QC","email":"hassan@qc.com","password":"Pass123","department":"Quality Control"}'

# Create Management Staff
curl -X POST http://localhost:5000/api/admin/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Leila Manager","email":"leila@management.com","password":"Pass123","department":"Management"}'
```

---

## Expected UI Behavior

### Staff Dashboard Flow
```
Login as Staff
    ↓
Redirected to /staff
    ↓
See Dashboard with stats
    ↓
Can navigate via sidebar:
  - Dashboard → Overview
  - Orders → Filtered orders table
  - Messages → Compose/view messages
  - Events → Event grid
    ↓
Click Logout → Redirected to home
```

### Admin Messaging Flow
```
Login as Admin
    ↓
Access Messaging (in staff section or admin menu)
    ↓
See "All | Staff | Drivers" tabs
    ↓
Click "Staff" tab
    ↓
Only staff messages shown
    ↓
Can compose message to staff member
    ↓
Message sends with type="staff"
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized on /api/admin/staff | Missing/invalid token | Verify admin token, check auth header |
| 403 Forbidden on /api/admin/staff | User is not admin | Login as admin, check user.role |
| Redirect to home on /staff | User is not staff | Login as staff account, check role |
| Messages not filtering | Query parameter missing | Ensure ?fromRole=staff in URL |
| Staff can't compose message | Admin ID not found | Verify admin exists in database |
| Timestamp not updating | API not returning dates | Check createdAt field in response |

---

## Success Criteria ✅

After testing, verify:
- [ ] Staff can create account (via admin)
- [ ] Staff can login
- [ ] Staff dashboard loads without errors
- [ ] Staff can view orders (filtered)
- [ ] Staff can send message to admin
- [ ] Staff can view events
- [ ] Admin can see staff messages
- [ ] Admin can filter messages by role (Staff/Drivers)
- [ ] Staff cannot access admin area
- [ ] Role-based permissions enforced
- [ ] Logout clears session
- [ ] All API endpoints return correct status codes

---

## Performance Baselines

- Dashboard load: < 2 seconds
- Orders table load: < 1 second
- Messages load: < 1 second
- Events load: < 1 second
- Message compose submit: < 1 second
- API list endpoint with 20 items: < 500ms

---

## Notes

- All timestamps use UTC+3 (Saudi Arabia timezone)
- Payment method: Cash on Delivery (CoD) only
- Staff cannot see driver deliveries
- Staff can see all orders (for production planning)
- Messages auto-refresh every 10 seconds in admin view
- Messages support both staff→admin and admin→staff direction

