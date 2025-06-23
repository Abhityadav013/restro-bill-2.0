const express = require("express");
const router = express.Router();
const Booking = require("./model/booking.model");
const { authMiddleware } = require("../auth/auth");
/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags:
 *       - Reservations
 *     summary: Create a new Reservations
 *     description: Creates a new reservation with details.
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingDate
 *               - numberOfPeople
 *               - bookingName
 *             properties:
 *               bookingDate:
 *                 type: date
 *                 example: 2024-12-27
 *               numberOfPeople:
 *                 type: integer
 *                 example: 3
 *               bookingName:
 *                 type: string
 *                 example: 2024-12-27
 *               bookingTime:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 example: +451 2790-5625

 *     responses:
 *       201:
 *         description: Reservations created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reservations created successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: string
 *                       example: "6f13b4f1-1d22-4b66-a97a-fbd06a62cb6d"
 *                     status:
 *                       type: string
 *                       example: "true"
 *       400:
 *         description: Error creating reservation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating reservations"
 */
router.post("/reservations", authMiddleware ,async (req, res) => {
  try {
    const {
      bookingDate,
      bookingName,
      numberOfPeople,
      bookingTime,
      phoneNumber,
    } = req.body;

    // Combine bookingDate and bookingTime into a single Date object
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const now = new Date();

    // Validation: Check if the booking date and time is in the past
    if (bookingDateTime < now) {
      return res.status(400).json({
        message: "Error: Booking date and time cannot be in the past",
      });
    }

    const newBooking = new Booking({
      bookingDate,
      bookingName,
      numberOfPeople,
      bookingTime,
      phoneNumber,
    });

    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        bookingId: newBooking.id,
        status: true,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Get all reservations
 *     description: Retrieves all reservations from the system.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: A list of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookingName:
 *                     type: string
 *                   bookingDate:
 *                     type: date
 *                   numberOfPeople:
 *                     type: integer
 *                   bookingTime:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *       400:
 *         description: Error fetching orders
 */

router.get("/reservations", authMiddleware ,async (req, res) => {
  try {
    const reservations = await Booking.find()
    .sort({ bookingDate: -1 }) ;

    if (reservations.length === 0) {
      return res.status(404).json({
        message: "No reservation found",
      });
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations: ", error);
    res.status(400).json({
      message: "Error fetching reservations",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     tags:
 *       - Reservations
 *     summary: Delete a reservation
 *     description: Deletes a reservation by its ID.
 *     security:
 *       - bearerAuth: [] 
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the reservation to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reservation deleted successfully"
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reservation not found"
 */

router.delete("/reservations/:id", authMiddleware ,async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the reservation
    const deletedReservation = await Booking.findOneAndDelete({ id });

    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reservation", error });
  }
});




module.exports = router;