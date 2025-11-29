# Quick Start - Staff Module Features

## 🎯 What Staff Users Can Now Do

### 1. Manage Orders (New!)
Navigate to: **Dashboard → Orders**
- View all orders
- Click action button based on status
- "▶ Start Preparing" (pending → active)
- "✓ Mark Ready" (active → shipped)  
- "📦 Mark Delivered" (shipped → delivered)
- Get confirmation dialog before each change
- See success/error toast notifications

### 2. Monitor Materials (New!)
Navigate to: **Dashboard → Materials**
- View all materials with stock levels
- See "Good" or "Low Stock" badges
- For low stock items: Click "⚠️ Report Shortage"
- Sends automatic message to admin
- Admin notified immediately

### 3. Manage Account (New!)
Navigate to: **Dashboard → Settings**

**Profile Tab:**
- Edit name and phone
- View email and department (read-only)

**Password Tab:**
- Change password securely
- Requires current password verification
- New password must be 6+ characters

**Preferences Tab:**
- Choose language: English / العربية
- Choose theme: Light / Dark
- Set timezone: UTC+3 / UTC+2 / UTC+1 / UTC
- Toggle email & push notifications

---

## 🔐 What Staff CANNOT Do

❌ Cancel orders (admin only)
❌ Move orders backward
❌ Skip order statuses  
❌ Edit materials
❌ Access admin dashboard
❌ Manage drivers
❌ Create new accounts

---

## 📱 Navigation Menu

```
STAFF MENU
├── 🏠 Dashboard        ← Overview & alerts
├── 📋 Orders          ← Status updates (ENHANCED)
├── 💬 Messages        ← Communication with admin
├── 📦 Materials       ← Stock monitoring (NEW)
├── ⚙️  Settings        ← Account & preferences (NEW)
└── 📅 Events          ← Schedule
```

---

## 🚀 Order Workflow Step-by-Step

```
1. PENDING ORDERS
   └─→ Staff clicks [▶ Start Preparing]
       └─→ Dialog: "Confirm? pending → active?"
           └─→ Status changes to ACTIVE
               └─→ ✅ Toast: "Updated to active"

2. ACTIVE ORDERS  
   └─→ Staff clicks [✓ Mark Ready]
       └─→ Dialog: "Confirm? active → shipped?"
           └─→ Status changes to SHIPPED
               └─→ ✅ Toast: "Updated to shipped"

3. SHIPPED ORDERS
   └─→ Staff clicks [📦 Mark Delivered]
       └─→ Dialog: "Confirm? shipped → delivered?"
           └─→ Status changes to DELIVERED
               └─→ ✅ Toast: "Updated to delivered"

4. COMPLETED ORDERS
   └─→ Shows [✓ Complete] - No action needed
```

---

## 📊 Materials Dashboard

**Summary Cards:**
- Total Materials: Count of all materials
- Good Stock: Items above reorder level
- Low Stock: Items at or below reorder level

**Table:**
| Material | Current | Reorder | Unit | Status | Action |
|----------|---------|---------|------|--------|--------|
| Flour | 50kg | 40kg | kg | ✓ Good | — |
| Sugar | 5kg | 10kg | kg | ⚠️ Low | [Report] |

**Report Shortage:**
- Dialog confirms: Material name, current stock, reorder level
- Message sent to admin with full details
- Admin can then order more supplies

---

## ⚙️ Settings Panels

### Profile
```
Name:       [_______________]  (editable)
Email:      staff@bakery.com   (read-only)
Phone:      [_______________]  (editable)
Department: Production         (admin sets)
[Save Changes]
```

### Password
```
Current:    [_______________]  (required)
New:        [_______________]  (6+ chars)
Confirm:    [_______________]  (must match)
[Change Password]
```

### Preferences
```
Language:   [English ▼]
Theme:      [Light ▼]
Timezone:   [UTC+3 ▼]

📧 Email Notifications    ☑️
📱 Push Notifications     ☑️

[Save Preferences]
```

---

## 🔔 Toast Messages

**Success (Green):**
- "Order #001 updated to active"
- "Profile updated successfully"
- "Stock shortage report sent for Flour"
- "Password changed successfully"
- "Preferences updated successfully"

**Error (Red):**
- "Cannot transition from 'shipped' to 'pending'"
- "Order not found"
- "Validation failed"
- "Passwords do not match"
- "Password must be at least 6 characters"

---

## 🎨 Status Badges

```
🟨 Pending (Yellow)    - Waiting to start
🔵 Active (Blue)       - Being prepared
🟣 Shipped (Purple)    - Ready for delivery
🟢 Delivered (Green)   - Complete
```

---

## 📞 Common Tasks

**Update an Order:**
1. Go to Orders
2. Find order → Click button
3. Confirm in dialog
4. Done! ✅

**Report Low Stock:**
1. Go to Materials
2. Find low-stock item (red badge)
3. Click "Report Shortage"
4. Confirm in dialog
5. Admin gets notified ✅

**Change Password:**
1. Go to Settings
2. Click "Password" tab
3. Enter current + new password
4. Click "Change Password"
5. Done! ✅

**Update Preferences:**
1. Go to Settings
2. Click "Preferences" tab
3. Change language/theme/timezone
4. Toggle notifications
5. Click "Save Preferences"
6. Done! ✅

---

## ⚡ Pro Tips

**Tip 1:** Orders are color-coded by status
- Find what you need quickly
- Filter by status to focus on pending/active

**Tip 2:** Confirmation dialogs prevent accidents
- Take your time to review
- Always read before confirming

**Tip 3:** Toasts auto-dismiss after 4 seconds
- But you can keep notifications visible
- Check your settings for notification options

**Tip 4:** Materials are read-only
- You can only view and report
- Admin decides what to order

**Tip 5:** Settings save immediately
- Changes apply instantly
- No extra save button needed for preferences

---

## 🆘 Need Help?

**Confused about order workflow?**
→ See "Order Workflow Step-by-Step" above

**Don't see an order?**
→ Check the status filter
→ Try "All Orders" instead of filtered

**Report didn't go through?**
→ Check notification at top-right
→ If error, read the message carefully
→ Try again or contact admin

**Password change failed?**
→ Passwords must be 6+ characters
→ New passwords must match
→ Current password might be wrong

**Settings not saving?**
→ Check network connection
→ Make sure you clicked "Save"
→ Try refreshing the page

---

## 📅 Typical Day Workflow

```
MORNING: Dashboard
├─ Check pending orders count
├─ Review stock alerts
└─ Check messages from admin

WORK HOURS: Orders → Materials
├─ Process pending → active
├─ Monitor stock levels
├─ Update shipped orders
└─ Report any shortages

END OF DAY: Settings (optional)
├─ Update profile if needed
└─ Check preferences
```

---

**Remember:** You're the backbone of production! 
Your order updates keep everything running smoothly.

For detailed technical info, see: **STAFF_IMPLEMENTATION_COMPLETE.md**

