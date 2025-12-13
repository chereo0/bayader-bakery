const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Notification Helper
 * Centralized system for creating and sending notifications to appropriate users
 */

// Notification templates for different events and roles
const notificationTemplates = {
  // Order-related notifications
  orderCreated: {
    customer: (order) => ({
      title: '🎉 Order Placed Successfully',
      message: `Your order #${order.orderNumber} has been received. Total: $${order.totalAmount.toFixed(2)}`,
      type: 'success',
      actionUrl: '/orders'
    }),
    staff: (order) => ({
      title: '📋 New Order Received',
      message: `Order #${order.orderNumber} - ${order.items.length} items. Total: $${order.totalAmount.toFixed(2)}`,
      type: 'alert',
      actionUrl: '/staff/orders'
    }),
    admin: (order) => ({
      title: '📦 New Order',
      message: `Order #${order.orderNumber} from ${order.user?.name || 'Customer'}. Total: $${order.totalAmount.toFixed(2)}`,
      type: 'info',
      actionUrl: '/admin'
    })
  },

  orderStatusChanged: {
    customer: (order, newStatus) => {
      const statusMessages = {
        // Backend statuses
        confirmed: '✅ Your order has been confirmed and is being prepared',
        preparing: '👨‍🍳 Your order is being prepared by our team',
        'out-for-delivery': `🚚 Your order is ${order.isPickup ? 'ready for pickup!' : 'out for delivery!'}`,
        delivered: '🎊 Your order has been delivered. Enjoy!',
        cancelled: '❌ Your order has been cancelled',
        // Staff UI statuses (mapping)
        pending: '⏳ Your order is pending confirmation',
        active: '👨‍🍳 Your order is being prepared by our team',
        shipped: `🚚 Your order is ${order.isPickup ? 'ready for pickup!' : 'out for delivery!'}`,
        processing: '⚙️ Your order is being processed'
      };
      
      return {
        title: `Order #${order.orderNumber} ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: statusMessages[newStatus] || `Status updated to ${newStatus}`,
        type: 'info',
        actionUrl: '/orders'
      };
    },
    driver: (order, newStatus) => {
      if (newStatus === 'out-for-delivery' && order.assignedDriver) {
        return {
          title: '🚗 Delivery Assignment',
          message: `Order #${order.orderNumber} assigned to you. ${order.isPickup ? 'Pickup' : 'Delivery'} to ${order.deliveryAddress?.city || order.pickupLocation}`,
          type: 'alert',
          actionUrl: '/driver'
        };
      }
      return null;
    },
    staff: (order, newStatus) => ({
      title: `📊 Order #${order.orderNumber} Updated`,
      message: `Status changed to: ${newStatus.toUpperCase()}`,
      type: 'info',
      actionUrl: '/staff/orders'
    }),
    admin: (order, newStatus) => ({
      title: `📊 Order #${order.orderNumber} Status Updated`,
      message: `Order status changed to: ${newStatus.toUpperCase()}. Total: $${order.totalAmount?.toFixed(2)}`,
      type: 'info',
      actionUrl: '/admin'
    })
  },

  orderAssignedDriver: {
    driver: (order, driver) => ({
      title: '🚗 New Delivery Assignment',
      message: `You've been assigned Order #${order.orderNumber}. ${order.isPickup ? 'Pickup' : 'Delivery'} - ${order.deliveryAddress?.city || order.pickupLocation}`,
      type: 'alert',
      actionUrl: '/driver'
    }),
    customer: (order, driver) => ({
      title: '🚚 Driver Assigned',
      message: `${driver.name} will deliver your order #${order.orderNumber}. Contact: ${driver.phone || 'N/A'}`,
      type: 'order',
      actionUrl: '/orders'
    })
  },

  // Custom order notifications
  customOrderReceived: {
    customer: (customOrder) => ({
      title: '📝 Custom Order Received',
      message: `Your custom order request has been received. We'll review it shortly.`,
      type: 'success',
      actionUrl: '/my-custom-orders'
    }),
    admin: (customOrder) => ({
      title: '🎨 New Custom Order Request',
      message: `${customOrder.name} - ${customOrder.description.substring(0, 50)}${customOrder.description.length > 50 ? '...' : ''} (Qty: ${customOrder.quantity})`,
      type: 'alert',
      actionUrl: '/admin-custom-orders'
    })
  },

  customOrderStatusChanged: {
    customer: (customOrder, newStatus) => {
      const statusMessages = {
        'under-review': '👀 Your custom order is under review',
        approved: '✅ Your custom order has been approved!',
        rejected: '❌ Your custom order request was declined',
        'in-progress': '🍰 We\'re working on your custom order',
        completed: '✨ Your custom order is ready!'
      };
      
      return {
        title: `Custom Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: statusMessages[newStatus] || `Status updated to ${newStatus}`,
        type: 'info',
        actionUrl: '/my-custom-orders'
      };
    }
  }
};

/**
 * Create and send notifications to appropriate recipients
 * @param {string} eventType - Type of event (orderCreated, orderStatusChanged, etc.)
 * @param {Object} data - Data related to the event (order, customOrder, etc.)
 * @param {Object} additionalData - Additional data (newStatus, driver, actor, etc.)
 */
async function sendNotifications(eventType, data, additionalData = {}) {
  try {
    console.log(`[NOTIFICATIONS] 🔔 sendNotifications called:`, {
      eventType,
      dataId: data._id,
      dataUser: data.user,
      additionalData,
      actor: additionalData.actor
    });

    const templates = notificationTemplates[eventType];
    if (!templates) {
      console.warn(`[NOTIFICATIONS] ⚠️ No templates found for event: ${eventType}`);
      return;
    }

    const notifications = [];

    // Customer notification
    if (templates.customer && data.user) {
      const userId = data.user._id || data.user;
      console.log(`[NOTIFICATIONS] 📧 Creating customer notification for user: ${userId}`);
      const template = typeof templates.customer === 'function' 
        ? templates.customer(data, additionalData.newStatus, additionalData.driver)
        : templates.customer;
      
      if (template) {
        notifications.push({
          recipient: userId,
          actor: additionalData.actor?._id || additionalData.actor,
          actorName: additionalData.actor?.name || additionalData.actorName,
          title: template.title,
          message: template.message,
          type: template.type || 'info',
          category: data.orderNumber ? 'order' : 'system',
          action: template.actionUrl ? { url: template.actionUrl } : undefined,
          relatedId: data._id,
          relatedModel: data.orderNumber ? 'Order' : null,
          priority: 'normal'
        });
      }
    }

    // Staff notifications - send to all staff members
    if (templates.staff) {
      const staffUsers = await User.find({ role: 'staff' }).select('_id');
      const template = typeof templates.staff === 'function'
        ? templates.staff(data, additionalData.newStatus)
        : templates.staff;
      
      if (template) {
        for (const staff of staffUsers) {
          notifications.push({
            recipient: staff._id,
            actor: additionalData.actor?._id || additionalData.actor,
            actorName: additionalData.actor?.name || additionalData.actorName,
            title: template.title,
            message: template.message,
            type: template.type || 'info',
            category: data.orderNumber ? 'order' : 'system',
            action: template.actionUrl ? { url: template.actionUrl } : undefined,
            relatedId: data._id,
            relatedModel: data.orderNumber ? 'Order' : null,
            priority: 'high'
          });
        }
      }
    }

    // Admin notifications - send to all admins
    if (templates.admin) {
      const adminUsers = await User.find({ role: 'admin' }).select('_id');
      const template = typeof templates.admin === 'function'
        ? templates.admin(data, additionalData.newStatus)
        : templates.admin;
      
      if (template) {
        for (const admin of adminUsers) {
          notifications.push({
            recipient: admin._id,
            actor: additionalData.actor?._id || additionalData.actor,
            actorName: additionalData.actor?.name || additionalData.actorName,
            title: template.title,
            message: template.message,
            type: template.type || 'info',
            category: data.orderNumber ? 'order' : 'system',
            action: template.actionUrl ? { url: template.actionUrl } : undefined,
            relatedId: data._id,
            relatedModel: data.orderNumber ? 'Order' : null,
            priority: 'high'
          });
        }
      }
    }

    // Driver notification - send to specific driver only
    if (templates.driver && additionalData.driver) {
      const driverId = additionalData.driver._id || additionalData.driver;
      const template = typeof templates.driver === 'function'
        ? templates.driver(data, additionalData.newStatus)
        : templates.driver;
      
      if (template) {
        notifications.push({
          recipient: driverId,
          title: template.title,
          message: template.message,
          type: template.type || 'alert',
          category: 'delivery',
          action: template.actionUrl ? { url: template.actionUrl } : undefined,
          relatedId: data._id,
          relatedModel: 'Order',
          priority: 'high'
        });
      }
    }

    // Create all notifications in bulk
    if (notifications.length > 0) {
      console.log(`[NOTIFICATIONS] 📝 About to create ${notifications.length} notifications:`, 
        notifications.map(n => ({ recipient: n.recipient, title: n.title, actor: n.actorName }))
      );
      const created = await Notification.insertMany(notifications);
      console.log(`[NOTIFICATIONS] ✅ Created ${created.length} notifications for event: ${eventType}`);
    } else {
      console.warn(`[NOTIFICATIONS] ⚠️ No notifications to create for event: ${eventType}`);
    }

  } catch (error) {
    console.error(`[NOTIFICATIONS] ❌ Error sending notifications for ${eventType}:`, error);
    console.error(`[NOTIFICATIONS] ❌ Error stack:`, error.stack);
  }
}

module.exports = {
  sendNotifications
};
