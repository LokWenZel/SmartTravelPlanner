const ApiError = require("../utils/ApiError");

const GOOGLE_PLACES_TEXT_SEARCH_URL =
  "https://places.googleapis.com/v1/places:searchText";

const REQUEST_TIMEOUT_MS = 10000;

const CATEGORY_QUERY_MAP = {
  attractions: "tourist attractions",
  restaurants: "restaurants",
  cafes: "cafes",
  museums: "museums",
  hotels: "hotels",
};

const fetchGooglePlacesData = async (requestBody) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      "GOOGLE_PLACES_API_KEY is missing from the environment variables.",
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,

        // Google Places API New requires a field mask.
        // These fields are useful for a travel planner demo.
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryType,places.types",
      },
      body: JSON.stringify(requestBody),
    });

    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      if (response.status === 400) {
        throw new ApiError(
          400,
          responseData?.error?.message || "Invalid Google Places request.",
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new ApiError(
          502,
          "Google Places authentication failed. Check the API key, billing, and API restrictions.",
        );
      }

      if (response.status === 429) {
        throw new ApiError(
          429,
          "Google Places rate limit reached. Please try again later.",
        );
      }

      throw new ApiError(
        502,
        responseData?.error?.message ||
          "Google Places returned an unexpected error.",
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new ApiError(504, "Google Places request timed out.");
    }

    throw new ApiError(502, "Unable to connect to Google Places.");
  } finally {
    clearTimeout(timeout);
  }
};

const searchPlacesForDestination = async ({
  destination,
  country,
  category,
}) => {
  const selectedCategory =
    CATEGORY_QUERY_MAP[category] || CATEGORY_QUERY_MAP.attractions;

  const textQuery = `${selectedCategory} in ${destination}, ${country}`;

  const requestBody = {
    textQuery,
    languageCode: "en",
    maxResultCount: 8,
  };

  const placesData = await fetchGooglePlacesData(requestBody);

  const places = (placesData.places || []).map((place) => ({
    id: place.id,
    name: place.displayName?.text || "Unknown place",
    address: place.formattedAddress || "Address not available",
    rating: place.rating || null,
    userRatingCount: place.userRatingCount || 0,
    googleMapsUri: place.googleMapsUri || null,
    primaryType: place.primaryType || null,
    types: place.types || [],
  }));

  return {
    category,
    query: textQuery,
    count: places.length,
    places,
  };
};

module.exports = {
  searchPlacesForDestination,
};
