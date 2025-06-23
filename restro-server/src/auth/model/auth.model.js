const mongoose = require("mongoose");

// Define the schema for admin users
const userSchema = new mongoose.Schema({
    
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
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
    userSchema.set("toJSON", {
        transform: (doc, ret) => {
        // Optionally remove the _id field from the response
        delete ret._id;
        return ret;
    },
  });

// Create and export the model
module.exports = mongoose.model("User", userSchema);
