import nodemailer from "nodemailer";

// Gmail SMTP Transport
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email template for order created
function getOrderCreatedTemplate(customer, order) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 20px; }
        .order-info { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D2691E; margin: 15px 0; }
        .order-info p { margin: 8px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍰 EL-Bayader Bakery</h1>
          <p>Order Confirmation</p>
        </div>
        <div class="content">
          <p>Hello <strong>${customer.name}</strong>,</p>
          <p>Thank you for your order! We're excited to prepare your delicious treats.</p>
          
          <div class="order-info">
            <p><span class="label">Order ID:</span> <span class="value">#${order.orderId}</span></p>
            <p><span class="label">Status:</span> <span class="value">${order.status}</span></p>
            <p><span class="label">Total Amount:</span> <span class="value">$${order.totalAmount}</span></p>
            <p><span class="label">Items:</span></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${order.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('')}
            </ul>
            ${order.estimatedDeliveryTime ? `<p><span class="label">Estimated Delivery:</span> <span class="value">${order.estimatedDeliveryTime}</span></p>` : ''}
          </div>
          
          <p>We'll notify you as your order progresses through each stage. If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br><strong>EL-Bayader Bakery Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 EL-Bayader Bakery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email template for order status changed
function getOrderStatusChangedTemplate(customer, order, oldStatus, newStatus) {
  const statusMessages = {
    pending: "Your order has been received and is pending approval.",
    active: "Your order is now being prepared! 👨‍🍳",
    shipped: "Your order is on its way! 🚗",
    delivered: "Your order has been delivered. Enjoy! 🎉",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .header h1 { margin: 0; font-size: 28px; }
        .status-box { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .status-change { text-align: center; font-size: 18px; font-weight: bold; color: #333; margin: 15px 0; }
        .order-info { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D2691E; margin: 15px 0; }
        .order-info p { margin: 8px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍰 EL-Bayader Bakery</h1>
          <p>Order Status Update</p>
        </div>
        <div class="content">
          <p>Hello <strong>${customer.name}</strong>,</p>
          
          <div class="status-box">
            <p style="margin: 0; text-align: center; font-size: 16px;">
              ${statusMessages[newStatus] || `Your order status is now: ${newStatus}`}
            </p>
          </div>
          
          <div class="status-change">
            <span style="color: #999;">Status:</span> 
            <span style="color: #666;">${oldStatus}</span> 
            <span style="margin: 0 10px;">→</span> 
            <span style="color: #4caf50; font-weight: bold;">${newStatus}</span>
          </div>
          
          <div class="order-info">
            <p><span class="label">Order ID:</span> <span class="value">#${order.orderId}</span></p>
            <p><span class="label">Total Amount:</span> <span class="value">$${order.totalAmount}</span></p>
            ${order.estimatedDeliveryTime ? `<p><span class="label">Estimated Delivery:</span> <span class="value">${order.estimatedDeliveryTime}</span></p>` : ''}
          </div>
          
          <p>Thank you for your patience. We appreciate your business!</p>
          
          <p>Best regards,<br><strong>EL-Bayader Bakery Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 EL-Bayader Bakery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email template for event booking
function getEventBookingTemplate(customer, booking) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .header h1 { margin: 0; font-size: 28px; }
        .booking-info { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D2691E; margin: 15px 0; }
        .booking-info p { margin: 8px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 EL-Bayader Bakery</h1>
          <p>Event Booking Confirmation</p>
        </div>
        <div class="content">
          <p>Hello <strong>${customer.name}</strong>,</p>
          <p>Thank you for booking our catering services for your special event!</p>
          
          <div class="booking-info">
            <p><span class="label">Booking ID:</span> <span class="value">#${booking._id}</span></p>
            <p><span class="label">Date Requested:</span> <span class="value">${new Date(booking.dateRequested).toLocaleDateString()}</span></p>
            <p><span class="label">Number of People:</span> <span class="value">${booking.peopleCount}</span></p>
            <p><span class="label">Phone:</span> <span class="value">${booking.phone}</span></p>
            <p><span class="label">Status:</span> <span class="value">${booking.status}</span></p>
            ${booking.message ? `<p><span class="label">Special Requests:</span> <span class="value">${booking.message}</span></p>` : ''}
          </div>
          
          <p>Our team will review your booking and contact you shortly to confirm details and discuss customization options.</p>
          
          <p>We look forward to making your event delicious!</p>
          
          <p>Best regards,<br><strong>EL-Bayader Bakery Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 EL-Bayader Bakery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email template for custom order request
function getCustomOrderRequestTemplate(customer, request) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .header h1 { margin: 0; font-size: 28px; }
        .request-info { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D2691E; margin: 15px 0; }
        .request-info p { margin: 8px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍰 EL-Bayader Bakery</h1>
          <p>Custom Order Request Received</p>
        </div>
        <div class="content">
          <p>Hello <strong>${customer.name}</strong>,</p>
          <p>Thank you for submitting a custom sweets order request! We love creating special treats.</p>
          
          <div class="request-info">
            <p><span class="label">Request ID:</span> <span class="value">#${request._id}</span></p>
            <p><span class="label">Description:</span> <span class="value">${request.description}</span></p>
            <p><span class="label">Quantity:</span> <span class="value">${request.quantity}</span></p>
            ${request.budget ? `<p><span class="label">Budget:</span> <span class="value">$${request.budget}</span></p>` : ''}
            ${request.deliveryDate ? `<p><span class="label">Delivery Date:</span> <span class="value">${new Date(request.deliveryDate).toLocaleDateString()}</span></p>` : ''}
            <p><span class="label">Status:</span> <span class="value">${request.status}</span></p>
            ${request.specialRequests ? `<p><span class="label">Special Requests:</span> <span class="value">${request.specialRequests}</span></p>` : ''}
          </div>
          
          <p>Our pastry team will review your request and contact you within 24 hours to discuss design, flavors, and final pricing.</p>
          
          <p>We can't wait to create something amazing for you!</p>
          
          <p>Best regards,<br><strong>EL-Bayader Bakery Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 EL-Bayader Bakery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send order created email
 */
export async function sendOrderCreatedEmail(customer, order) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: customer.email,
      subject: `Order Confirmation #${order.orderId} - EL-Bayader Bakery`,
      html: getOrderCreatedTemplate(customer, order),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order creation email sent to ${customer.email}`);
  } catch (error) {
    console.error(`Failed to send order created email: ${error.message}`);
    // Do not throw - continue with order processing
  }
}

/**
 * Send order status changed email
 */
export async function sendOrderStatusChangedEmail(
  customer,
  order,
  oldStatus,
  newStatus
) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: customer.email,
      subject: `Order Update #${order.orderId} - Status: ${newStatus}`,
      html: getOrderStatusChangedTemplate(customer, order, oldStatus, newStatus),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status change email sent to ${customer.email}`);
  } catch (error) {
    console.error(`Failed to send order status change email: ${error.message}`);
    // Do not throw - continue with order processing
  }
}

/**
 * Send event booking confirmation email
 */
export async function sendEventBookingEmail(customer, booking) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: customer.email,
      subject: `Event Booking Confirmation - EL-Bayader Bakery`,
      html: getEventBookingTemplate(customer, booking),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event booking email sent to ${customer.email}`);
  } catch (error) {
    console.error(`Failed to send event booking email: ${error.message}`);
    // Do not throw - continue with booking processing
  }
}

/**
 * Send custom order request confirmation email
 */
export async function sendCustomOrderRequestEmail(customer, request) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: customer.email,
      subject: `Custom Order Request Received - EL-Bayader Bakery`,
      html: getCustomOrderRequestTemplate(customer, request),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Custom order request email sent to ${customer.email}`);
  } catch (error) {
    console.error(
      `Failed to send custom order request email: ${error.message}`
    );
    // Do not throw - continue with request processing
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready to send emails");
    return true;
  } catch (error) {
    console.error(`❌ Email service error: ${error.message}`);
    return false;
  }
}
