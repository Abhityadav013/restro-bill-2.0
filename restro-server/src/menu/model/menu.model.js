const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define the schema for the booking
const menuSchema = new mongoose.Schema(
  {
    id: {
      type: String, // GUID for Booking ID
      required: true,
      default: uuidv4, // Automatically generate a GUID if not provided
    },
    itemId: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false, // Disable the "__v" version key
  }
);

// Remove _id if it's included in the response (optional)
menuSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Optionally remove the _id field from the response
    delete ret._id;
    return ret;
  },
});

// Create and export the model
const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;
