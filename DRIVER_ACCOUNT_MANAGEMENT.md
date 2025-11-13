# Driver Account Management Guide

## Overview
This guide explains the best ways to create and manage driver accounts in the Bayader Bakery system. There are multiple methods available depending on your needs.

---

## Method 1: Admin Creates Driver Account (Recommended) ⭐

**Best For:** Admin managing driver onboarding, controlled account creation

### Backend API Endpoint
```
POST /api/admin/drivers
Headers: Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "SecurePass123",
  "phone": "+966501234567",
  "address": "Riyadh, Saudi Arabia"
}

Response (201 Created):
{
  "success": true,
  "message": "Driver account created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "address": "Riyadh, Saudi Arabia",
    "role": "driver",
    "department": "Delivery",
    "createdAt": "2025-11-13T10:30:00Z"
  }
}
```

### Using cURL (Terminal)
```bash
curl -X POST http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mohammed Ali",
    "email": "mohammed@example.com",
    "password": "SecurePass123",
    "phone": "+966501234567",
    "address": "Jeddah, Saudi Arabia"
  }'
```

### Using Postman
1. New Request → POST
2. URL: `http://localhost:5000/api/admin/drivers`
3. Headers:
   - `Authorization: Bearer {admin_token}`
   - `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "name": "Fatima Khan",
     "email": "fatima@example.com",
     "password": "SecurePass123",
     "phone": "+966501234567",
     "address": "Medina, Saudi Arabia"
   }
   ```
5. Send

---

## Method 2: Admin Management Panel (Frontend) 

**Best For:** User-friendly UI for managing drivers

### Steps to Create Driver Panel (To be built):
1. Navigate to Admin Dashboard → Drivers Management
2. Click "Add New Driver"
3. Fill form:
   - Name
   - Email
   - Phone
   - Address
   - Set password
4. Click "Create Driver"
5. System displays success message with credentials

---

## Method 3: Self-Registration (Optional - Not Recommended for drivers)

**Best For:** Driver sign-up but requires email verification

### Would require:
1. Special registration endpoint with verification
2. Email confirmation before account activation
3. Role assignment after verification

⚠️ **Note:** Currently, registration endpoint assigns 'customer' role. This method needs approval/email verification workflow.

---

## Driver Account Lifecycle

### Creating Driver
```
Admin → POST /api/admin/drivers → Driver Created with role='driver'
```

### Viewing All Drivers
```
GET /api/admin/drivers
Headers: Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "count": 3,
  "data": [
    { id, name, email, phone, role, department, createdAt },
    ...
  ]
}
```

### Viewing Single Driver
```
GET /api/admin/drivers/{driver_id}
Headers: Authorization: Bearer {admin_token}
```

### Updating Driver Info
```
PUT /api/admin/drivers/{driver_id}
Headers: Authorization: Bearer {admin_token}

Body (any of these):
{
  "name": "New Name",
  "phone": "+966501234567",
  "address": "New Address",
  "email": "newemail@example.com"
}
```

### Resetting Driver Password
```
POST /api/admin/drivers/{driver_id}/reset-password
Headers: Authorization: Bearer {admin_token}

Body:
{
  "newPassword": "NewSecurePass123"
}
```

### Deleting Driver
```
DELETE /api/admin/drivers/{driver_id}
Headers: Authorization: Bearer {admin_token}
```

---

## Database Fields for Driver Account

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: "driver" (fixed),
  phone: String,
  address: String,
  department: "Delivery" (fixed),
  settings: {
    notifications: {
      email: Boolean (default: true),
      push: Boolean (default: true),
      sms: Boolean (default: false)
    },
    preferences: {
      language: String (default: "en"),
      theme: String (default: "light"),
      timezone: String (default: "UTC+3")
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Best Practices

### ✅ DO:
- Use strong passwords (minimum 6 characters, recommend 10+)
- Reset password if driver forgets it
- Keep admin credentials secure
- Verify phone number during onboarding
- Log all driver account changes (audit trail)

### ❌ DON'T:
- Share driver credentials via unencrypted email
- Reuse same password across drivers
- Store passwords in plaintext
- Allow self-assignment of driver role
- Skip email verification for contact

### Password Requirements:
- Minimum 6 characters
- Recommended: Mix of uppercase, lowercase, numbers, special characters
- Example: `Driver@2025!Bayader`

---

## Example: Complete Driver Creation Flow

### Step 1: Get Admin Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bayader.com",
    "password": "AdminPass123"
  }'
# Response includes token
```

### Step 2: Create Driver
```bash
curl -X POST http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer {token_from_step1}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Omar Hassan",
    "email": "omar@drivers.com",
    "password": "OmarDriver123",
    "phone": "+966551234567",
    "address": "Riyadh Downtown"
  }'
```

### Step 3: Driver Logs In
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "omar@drivers.com",
    "password": "OmarDriver123"
  }'
# Now driver has access to their dashboard
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | /api/admin/drivers | ✅ | admin | Create new driver |
| GET | /api/admin/drivers | ✅ | admin, staff | List all drivers |
| GET | /api/admin/drivers/:id | ✅ | admin, staff | Get driver details |
| PUT | /api/admin/drivers/:id | ✅ | admin, staff | Update driver info |
| DELETE | /api/admin/drivers/:id | ✅ | admin | Delete driver |
| POST | /api/admin/drivers/:id/reset-password | ✅ | admin | Reset password |

---

## Validation Rules

### Email
- Must be valid email format (user@domain.com)
- Must be unique (not already registered)
- Case-insensitive comparison

### Password
- Minimum 6 characters
- Required during creation
- Hashed using bcrypt before storage

### Phone
- No specific format validation (flexible)
- Recommended: Include country code

### Name
- Required
- Trimmed of whitespace
- No length limit (use reasonable limits in UI)

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Please provide name, email, password, and phone"
}
```

### Email Already Exists (409)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Driver not found"
}
```

### Unauthorized (403)
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

---

## Testing Driver Account

### Verify Driver Can Log In
```bash
# Login with driver credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }'
```

### Access Driver Endpoints
```bash
# Get current driver profile
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {driver_token}"
```

---

## Future Enhancements

1. **Bulk Import**: Upload CSV file with multiple drivers
2. **Email Invitation**: Send invitation links instead of sharing passwords
3. **Driver Dashboard**: Custom dashboard for drivers (track deliveries, earnings, etc.)
4. **Audit Logging**: Track all driver account changes
5. **2FA/MFA**: Two-factor authentication for driver accounts
6. **Geolocation**: Track driver location during deliveries
7. **Performance Metrics**: Track delivery times, ratings, etc.
8. **Auto-Deactivation**: Disable inactive drivers

---

## Summary

**Recommended Flow for Creating Driver Accounts:**

1. **Best Practice:** Admin creates account via API with secure password
2. **Share Credentials:** Send via secure channel (not email)
3. **First Login:** Driver logs in and changes password
4. **Verification:** Confirm phone number and address
5. **Assignment:** Assign to delivery zones/regions
6. **Monitoring:** Track deliveries and performance

**Implementation Status:**
- ✅ Backend API complete
- ✅ Admin routes secured with role-based access
- ⏳ Frontend Admin Panel (to be built)
- ⏳ Driver Dashboard (to be built)
- ⏳ Audit Logging (to be built)
