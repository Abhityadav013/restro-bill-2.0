const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define the schema for the booking
const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String, // GUID for Booking ID
      required: true,
      default: uuidv4, // Automatically generate a GUID if not provided
    },
    categoryId: {
      type: String,
      required: true,
    },
    categoryName: {
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
categorySchema.set("toJSON", {
  transform: (doc, ret) => {
    // Optionally remove the _id field from the response
    delete ret._id;
    return ret;
  },
});

// Create and export the model
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;