## API Reference - Orders Management

### Base URL
```
http://localhost:5000/api/orders
```

### Authentication
All endpoints require Bearer token:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get All Orders (Admin/Staff)

```http
GET /api/orders
GET /api/orders?status=pending
GET /api/orders?status=active&page=1&limit=20
```

**Parameters**:
- `status` (optional): Filter by status - pending|active|shipped|delivered
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "user": {
          "_id": "507f1f77bcf86cd799439001",
          "name": "Ahmed Mohammed",
          "email": "ahmed@example.com",
          "phone": "+966501234567"
        },
        "items": [
          {
            "product": "507f1f77bcf86cd799439002",
            "name": "Chocolate Cake",
            "price": 150,
            "quantity": 2,
            "image": "cake.jpg"
          }
        ],
        "totalAmount": 300,
        "status": "pending",
        "deliveryAddress": {
          "city": "Riyadh",
          "phone": "+966501234567"
        },
        "payment": {
          "method": "credit_card",
          "paid": true,
          "transactionId": "TXN123456"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Errors**:
- 401: Unauthorized (no token)
- 403: Forbidden (not admin/staff)

---

### 2. Get Staff Dashboard Orders

```http
GET /api/orders/staff/dashboard
GET /api/orders/staff/dashboard?status=active&page=1&limit=20
```

**Purpose**: Staff-specific endpoint that defaults to pending + active orders

**Parameters**:
- `status` (optional): Override default filter
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response**: Same format as Get All Orders

---

### 3. Get Order Statistics

```http
GET /api/orders/staff/stats
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "pending": 5,
    "active": 3,
    "shipped": 2,
    "delivered": 45
  }
}
```

---

### 4. Get Single Order

```http
GET /api/orders/:id
```

**Parameters**:
- `id` (path): Order MongoDB ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Ahmed Mohammed",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "role": "customer"
    },
    "items": [...],
    "totalAmount": 300,
    "status": "active",
    "deliveryAddress": {...},
    "payment": {...},
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:45:00Z"
  }
}
```

**Errors**:
- 404: Order not found
- 403: Access denied (not owner or admin/staff)

---

### 5. Update Order Status ⭐ CORE ENDPOINT

```http
PATCH /api/orders/:id/status
Content-Type: application/json

{
  "status": "active"
}
```

**Parameters**:
- `id` (path): Order MongoDB ID
- `status` (body): New status to transition to

**Valid Transitions**:
```
pending    → [active, delivered]
active     → [shipped, delivered]
shipped    → [delivered]
delivered  → [] (no transitions allowed)
```

**Response** (200 OK - Success):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "active",
    "updatedAt": "2024-01-15T11:50:00Z",
    ...
  }
}
```

**Response** (400 - Invalid Transition):
```json
{
  "success": false,
  "message": "Cannot transition from pending to shipped"
}
```

**Errors**:
- 400: Invalid transition
- 404: Order not found
- 403: Access denied

---

## Status Values Reference

| Value | Display | Color | Next Options |
|-------|---------|-------|--------------|
| `pending` | Pending | Yellow | active, delivered |
| `active` | Active (Preparing) | Blue | shipped, delivered |
| `shipped` | Shipped | Orange | delivered |
| `delivered` | Delivered | Green | (none) |

---

## Usage Examples

### Example 1: Get Pending Orders

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/orders?status=pending&limit=10"
```

**JavaScript**:
```javascript
const response = await fetch('http://localhost:5000/api/orders?status=pending&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const { data } = await response.json()
console.log(`Found ${data.orders.length} pending orders`)
```

### Example 2: Update Order to Active

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}' \
  "http://localhost:5000/api/orders/507f1f77bcf86cd799439011/status"
```

**JavaScript**:
```javascript
try {
  const response = await fetch(
    `http://localhost:5000/api/orders/${orderId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'active' })
    }
  )
  
  const result = await response.json()
  
  if (result.success) {
    console.log('Order updated:', result.data)
  } else {
    console.error('Error:', result.message)
  }
} catch (error) {
  console.error('Request failed:', error)
}
```

### Example 3: Get Order Statistics

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/orders/staff/stats"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pending": 12,
    "active": 8,
    "shipped": 3,
    "delivered": 127
  }
}
```

### Example 4: Invalid Transition (Error Case)

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"pending"}' \
  "http://localhost:5000/api/orders/507f1f77bcf86cd799439011/status"
```

**Response** (400):
```json
{
  "success": false,
  "message": "Cannot transition from delivered to pending"
}
```

---

## Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Order updated |
| 201 | Created | Order created (not used here) |
| 400 | Bad Request | Invalid transition |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not admin/staff |
| 404 | Not Found | Order doesn't exist |
| 500 | Server Error | Database error |

---

## Service Layer Methods

Using `orderService.ts`:

```typescript
import orderService from '@/admin/services/orderService'

// Get orders with filtering
const { orders, pagination } = await orderService.getOrders(
  'pending',  // status filter (optional)
  1,          // page
  20          // limit
)

// Get single order
const order = await orderService.getOrderById('507f1f77bcf86cd799439011')

// Update status
try {
  const updated = await orderService.updateOrderStatus(
    '507f1f77bcf86cd799439011',
    'active'
  )
  console.log('Updated to:', updated.status)
} catch (error) {
  console.error('Update failed:', error.message)
}

// Get statistics
const stats = await orderService.getOrderStats()
// { pending: 5, active: 3, shipped: 2, delivered: 45 }

// Helper functions
const color = orderService.getStatusColor('active')
// 'bg-blue-100 text-blue-800'

const label = orderService.getStatusLabel('shipped')
// 'Shipped'

const date = orderService.formatDate('2024-01-15T10:30:00Z')
// 'Jan 15, 2024'
```

---

## Data Types

### Order Interface
```typescript
interface Order {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'active' | 'shipped' | 'delivered'
  deliveryAddress: {
    street?: string
    city: string
    phone: string
  }
  payment: {
    method: string
    paid: boolean
    transactionId?: string
  }
  createdAt: string
  updatedAt: string
}
```

### OrderItem Interface
```typescript
interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image?: string
}
```

---

## Error Handling

### Backend Validation
```javascript
// Transition validation happens here
const validTransitions = {
  'pending': ['active', 'delivered'],
  'active': ['shipped', 'delivered'],
  'shipped': ['delivered'],
  'delivered': []
}

if (!validTransitions[currentStatus]?.includes(newStatus)) {
  return res.status(400).json({
    success: false,
    message: `Cannot transition from ${currentStatus} to ${newStatus}`
  })
}
```

### Frontend Error Handling
```typescript
try {
  await orderService.updateOrderStatus(orderId, newStatus)
  // Success - update UI
} catch (error) {
  // Show error message to user
  showError(`Failed to update status: ${error.message}`)
}
```

---

## Rate Limiting

No specific rate limiting configured, but standard HTTP best practices apply:
- Respect server response times
- Cache results where appropriate
- Batch operations when possible

---

## API Version

**Current Version**: 1.0
**Format**: RESTful JSON
**Authentication**: Bearer Token (JWT)
**Status Code**: Standard HTTP

---

**Last Updated**: 2024
**API Stability**: ✅ Stable
**Breaking Changes**: None expected in minor updates
