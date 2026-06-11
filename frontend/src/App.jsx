import { useEffect, useState } from "react";
import "./App.css";

import {
  createTrip,
  deleteTrip,
  getTripWeather,
  getTrips,
} from "./services/tripApi";

const initialFormData = {
  destination: "",
  country: "",
  countryCode: "",
  startDate: "",
  endDate: "",
  notes: "",
  preferences: "",
  budget: "",
  currency: "MYR",
};

function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [trips, setTrips] = useState([]);
  const [selectedTripWeather, setSelectedTripWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherLoadingTripId, setWeatherLoadingTripId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadTrips = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getTrips();
      setTrips(response.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    try {
      setErrorMessage("");
      setSuccessMessage("");

      const tripData = {
        destination: formData.destination,
        country: formData.country,
        countryCode: formData.countryCode,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
        preferences: formData.preferences
          .split(",")
          .map((preference) => preference.trim())
          .filter((preference) => preference.length > 0),
        budget: Number(formData.budget || 0),
        currency: formData.currency,
      };

      await createTrip(tripData);

      setFormData(initialFormData);
      setSuccessMessage("Trip created successfully.");
      await loadTrips();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteTrip(tripId);

      setSuccessMessage("Trip deleted successfully.");
      setSelectedTripWeather(null);
      await loadTrips();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleViewWeather = async (tripId) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setWeatherLoadingTripId(tripId);

      const response = await getTripWeather(tripId);
      setSelectedTripWeather(response.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setWeatherLoadingTripId(null);
    }
  };

  return (
    <main className="app-container">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Smart Travel Planner</p>
          <h1>Plan trips with saved notes and live weather</h1>
          <p>
            Create travel records, store them in MongoDB, and combine each saved
            trip with real-time weather data from OpenWeather.
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="alert alert-error">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <section className="layout-grid">
        <form className="card trip-form" onSubmit={handleCreateTrip}>
          <h2>Add a new trip</h2>

          <label>
            Destination
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              placeholder="George Town"
              required
            />
          </label>

          <label>
            Country
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Malaysia"
              required
            />
          </label>

          <label>
            Country Code
            <input
              type="text"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              placeholder="MY"
              maxLength="2"
            />
          </label>

          <div className="two-column">
            <label>
              Start Date
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          <label>
            Notes
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Visit heritage attractions and try local food."
              rows="4"
            />
          </label>

          <label>
            Preferences
            <input
              type="text"
              name="preferences"
              value={formData.preferences}
              onChange={handleInputChange}
              placeholder="food, culture, museums"
            />
          </label>

          <div className="two-column">
            <label>
              Budget
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min="0"
                placeholder="1200"
              />
            </label>

            <label>
              Currency
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                maxLength="3"
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Create Trip
          </button>
        </form>

        <section className="card">
          <div className="section-heading">
            <h2>Saved trips</h2>
            <button type="button" onClick={loadTrips} className="secondary-button">
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading trips...</p>
          ) : trips.length === 0 ? (
            <p>No trips found. Create your first trip using the form.</p>
          ) : (
            <div className="trip-list">
              {trips.map((trip) => (
                <article key={trip._id} className="trip-card">
                  <div>
                    <h3>{trip.destination}</h3>
                    <p>
                      {trip.country}
                      {trip.countryCode ? ` (${trip.countryCode})` : ""}
                    </p>
                    <p>
                      {new Date(trip.startDate).toLocaleDateString()} -{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p>{trip.notes || "No notes added."}</p>
                  </div>

                  <div className="trip-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleViewWeather(trip._id)}
                      disabled={weatherLoadingTripId === trip._id}
                    >
                      {weatherLoadingTripId === trip._id
                        ? "Loading weather..."
                        : "View Weather"}
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDeleteTrip(trip._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {selectedTripWeather && (
        <section className="card weather-section">
          <h2>Combined Trip + Weather Result</h2>

          <div className="weather-grid">
            <div>
              <h3>Trip Information</h3>
              <p>
                <strong>Destination:</strong>{" "}
                {selectedTripWeather.trip.destination}
              </p>
              <p>
                <strong>Country:</strong> {selectedTripWeather.trip.country}
              </p>
              <p>
                <strong>Notes:</strong>{" "}
                {selectedTripWeather.trip.notes || "No notes added."}
              </p>
            </div>

            <div>
              <h3>Current Weather</h3>
              <p>
                <strong>Location:</strong>{" "}
                {selectedTripWeather.weather.location.name},{" "}
                {selectedTripWeather.weather.location.countryCode}
              </p>
              <p>
                <strong>Condition:</strong>{" "}
                {selectedTripWeather.weather.current.description}
              </p>
              <p>
                <strong>Temperature:</strong>{" "}
                {selectedTripWeather.weather.current.temperatureCelsius}°C
              </p>
              <p>
                <strong>Feels like:</strong>{" "}
                {selectedTripWeather.weather.current.feelsLikeCelsius}°C
              </p>
              <p>
                <strong>Humidity:</strong>{" "}
                {selectedTripWeather.weather.current.humidityPercent}%
              </p>
              <p>
                <strong>Wind Speed:</strong>{" "}
                {
                  selectedTripWeather.weather.current
                    .windSpeedMetresPerSecond
                }{" "}
                m/s
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;