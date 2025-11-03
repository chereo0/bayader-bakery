# Postman Testing Guide for Admin Endpoints

## Setup

### 1. Base URL
```
http://localhost:5000/api
```

### 2. Get Admin Token

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@bayader.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@bayader.com",
      "role": "admin"
    }
  }
}
```

**Copy the token from the response** - you'll need it for all admin endpoints.

---

## Setting Up Authorization in Postman

For all admin endpoints below, you need to:

1. Go to **Headers** tab
2. Add a new header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN_HERE`

Replace `YOUR_TOKEN_HERE` with the actual token from the login response.

---

## Admin Endpoints Testing

### 1. CREATE PRODUCT (Admin Only)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/products`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Strawberry Cheesecake",
  "category": "Cakes",
  "description": "Creamy cheesecake with fresh strawberries on top",
  "price": 39.99,
  "stock": 8,
  "image": "/images/cheesecake.jpg",
  "ingredients": ["Cream Cheese", "Graham Crackers", "Strawberries", "Sugar", "Eggs"]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Strawberry Cheesecake",
    "category": "Cakes",
    "description": "Creamy cheesecake with fresh strawberries on top",
    "price": 39.99,
    "stock": 8,
    "status": "Active",
    "image": "/images/cheesecake.jpg",
    "ingredients": ["Cream Cheese", "Graham Crackers", "Strawberries", "Sugar", "Eggs"],
    "reviews": [],
    "averageRating": 0,
    "totalReviews": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 2. UPDATE PRODUCT (Admin Only)

**Method:** `PUT`  
**URL:** `http://localhost:5000/api/products/:id`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Replace `:id` with an actual product ID from your database.

**Request Body (partial update):**
```json
{
  "price": 35.99,
  "stock": 12,
  "description": "Updated: Delicious creamy cheesecake with fresh strawberries"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Strawberry Cheesecake",
    "price": 35.99,
    "stock": 12,
    "description": "Updated: Delicious creamy cheesecake with fresh strawberries",
    ...
  }
}
```

---

### 3. DELETE PRODUCT (Admin Only)

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/products/:id`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Replace `:id` with the product ID you want to delete.

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 4. GET LOW STOCK PRODUCTS (Admin/Staff)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/products/inventory/low-stock`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Optional Query Parameters:**
- `threshold` - Stock threshold (default: 10)

**Example:** `http://localhost:5000/api/products/inventory/low-stock?threshold=15`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "Cinnamon Rolls",
        "category": "Pastries",
        "stock": 8,
        "price": 18.99
      },
      {
        "_id": "...",
        "name": "Red Velvet Cake",
        "category": "Cakes",
        "stock": 10,
        "price": 34.99
      }
    ],
    "count": 2,
    "threshold": 15
  }
}
```

---

### 5. UPDATE PRODUCT STOCK (Admin/Staff)

**Method:** `PATCH`  
**URL:** `http://localhost:5000/api/products/:id/stock`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body Options:**

**Option 1 - Set exact stock:**
```json
{
  "quantity": 50,
  "operation": "set"
}
```

**Option 2 - Add to stock:**
```json
{
  "quantity": 10,
  "operation": "add"
}
```

**Option 3 - Subtract from stock:**
```json
{
  "quantity": 5,
  "operation": "subtract"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Classic Chocolate Cake",
    "stock": 50,
    "status": "Active",
    ...
  }
}
```

---

## Public Endpoints (No Auth Required)

### 6. GET ALL PRODUCTS

**Method:** `GET`  
**URL:** `http://localhost:5000/api/products`

**Optional Query Parameters:**
- `category` - Filter by category (Cakes, Pastries, Breads, Cookies, etc.)
- `status` - Filter by status (Active, Inactive, Out of Stock)
- `search` - Search in name and description
- `sort` - Sort field (default: -createdAt)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Examples:**
- Get cakes only: `http://localhost:5000/api/products?category=Cakes`
- Search products: `http://localhost:5000/api/products?search=chocolate`
- Paginate: `http://localhost:5000/api/products?page=2&limit=10`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

---

### 7. GET PRODUCT BY ID

**Method:** `GET`  
**URL:** `http://localhost:5000/api/products/:id`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Classic Chocolate Cake",
    "category": "Cakes",
    "description": "Rich and moist chocolate cake...",
    "price": 29.99,
    "stock": 15,
    "status": "Active",
    "image": "/images/cakes.jpg",
    "ingredients": [...],
    "reviews": [...],
    "relatedProducts": [...],
    "averageRating": 0,
    "totalReviews": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Testing Error Cases

### Test 1: Create Product Without Auth
**URL:** `POST http://localhost:5000/api/products`  
**Headers:** (No Authorization header)  
**Expected Response (401):**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

---

### Test 2: Create Product With Customer Token
Login as a customer first, then try to create a product.

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

---

### Test 3: Invalid Product ID
**URL:** `GET http://localhost:5000/api/products/invalid_id`  
**Expected Response (404 or 500):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## Quick Testing Checklist

- [ ] Login as admin and get token
- [ ] Create a new product
- [ ] Update the product
- [ ] Get all products (public)
- [ ] Get product by ID (public)
- [ ] Get low stock products
- [ ] Update product stock (add/subtract/set)
- [ ] Delete the product
- [ ] Test without token (should fail with 401)
- [ ] Test with customer token (should fail with 403)

---

## Tips for Postman

1. **Save the token as an environment variable:**
   - Create a new environment in Postman
   - Add variable: `admin_token`
   - Use it in headers: `Bearer {{admin_token}}`

2. **Create a collection:**
   - Group all these requests in a collection
   - Set collection-level authorization with the token

3. **Use Tests tab:**
   Add this script to automatically save the token after login:
   ```javascript
   if (pm.response.code === 200 || pm.response.code === 201) {
       const response = pm.response.json();
       if (response.data && response.data.token) {
           pm.environment.set("admin_token", response.data.token);
       }
   }
   ```

---

## Sample Product Data for Testing

```json
{
  "name": "Blueberry Muffins",
  "category": "Pastries",
  "description": "Fresh baked muffins with real blueberries",
  "price": 8.99,
  "stock": 20,
  "image": "/images/muffins.jpg",
  "ingredients": ["Flour", "Blueberries", "Sugar", "Eggs", "Butter"]
}
```

```json
{
  "name": "Custom Birthday Cake",
  "category": "Custom Orders",
  "description": "Personalized birthday cake - contact us for custom designs",
  "price": 79.99,
  "stock": 0,
  "status": "Out of Stock",
  "image": "/images/birthday-cake.jpg",
  "ingredients": ["Flour", "Sugar", "Eggs", "Butter", "Custom Decorations"]
}
```
