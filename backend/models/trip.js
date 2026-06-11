const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trip owner is required."],
    },

    destination: {
      type: String,
      required: [true, "Destination is required."],
      trim: true,
      minlength: [2, "Destination must contain at least 2 characters."],
      maxlength: [100, "Destination cannot exceed 100 characters."],
    },

    country: {
      type: String,
      required: [true, "Country is required."],
      trim: true,
      minlength: [2, "Country must contain at least 2 characters."],
      maxlength: [100, "Country cannot exceed 100 characters."],
    },

    countryCode: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: [2, "Country code must contain exactly 2 characters."],
      maxlength: [2, "Country code must contain exactly 2 characters."],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required."],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required."],
      validate: {
        validator: function validateEndDate(value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be on or after the start date.",
      },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters."],
      default: "",
    },

    preferences: [
      {
        type: String,
        trim: true,
      },
    ],

    budget: {
      type: Number,
      min: [0, "Budget cannot be negative."],
      default: 0,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: [3, "Currency must use a three-letter code."],
      maxlength: [3, "Currency must use a three-letter code."],
      default: "MYR",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Trip", tripSchema);
