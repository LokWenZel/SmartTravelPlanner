const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

export const getTrips = async () => {
  const response = await fetch(`${API_BASE_URL}/trips`);
  return handleResponse(response);
};

export const createTrip = async (tripData) => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripData),
  });

  return handleResponse(response);
};

export const deleteTrip = async (tripId) => {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};

export const getTripWeather = async (tripId) => {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/weather`);
  return handleResponse(response);
};