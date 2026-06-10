const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

const router = express.Router();

/**
 * /api/v1/trips
 */
router
  .route("/")
  .post(createTrip)
  .get(getTrips);

/**
 * /api/v1/trips/:id
 */
router
  .route("/:id")
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

module.exports = router;