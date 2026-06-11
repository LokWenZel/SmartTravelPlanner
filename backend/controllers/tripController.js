const { getWeatherForDestination } = require("../services/weatherService");

const Trip = require("../models/Trip");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/v1/trips
 * Create a new trip
 */
const createTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.create({
    ...req.body,
    user: req.user._id,
  });

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
  const trips = await Trip.find({
    user: req.user._id,
  }).sort({
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
  const trip = await Trip.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

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
  const trip = await Trip.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

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
  trip.countryCode = req.body.countryCode;
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
  const trip = await Trip.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

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

/**
 * GET /api/v1/trips/:id/weather
 * Retrieve a saved trip and combine it with current weather.
 */
const getTripWeather = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!trip) {
    res.status(404);
    throw new Error("Trip not found.");
  }

  const weather = await getWeatherForDestination({
    destination: trip.destination,
    countryCode: trip.countryCode,
  });

  res.status(200).json({
    success: true,
    message: "Trip and current weather retrieved successfully.",
    data: {
      trip,
      weather,
    },
  });
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  getTripWeather,
  updateTrip,
  deleteTrip,
};
