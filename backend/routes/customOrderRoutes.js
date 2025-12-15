const express = require("express");
const router = express.Router();
const CustomOrderRequest = require("../models/CustomOrderRequest");
const User = require("../models/User");
const { sendCustomOrderRequestEmail } = require("../services/emailService");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

/**
 * POST /api/custom-orders
 * Create a new custom order request
 */
router.post("/", auth, async (req, res) => {
  try {
    const {
      description,
      quantity,
      budget,
      deliveryDate,
      specialRequests,
      name,
      phone,
    } = req.body;

    // Validate required fields
    if (!description || !quantity || !deliveryDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: description, quantity, deliveryDate",
      });
    }

    // Get user info
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create custom order request
    const request = new CustomOrderRequest({
      customerId: req.user.id,
      name: name || user.name,
      email: user.email,
      phone: phone || user.phone,
      description,
      quantity,
      budget: budget || 0,
      deliveryDate,
      specialRequests: specialRequests || "",
    });

    await request.save();

    // Send confirmation email (don't wait for it)
    sendCustomOrderRequestEmail(user, request);

    // Create notification
    try {
      const Notification = require("../models/Notification");
      await Notification.create({
        userId: req.user.id,
        title: "Custom Order Request Received",
        message: `Your custom order request has been received. We'll review it and contact you soon.`,
        type: "custom-order",
        relatedId: request._id,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    res.status(201).json({
      success: true,
      message: "Custom order request created successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error creating custom order request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create custom order request",
      error: error.message,
    });
  }
});

/**
 * GET /api/custom-orders/me
 * Get current user's custom order requests
 */
router.get("/me", auth, async (req, res) => {
  try {
    const requests = await CustomOrderRequest.find({ customerId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching user custom orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch custom orders",
      error: error.message,
    });
  }
});

/**
 * GET /api/custom-orders
 * Get all custom order requests (admin only)
 */
router.get("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const requests = await CustomOrderRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("customerId", "name email phone");

    const total = await CustomOrderRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching custom orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch custom orders",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/custom-orders/:id
 * Update custom order request status (admin only)
 */
router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { status, estimatedPrice, notes } = req.body;

    const request = await CustomOrderRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Custom order request not found",
      });
    }

    if (status) {
      request.status = status;
    }
    if (estimatedPrice !== undefined) {
      request.estimatedPrice = estimatedPrice;
    }
    if (notes) {
      request.notes = notes;
    }

    await request.save();

    // Create notification for status change
    try {
      const Notification = require("../models/Notification");
      const statusMessages = {
        approved: "Your custom order request has been approved!",
        rejected: "Your custom order request could not be approved.",
        "in-progress": "Your custom order is now being prepared!",
        completed: "Your custom order is ready!",
        pending: "Your custom order request is being reviewed.",
      };

      await Notification.create({
        userId: request.customerId,
        title: "Custom Order Update",
        message:
          statusMessages[status] ||
          `Your custom order status has been updated to ${status}`,
        type: "custom-order",
        relatedId: request._id,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    res.json({
      success: true,
      message: "Custom order request updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error updating custom order request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update custom order request",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/custom-orders/:id
 * Delete custom order request (admin only)
 */
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const request = await CustomOrderRequest.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Custom order request not found",
      });
    }

    res.json({
      success: true,
      message: "Custom order request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting custom order request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete custom order request",
      error: error.message,
    });
  }
});

module.exports = router;
