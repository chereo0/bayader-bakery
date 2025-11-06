# Backend Product Requirements Document (PRD) — EL-Bayader

This PRD focuses on backend-only attributes required to implement the bakery web application features described by the product owner. It lists APIs, data models, authentication/authorization, payments, order flow, inventory, notifications, admin endpoints, non-functional requirements, infrastructure, security, monitoring, testing, and acceptance criteria.

---

## 1. Summary & Goals
- Build a secure, scalable, maintainable backend for EL-Bayader to support product catalog, ordering, payments, inventory, notifications, admin operations, and event planning.
- Provide well-documented RESTful APIs (or GraphQL where noted) and maintain clear separation of concerns.
- Ensure compliance with security and data privacy rules.

## 2. Stakeholders
- Product Owner
- Backend Engineers
- Frontend Team
- DevOps / Infrastructure
- QA and Security
- Admin / Operations

## 3. Core Backend Capabilities (Features)
- User Authentication & Authorization
- Product Management
- Online Ordering & Cart
- Payment Processing (pluggable gateways)
- Order Tracking & Status Management
- Inventory Management & Low-stock Alerts
- Notifications (Email, SMS)
- Admin Dashboard APIs and Analytics
- Delivery Management & Assignment
- Customer Feedback & Reviews
- Event Planner workflows
- Reporting & Exports

## 4. API Overview
- API Style: RESTful JSON-first. Provide OpenAPI (Swagger) specification.
- Base URL: /api/v1
- Versioning: header or URL-based (e.g. /api/v1)
- Authentication: Bearer JWT for clients; session tokens for admin portal as required.

### 4.1 Authentication Routes
- POST /api/v1/auth/register
  - Payload: { name, email, phone, password, role?: 'customer'|'staff'|'admin' }
  - Response: { user, token }
- POST /api/v1/auth/login
  - Payload: { email, password }
  - Response: { user, token }
- POST /api/v1/auth/refresh
  - Payload: { refreshToken }
  - Response: { token }
- POST /api/v1/auth/logout
  - Secured

### 4.2 User Management
- GET /api/v1/users/:id
- PUT /api/v1/users/:id
- GET /api/v1/users (admin, paginated)
- DELETE /api/v1/users/:id (admin)

### 4.3 Product Catalog
- GET /api/v1/products (filters, pagination, search)
- GET /api/v1/products/:id
- POST /api/v1/products (admin)
- PUT /api/v1/products/:id (admin)
- DELETE /api/v1/products/:id (admin)
- POST /api/v1/products/:id/images (admin)

Query options: q=search, category, price_min, price_max, sort, in_stock

### 4.4 Cart & Orders
- POST /api/v1/cart (or client-side cart persisted via /carts)
- GET /api/v1/cart
- POST /api/v1/orders
  - Payload: { items: [{ productId, quantity, options }], customerInfo, deliveryInfo, paymentMethod, notes, isPickup }
  - Response: { orderId, status }
- GET /api/v1/orders/:id
- GET /api/v1/orders (customer: own orders; admin: filterable list)
- PUT /api/v1/orders/:id/status (staff/admin)
- POST /api/v1/orders/:id/assign-delivery (admin)

### 4.5 Payments
- POST /api/v1/payments/checkout
  - Payload: { orderId, paymentMethod, paymentDetails }
  - Response: { paymentStatus, transactionId }
- Webhook endpoint: POST /api/v1/payments/webhook (public for gateway callbacks)

Support for: Stripe, PayPal, local gateways (abstract gateway adapter)

### 4.6 Inventory
- GET /api/v1/inventory (list, filters)
- PUT /api/v1/inventory/:productId (adjust stock, admin)
- POST /api/v1/inventory/adjust (batch)
- GET /api/v1/inventory/low (threshold alerts)

Inventory updates triggered on order confirmation and admin adjustments. Provide optimistic concurrency control (versioning) to avoid oversell.

### 4.7 Notifications
- POST /api/v1/notifications/send (internal admin)
- System events send automatic notifications: order placed, order status change, delivery update, promotional.
- Webhook or queue-based dispatcher connects to Email SMS providers (e.g., SES, SendGrid, Twilio)

### 4.8 Reviews & Feedback
- POST /api/v1/products/:id/reviews
- GET /api/v1/products/:id/reviews
- Moderate or flag reviews (admin)

### 4.9 Event Planner
- POST /api/v1/events (customer request)
  - Payload: { customerInfo, eventType, date, theme, items: [{ productId, qty }], notes }
- GET /api/v1/events/:id (admin)
- PUT /api/v1/events/:id/status (admin)
- Connect event orders to inventory & payments

### 4.10 Admin & Analytics
- GET /api/v1/admin/sales (range, aggregation)
- GET /api/v1/admin/top-products
- GET /api/v1/admin/customers (stats)
- GET /api/v1/admin/orders (filterable)

## 5. Data Models (Entity Definitions)
- Use relational DB (Postgres) for transactional consistency. Also provide Redis for caching and queues.

### 5.1 User
- id (uuid)
- name
- email
- phone
- password_hash
- role (customer|staff|admin)
- address(es)
- created_at, updated_at
- metadata (JSON)

### 5.2 Product
- id (uuid)
- name
- description
- price (decimal)
- images [string]
- category
- attributes (JSON) // e.g., flavors, sizes
- stock (int)
- stock_threshold (int)
- is_active (boolean)
- created_at, updated_at

