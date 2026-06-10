const mongoose = require("mongoose");

/**
 * This one here to connect the Express application to MongoDB
 */
const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from the environment variables.");
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);

    // We'll just stop the application because it cannot operate without its database
    process.exit(1);
  }
};

module.exports = connectDatabase;