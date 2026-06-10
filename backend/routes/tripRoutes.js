const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  getTripWeather,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

const router = express.Router();

router.route("/").post(createTrip).get(getTrips);

router.get("/:id/weather", getTripWeather);

router.route("/:id").get(getTripById).put(updateTrip).delete(deleteTrip);

module.exports = router;
