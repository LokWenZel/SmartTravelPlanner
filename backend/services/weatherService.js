const ApiError = require("../utils/ApiError");

const GEOCODING_API_URL =
  "https://api.openweathermap.org/geo/1.0/direct";

const CURRENT_WEATHER_API_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Send a request to OpenWeather and convert common failures
 * into application-friendly errors.
 */
const fetchOpenWeatherData = async (url) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new ApiError(
          502,
          "Weather service authentication failed. Check the OpenWeather API key."
        );
      }

      if (response.status === 429) {
        throw new ApiError(
          429,
          "Weather service rate limit reached. Please try again later."
        );
      }

      if (response.status === 404) {
        throw new ApiError(
          404,
          "Weather information was not found for this location."
        );
      }

      throw new ApiError(
        502,
        "The weather service returned an unexpected error."
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new ApiError(
        504,
        "The weather service request timed out."
      );
    }

    throw new ApiError(
      502,
      "Unable to connect to the weather service."
    );
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Convert a destination name into latitude and longitude.
 */
const geocodeDestination = async ({
  destination,
  countryCode,
}) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      "OPENWEATHER_API_KEY is missing from the environment variables."
    );
  }

  const locationQuery = countryCode
    ? `${destination},${countryCode}`
    : destination;

  const url = new URL(GEOCODING_API_URL);

  url.searchParams.set("q", locationQuery);
  url.searchParams.set("limit", "1");
  url.searchParams.set("appid", apiKey);

  const locations = await fetchOpenWeatherData(url);

  if (!Array.isArray(locations) || locations.length === 0) {
    throw new ApiError(
      404,
      `No weather location was found for ${destination}.`
    );
  }

  const location = locations[0];

  return {
    name: location.name,
    state: location.state || null,
    countryCode: location.country,
    latitude: location.lat,
    longitude: location.lon,
  };
};

/**
 * Retrieve current weather using geographical coordinates.
 */
const getCurrentWeather = async ({
  latitude,
  longitude,
}) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  const url = new URL(CURRENT_WEATHER_API_URL);

  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");

  const weatherData = await fetchOpenWeatherData(url);

  const mainCondition = weatherData.weather?.[0];

  return {
    condition: mainCondition?.main || "Unknown",
    description: mainCondition?.description || "Unknown",
    iconCode: mainCondition?.icon || null,
    temperatureCelsius: weatherData.main?.temp ?? null,
    feelsLikeCelsius: weatherData.main?.feels_like ?? null,
    humidityPercent: weatherData.main?.humidity ?? null,
    windSpeedMetresPerSecond: weatherData.wind?.speed ?? null,
    observedAt: weatherData.dt
      ? new Date(weatherData.dt * 1000).toISOString()
      : null,
  };
};

/**
 * Complete operation:
 * destination name → coordinates → current weather.
 */
const getWeatherForDestination = async ({
  destination,
  countryCode,
}) => {
  const location = await geocodeDestination({
    destination,
    countryCode,
  });

  const currentWeather = await getCurrentWeather({
    latitude: location.latitude,
    longitude: location.longitude,
  });

  return {
    location,
    current: currentWeather,
  };
};

module.exports = {
  getWeatherForDestination,
};