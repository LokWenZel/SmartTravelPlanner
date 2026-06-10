const Trip = require("../models/Trip");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/v1/trips
 * Create a new trip
 */
const createTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.create(req.body);

  res.status(201).json({
    success: true,
    message: "Trip created successfully.",
    data: trip,
  });
});

/**
 * GET /api/v1/trips
 * Retrieve all trips
 */
const getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips,
  });
});

/**
 * GET /api/v1/trips/:id
 * Retrieve one trip using its MongoDB ID
 */
const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error("Trip not found.");
  }

  res.status(200).json({
    success: true,
    data: trip,
  });
});

/**
 * PUT /api/v1/trips/:id
 * Replace the editable information of an existing trip with new data
 */
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error("Trip not found.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error("Trip update data is required.");
  }

  trip.destination = req.body.destination;
  trip.country = req.body.country;
  trip.startDate = req.body.startDate;
  trip.endDate = req.body.endDate;
  trip.notes = req.body.notes ?? "";
  trip.preferences = req.body.preferences ?? [];
  trip.budget = req.body.budget ?? 0;
  trip.currency = req.body.currency ?? "MYR";

  const updatedTrip = await trip.save();

  res.status(200).json({
    success: true,
    message: "Trip updated successfully.",
    data: updatedTrip,
  });
});

/**
 * DELETE /api/v1/trips/:id
 * Delete an existing trip.
 */
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error("Trip not found.");
  }

  await trip.deleteOne();

  res.status(200).json({
    success: true,
    message: "Trip deleted successfully.",
    data: {
      id: req.params.id,
    },
  });
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};