### 5.3 Order
- id (uuid)
- order_number (human friendly)
- customer_id
- items [{ product_id, name, price, qty, options }]
- total_amount (decimal)
- currency
- status (enum: Pending, Confirmed, Preparing, OutForDelivery, Delivered, Cancelled)
- payment_status (Pending, Paid, Failed, Refunded)
- delivery_info { address, eta, driver_id }
- is_pickup (bool)
- created_at, updated_at
- metadata (JSON)

### 5.4 InventoryLog
- id, product_id, delta, reason, source, created_at

### 5.5 PaymentTransaction
- id, order_id, gateway, amount, currency, transaction_id, status, raw_response, created_at

### 5.6 Notification
- id, type, recipient, channel (email/sms), payload (JSON), status, sent_at

### 5.7 EventRequest
- id, customer_id, event_type, date, theme, items, status, assigned_admin, created_at

### 5.8 Review
- id, product_id, customer_id, rating, comment, status (visible/flagged), created_at

## 6. Authentication & Authorization
- Use JWT access tokens (short lived) + refresh tokens stored securely (httpOnly cookie or DB) for session management.
- Passwords: hashed with Argon2 (preferred) or bcrypt with a high work factor.
- Role-based access control (RBAC): middleware to check staff/admin privileges for protected routes.
- Admin portal requires 2FA for critical actions (optional, recommended).

## 7. Payments & Billing
- Implement a Payment Adapter pattern to support multiple gateways.
- All payment interactions should be PCI-compliant (do not store sensitive card details). Use gateway tokens.
- Provide a webhook handler that validates gateway signatures and updates payment/order status idempotently.

## 8. Inventory Handling
- Decrement stock only when payment succeeds (or on order confirmation for cash on delivery, based on business rules).
- Use DB transactions to update order and inventory atomically.
- Provide optimistic locking on Product stock to avoid oversell (version number or SELECT ... FOR UPDATE).
- Generate low-stock alerts via background job and send notifications to admin.

## 9. Notifications & Messaging
- Use a message queue (e.g., RabbitMQ, AWS SQS) or background worker (e.g., BullMQ) for asynchronous tasks: send emails/SMS, generate reports, update analytics.
- Worker responsibilities: process payments webhooks, send notifications, resize/store uploaded images, generate daily reports.

## 10. Delivery Management
- Data model: Driver (id, name, phone, vehicle), DeliveryAssignment (order_id, driver_id, status, ETA)
- Admin endpoints to assign/unassign drivers and to update delivery status.
- Optionally expose a driver mobile API to update location and status; aggregate location updates for real-time tracking (via WebSocket).

## 11. Admin Dashboard & Analytics
- Backend exposes aggregated endpoints for dashboards (sales per day/week/month, top products, active customers).
- Use cron jobs or event-driven rollups to maintain materialized views for fast queries.

## 12. File Storage & Images
- Store uploaded images in object storage (AWS S3 or compatible). Generate signed URLs for client access.
- Thumbnails & optimized images should be generated by background workers and stored alongside originals.

## 13. Infrastructure & Deployment
- Containerized services (Docker) and orchestration (Kubernetes) or serverless (ECS/Fargate) depending on scale.
- Environments: dev, staging, production. CI/CD pipeline for automated tests and deployments.
- Use managed Postgres (RDS/Aurora) and Redis (Elasticache) when possible.

## 14. Security & Compliance
- HTTPS everywhere. HSTS. Secure cookies.
- Input validation, rate limiting, request throttling for public endpoints.
- OWASP best practices, helmet headers, sanitization.
- Audit logging for admin actions.
- Data retention and deletion policy; PII handling and privacy compliance (GDPR/local laws).

## 15. Monitoring & Observability
- Application metrics (Prometheus) and logs (ELK or managed service). Alerting for errors, high latency, and low stock.
- Distributed tracing (Jaeger/X-Ray) for request flows.

## 16. Testing Strategy
- Unit tests for services and adapters.
- Integration tests for APIs with test DB.
- End-to-end tests for critical flows (registration, ordering, payments).
- Security tests and periodic penetration testing.

## 17. Backup & Disaster Recovery
- Regular DB backups (daily), point-in-time recovery enabled.
- Test restoration procedures quarterly.

## 18. Non-Functional Requirements (backend-specific)
- Performance: Handle 100 concurrent users; scale horizontally using stateless services behind load balancers.
- Latency: API responses < 200ms for core endpoints under normal load.
- Availability: 99.9% uptime target for critical services.
- Scalability: Auto-scaling based on CPU, queue length, or latency.
- Maintainability: Modular codebase, clear separation, and documented APIs.

## 19. API Security & Rate Limiting
- API keys for partners/third-party integrations.
- Rate limits per IP and per API key; separate tiers for public vs authenticated endpoints.

## 20. Data Privacy
- Encrypt sensitive fields at rest when required.
- Provide endpoints to export or delete user data per regulations.

## 21. DevOps & CI/CD
- Automated builds, tests, linting on PRs.
- Canary or blue/green deployments for production updates.
- Rollback procedures and health checks.

## 22. Acceptance Criteria
- All listed endpoints implemented with tests.
- Authentication flows: register/login/refresh/logout working for all roles.
- Order lifecycle implemented with correct inventory and payment flow.
- Notifications sent on key events.
- Admin analytics endpoints return accurate aggregates.
- Backup and recovery procedures documented and tested.

## 23. Appendix: Integration Points
- Payment Gateways (Stripe, PayPal, local)
- SMS/Email (Twilio, SendGrid, SES)
- Object Storage (S3)
- Analytics/Monitoring services

---

This PRD is intended as a living document — add implementation-level details, wireframes, or team-specific constraints as the project progresses.
