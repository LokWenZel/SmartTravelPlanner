const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  getTripWeather,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(createTrip)
  .get(getTrips);

router.get("/:id/weather", getTripWeather);

router
  .route("/:id")
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

module.exports = router;