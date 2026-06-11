const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const getAuthHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getTrips = async (token) => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    headers: getAuthHeaders(token),
  });

  return handleResponse(response);
};

export const createTrip = async (tripData, token) => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(tripData),
  });

  return handleResponse(response);
};

export const deleteTrip = async (tripId, token) => {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const getTripWeather = async (tripId, token) => {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/weather`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};