# Method 1: Create Driver Account Using Admin API
## Step-by-Step Implementation Guide

### Prerequisites Checklist
- ✅ Backend running on `http://localhost:5000`
- ✅ Admin account exists with email and password
- ✅ Driver API endpoint mounted: `/api/admin/drivers`
- ✅ JWT authentication configured

---

## Step 1: Get Admin Token

First, you need to authenticate as admin and get a JWT token.

### Option A: Using cURL (Terminal)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bayader.com",
    "password": "AdminPass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@bayader.com",
      "role": "admin",
      "phone": "+966501234567",
      "address": "Riyadh"
    }
  }
}
```

**📌 IMPORTANT: Copy the `token` value - you'll need it for the next step**

---

### Option B: Using Postman

1. Open Postman
2. Create a new request:
   - **Method:** POST
   - **URL:** `http://localhost:5000/api/auth/login`
3. Go to **Body** tab → Select **raw** → Choose **JSON**
4. Paste:
```json
{
  "email": "admin@bayader.com",
  "password": "AdminPass123"
}
```
5. Click **Send**
6. Copy the `token` from the response

---

## Step 2: Create Driver Account

Now use the admin token to create a driver account.

### Option A: Using cURL

```bash
curl -X POST http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Hassan",
    "email": "ahmed@drivers.com",
    "password": "DriverPass123",
    "phone": "+966501234567",
    "address": "Riyadh, Saudi Arabia"
  }'
```

**Replace:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual token from Step 1

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Driver account created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Ahmed Hassan",
    "email": "ahmed@drivers.com",
    "phone": "+966501234567",
    "address": "Riyadh, Saudi Arabia",
    "role": "driver",
    "department": "Delivery",
    "createdAt": "2025-11-13T10:30:00Z"
  }
}
```

---

### Option B: Using Postman

1. Create a new request:
   - **Method:** POST
   - **URL:** `http://localhost:5000/api/admin/drivers`

2. Go to **Headers** tab and add:
   - **Key:** `Authorization`
   - **Value:** `Bearer {paste_token_here}`

3. Go to **Body** tab → Select **raw** → Choose **JSON**
4. Paste:
```json
{
  "name": "Ahmed Hassan",
  "email": "ahmed@drivers.com",
  "password": "DriverPass123",
  "phone": "+966501234567",
  "address": "Riyadh, Saudi Arabia"
}
```

5. Click **Send**
6. You should see the driver created successfully response

---

## Step 3: Verify Driver Account Works

Test that the newly created driver can login.

### Verify Driver Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@drivers.com",
    "password": "DriverPass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Ahmed Hassan",
      "email": "ahmed@drivers.com",
      "role": "driver",
      "phone": "+966501234567",
      "address": "Riyadh, Saudi Arabia"
    }
  }
}
```

✅ **Success!** Driver can now login and access their dashboard.

---

## Complete Example: Creating Multiple Drivers

### Driver 1: Ahmed Hassan
```bash
curl -X POST http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Hassan",
    "email": "ahmed.hassan@drivers.com",
    "password": "Ahmed@2025",
    "phone": "+966501234567",
    "address": "Riyadh"
  }'
```

### Driver 2: Mohammed Ali
```bash
curl -X POST http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mohammed Ali",
    "email": "mohammed.ali@drivers.com",
    "password": "Mohammed@2025",
    "phone": "+966509876543",
    "address": "Jeddah"
  }'
```

### Driver 3: Fatima Khan
```bash
curl -X POST http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fatima Khan",
    "email": "fatima.khan@drivers.com",
    "password": "Fatima@2025",
    "phone": "+966555555555",
    "address": "Medina"
  }'
```

---

## Step 4: View All Drivers

List all drivers in the system:

```bash
curl -X GET http://localhost:5000/api/admin/drivers \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Ahmed Hassan",
      "email": "ahmed.hassan@drivers.com",
      "phone": "+966501234567",
      "role": "driver",
      "department": "Delivery",
      "createdAt": "2025-11-13T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Mohammed Ali",
      "email": "mohammed.ali@drivers.com",
      "phone": "+966509876543",
      "role": "driver",
      "department": "Delivery",
      "createdAt": "2025-11-13T10:31:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Fatima Khan",
      "email": "fatima.khan@drivers.com",
      "phone": "+966555555555",
      "role": "driver",
      "department": "Delivery",
      "createdAt": "2025-11-13T10:32:00Z"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue 1: "Not authorized, no token"
**Problem:** You didn't include the Authorization header

**Solution:** Make sure to add:
```
-H "Authorization: Bearer {YOUR_TOKEN}"
```

### Issue 2: "Invalid credentials"
**Problem:** Admin email/password is wrong

**Solution:** Verify your admin credentials:
- Email: Check what's in your database
- Password: Make sure it's correct

### Issue 3: "Email already registered"
**Problem:** Driver with that email already exists

**Solution:** Use a different email address

### Issue 4: "Password must be at least 6 characters"
**Problem:** Password is too short

**Solution:** Use password with minimum 6 characters:
```
"password": "DriverPass123"  // ✅ Good
"password": "123"             // ❌ Too short
```

### Issue 5: "Please provide a valid email"
**Problem:** Email format is invalid

**Solution:** Use proper email format:
```
"email": "driver@example.com"  // ✅ Good
"email": "invalid@"             // ❌ Invalid
```

---

## Next Steps After Creating Drivers

Once drivers are created, you can:

1. **View Driver Details:**
```bash
curl -X GET http://localhost:5000/api/admin/drivers/{driver_id} \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}"
```

2. **Update Driver Info:**
```bash
curl -X PUT http://localhost:5000/api/admin/drivers/{driver_id} \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Hassan Updated",
    "phone": "+966509999999"
  }'
```

3. **Reset Driver Password:**
```bash
curl -X POST http://localhost:5000/api/admin/drivers/{driver_id}/reset-password \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPass456"
  }'
```

4. **Delete Driver:**
```bash
curl -X DELETE http://localhost:5000/api/admin/drivers/{driver_id} \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN}"
```

---

## Using Postman Collection (Recommended)

We've prepared a Postman collection: `DriverManagement.postman_collection.json`

### Import Steps:
1. Open Postman
2. Click **Import**
3. Select `backend/postman/DriverManagement.postman_collection.json`
4. Set variables:
   - `{{admin_token}}` - Paste your admin token
   - `{{driver_id}}` - Paste created driver ID
5. Use pre-configured requests

---

## Summary

✅ **Completed:**
- Backend running on port 5000
- Admin API endpoint working
- JWT authentication verified
- Driver creation API ready

🎯 **You can now:**
1. Get admin token via `/api/auth/login`
2. Create drivers via `/api/admin/drivers`
3. Verify drivers can login
4. Manage driver accounts (CRUD operations)

🚀 **Next:** Build frontend admin panel for user-friendly driver management!
