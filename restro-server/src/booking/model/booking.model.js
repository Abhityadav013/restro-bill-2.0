const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define the schema for the booking
const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String, // GUID for Booking ID
      required: true,
      default: uuidv4, // Automatically generate a GUID if not provided
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingName: {
      type: String,
      required: false,
    },
    numberOfPeople: {
      type: Number,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false, // Disable the "__v" version key
  }
);

// Remove _id if it's included in the response (optional)
bookingSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Optionally remove the _id field from the response
    delete ret._id;
    return ret;
  },
});

// Create and export the model
const Booking = mongoose.model("Bookings", bookingSchema);
module.exports = Booking;
