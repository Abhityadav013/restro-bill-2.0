const mongoose = require('mongoose');

const ReservationSchemaName = "Reservation"; // Collection name

const ReservationSchema = new mongoose.Schema({
  displayId: String,
  fullName: String,
  phoneNumber: String,
  numberOfPeople: String,
  reservationDateTime: Date,
  deviceId: String,
  status: { type: String, default: "draft" }
}, {
  timestamps: true,
  collection: ReservationSchemaName,
  versionKey: false
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation; 