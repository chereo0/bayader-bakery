const express = require("express");
const router = express.Router();
const EventBooking = require("../models/EventBooking");
const User = require("../models/User");
const { sendEventBookingEmail } = require("../services/emailService");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const adminOnly = requireRole('admin');

/**
 * POST /api/event-bookings
 * Create a new event booking
 */
router.post("/", auth, async (req, res) => {
  try {
    const { eventId, name, phone, peopleCount, dateRequested, message } =
      req.body;

    // Validate required fields
    if (!eventId || !name || !phone || !peopleCount || !dateRequested) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: eventId, name, phone, peopleCount, dateRequested",
      });
    }

    // Get user email
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create event booking
    const booking = new EventBooking({
      eventId,
      customerId: req.user.id,
      name,
      email: user.email,
      phone,
      peopleCount,
      dateRequested,
      message: message || "",
    });

    await booking.save();

    // Send confirmation email (don't wait for it)
    sendEventBookingEmail(user, booking);

    // Create notification
    try {
      const Notification = require("../models/Notification");
      await Notification.create({
        userId: req.user.id,
        title: "Event Booking Confirmation",
        message: `Your event booking request has been received. We'll contact you soon.`,
        type: "booking",
        relatedId: booking._id,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    res.status(201).json({
      success: true,
      message: "Event booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error creating event booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event booking",
      error: error.message,
    });
  }
});

/**
 * GET /api/event-bookings/me
 * Get current user's event bookings
 */
router.get("/me", auth, async (req, res) => {
  try {
    const bookings = await EventBooking.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("eventId", "title date");

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

/**
 * GET /api/event-bookings
 * Get all event bookings (admin only)
 */
router.get("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await EventBooking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("customerId", "name email")
      .populate("eventId", "title date");

    const total = await EventBooking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/event-bookings/:id
 * Update event booking status (admin only)
 */
router.patch("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await EventBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const oldStatus = booking.status;

    if (status) {
      booking.status = status;
    }
    if (notes) {
      booking.notes = notes;
    }

    await booking.save();

    // Create notification for status change
    try {
      const Notification = require("../models/Notification");
      const statusMessages = {
        accepted: "Your event booking has been accepted!",
        rejected: "Your event booking has been rejected.",
        pending: "Your event booking is being reviewed.",
      };

      await Notification.create({
        userId: booking.customerId,
        title: "Event Booking Update",
        message:
          statusMessages[status] ||
          `Your booking status has been updated to ${status}`,
        type: "booking",
        relatedId: booking._id,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    res.json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/event-bookings/:id
 * Delete event booking (admin only)
 */
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const booking = await EventBooking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
});

module.exports = router;
