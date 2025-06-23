const mongoose = require('mongoose');

// Define a counter schema for tracking displayId sequence
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Counter name, e.g., 'orderId'
    seq: { type: Number, default: 0 }     // Current sequence value
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
