# 🔧 QUICK DIAGNOSTIC COMMANDS

## Check Backend Order Status Enum

Run this command to check what the backend Order model expects:

### Option 1: Check the file directly
```bash
cd c:\Users\PC\projects\bayader-bakery\backend
cat models/Order.js | findstr enum
```

Should show:
```
enum: ['pending', 'active', 'shipped', 'delivered'],
```

### Option 2: Using grep (better output)
```bash
cd c:\Users\PC\projects\bayader-bakery\backend
grep -A 1 "enum:" models/Order.js
```

---

## Check Actual Order in Database

### Using MongoDB CLI

```bash
# Connect to MongoDB
mongo bayary_DB

# Find one order
db.orders.findOne({})

# Should show:
# {
#   _id: ObjectId(...),
#   status: "pending",  ← Check this value!
#   orderNumber: "ORD-0000001",
#   ...
# }
```

### Check All Unique Status Values

```bash
# Show all different status values in database
db.orders.distinct("status")

# Should return array like:
# [ "pending", "active", "shipped", "delivered" ]
```

---

## Check API Response

### Using Postman or cURL

```bash
# Get orders (replace TOKEN with actual token)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/orders

# Look for orders in response
# Check the "status" field for each order
```

### Using Browser Network Tab

1. Open http://localhost:5173
2. Press F12 → Network tab
3. Go to Staff → Orders
4. Look for request to `/api/orders`
5. Click it → Response tab
6. Look at status field in orders array

```json
{
  "orders": [
    {
      "_id": "...",
      "status": "pending",  ← THIS VALUE
      "orderNumber": "ORD-0000001",
      ...
    }
  ]
}
```

---

## Backend Status Transitions Validation

### Check updateOrderStatus Logic

```bash
cd c:\Users\PC\projects\bayader-bakery\backend
cat controllers/orderController.js | grep -A 20 "validTransitions"
```

Should show:
```javascript
const validTransitions = {
  'pending': ['active', 'delivered'],
  'active': ['shipped', 'delivered'],
  'shipped': ['delivered'],
  'delivered': []
};
```

---

## 🎯 Quick Diagnosis Workflow

### Step 1: Check Backend Model
```
✅ Backend Order.js enum has: pending, active, shipped, delivered
```

### Step 2: Check Database Data
```
✅ Orders in database have status values that match the enum
```

### Step 3: Check API Response
```
✅ API returns orders with valid status values
```

### Step 4: Check Frontend Console
```
✅ Browser console shows debug output with those statuses
```

### Step 5: Check Dropdown
```
✅ Dropdown shows "Shipped (Packaging Complete)" option
```

If any step fails → That's where the issue is!

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: Shipped not in dropdown
**Cause**: Order status is not exactly "active"
**Check**: What does `rawStatus` show in console?
**Fix**: Update validTransitions to include that status

### Issue 2: No options in dropdown
**Cause**: Status value not in validTransitions keys
**Check**: Is order status value in the allTransitionKeys list?
**Fix**: Add it to validTransitions and statuses arrays

### Issue 3: Dropdown shows but wrong options
**Cause**: Transition rules don't include "shipped"
**Check**: What's in availableTransitions for that status?
**Fix**: Add 'shipped' to that status's transitions array

---

## 📋 Information to Collect for Support

If you need help, gather this info:

### Backend Info
```
1. What does backend/models/Order.js enum show?
2. What status values are in your database?
3. What status values do API responses return?
```

### Frontend Info
```
1. What does browser console debug output show?
2. What is the rawStatus value?
3. What is availableStatusesCount?
4. What are availableStatusesLabels?
```

### Reproduction Steps
```
1. What status is the order currently?
2. What status does the dropdown show?
3. When was the order created? (before or after changes)
```

---

## 🚀 How to Apply a Fix (If Needed)

If we find the issue, we'll need to:

1. Update `backend/models/Order.js` - enum values
2. Update `backend/controllers/orderController.js` - transitions  
3. Update `bayader-bakery/src/admin/orders/OrderStatusModal.tsx` - frontend
4. Restart backend: `npm run dev` in backend folder
5. Rebuild frontend: `npm run dev` in bayader-bakery folder

---

## 💡 Pro Tips

- Clear browser cache (Ctrl+Shift+Delete) after frontend changes
- Check console for errors (red text)
- Look for CORS errors if API not responding
- Check backend logs for validation errors
- Verify token is still valid if getting 401 errors

---

**Use these commands to gather diagnostic info, then report back!** 👍
