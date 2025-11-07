# 🚀 QUICK START - CUSTOMER PROFILE

## Access the Profile Page
```
URL: http://localhost:5173/profile
```

---

## 🔑 How to Test (Step by Step)

### 1️⃣ LOGIN FIRST
```
1. Go to http://localhost:5173/login
2. Enter any registered user email and password
3. Click "Log In"
4. You'll be logged in
```

### 2️⃣ ACCESS PROFILE
```
Option A: Click Header Dropdown
  1. Click "Welcome, [Name]" in top-right header
  2. Click "My Profile" from dropdown

Option B: Direct URL
  1. Go directly to http://localhost:5173/profile
```

### 3️⃣ VIEW YOUR PROFILE
```
You should see:
✅ Your user information displayed
✅ Full Name
✅ Email Address
✅ Phone Number
✅ Address
✅ Buttons for Edit Profile, Change Password, Logout
```

### 4️⃣ EDIT YOUR PROFILE
```
1. Click "✏️ Edit Profile" button
2. Form appears with your current data
3. Update your name, phone, or address
4. Email field is disabled (cannot change)
5. Click "💾 Save Changes"
6. Success message appears
7. Data updates immediately
8. Check header - your name should update there too
```

### 5️⃣ CHANGE YOUR PASSWORD
```
1. Click "🔐 Change Password" button
2. Enter a NEW password (minimum 6 characters)
3. Confirm the new password
4. Click "🔐 Update Password"
5. Success message appears
6. Form clears automatically
7. Next login: Use new password
```

### 6️⃣ TEST QUICK LINKS
```
Click "📦 My Orders"      → Goes to /orders
Click "🍰 Browse Products" → Goes to /products
```

### 7️⃣ LOGOUT
```
1. Click "🚪 Logout" button
2. Confirmation dialog appears
3. Click confirm to logout
4. Redirected to home page
5. Header now shows Login/Signup buttons
6. Try accessing /profile → Redirected to login
```

---

## 🧪 ERROR TESTING

### Test Invalid Password Change
```
1. Click "Change Password"
2. Enter password with only 5 characters
3. Click "Update Password"
4. Error message: "Password must be at least 6 characters"
```

### Test Mismatched Passwords
```
1. Click "Change Password"
2. Enter "newpassword123" in New Password
3. Enter "differentpass123" in Confirm Password
4. Click "Update Password"
5. Error message: "New passwords do not match"
```

### Test Network Error
```
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Click "Offline" checkbox to simulate offline
4. Click "Edit Profile" → "Save Changes"
5. Error message: "Failed to update profile"
6. Uncheck "Offline" to restore network
```

---

## 📱 RESPONSIVE TESTING

### Mobile (< 768px)
```
1. Open browser DevTools (F12)
2. Click device toggle (iPhone icon)
3. Select any mobile device
4. All forms should stack vertically
5. Buttons should be full-width
6. Avatar and info should be centered
```

### Tablet (768px - 1024px)
```
1. Set viewport width to ~800px
2. Quick links should show side-by-side
3. Forms should have proper padding
```

### Desktop (> 1024px)
```
1. Full layout with proper spacing
2. Multiple columns where applicable
3. Hover effects on buttons
```

---

## ✅ COMPLETE FEATURE CHECKLIST

- [ ] Can access profile while logged in
- [ ] Cannot access profile when logged out (redirects to login)
- [ ] All user information displays correctly
- [ ] Can edit name, phone, address
- [ ] Cannot edit email
- [ ] Edit form has cancel button
- [ ] Changes save successfully
- [ ] Success message appears after save
- [ ] Can change password with validation
- [ ] Password must be 6+ characters
- [ ] Passwords must match
- [ ] Can logout with confirmation
- [ ] Profile links in header work
- [ ] Page is responsive on mobile
- [ ] Quick links navigate correctly
- [ ] Error messages are user-friendly
- [ ] Data persists after page reload
- [ ] Header shows updated name after edit

---

## 🔍 DEVELOPER CONSOLE

### Check If Everything Works
Open DevTools (F12) → Console tab:

```javascript
// Check if user is loaded
console.log("User:", window.localStorage.getItem('user'));

// Check if token is stored
console.log("Token:", window.localStorage.getItem('token'));

// Check if auth context is working
// (visible in React DevTools if installed)
```

---

## 🆘 TROUBLESHOOTING

### Profile Page Not Loading
```
❌ Fix: Make sure you're logged in
✅ Verify: Check if you see "Welcome, [Name]" in header
✅ Try: Log out and log in again
```

### Changes Not Saving
```
❌ Check: Is network connection active?
❌ Check: Are you getting an error message?
✅ Try: Refresh page and try again
✅ Try: Open browser DevTools → Network tab
        and check the PUT request status
```

### Password Change Not Working
```
❌ Check: Is new password at least 6 characters?
❌ Check: Do passwords match?
✅ Try: Check error message for details
✅ Try: Refresh and try again
```

### Still Logged In After Logout Click
```
❌ Fix: Make sure to confirm logout in the dialog
✅ Try: Click logout → wait for confirmation dialog
✅ Try: Check browser console for errors
```

---

## 📞 SUPPORT

For issues or questions:
1. Check the error message on screen
2. Open browser DevTools (F12)
3. Check Console tab for any JavaScript errors
4. Check Network tab to see API responses
5. Refer to full documentation in `PROFILE_IMPLEMENTATION.md`

---

## 🎉 SUCCESS INDICATORS

When everything works correctly, you should see:
✅ Profile page loads instantly
✅ All your information displays
✅ Edit form saves without errors
✅ Password change works
✅ Header updates after changes
✅ Navigation links work properly
✅ No console errors (red icons in DevTools)
✅ Network requests show 200 status code

---

**Status: 🟢 READY TO USE**

Happy testing! 🎊
