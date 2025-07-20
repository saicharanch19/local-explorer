const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  type: String, // supermarket, theater, school, etc.
  city: String, // to filter by city later
});

module.exports = mongoose.model("Place", placeSchema);
