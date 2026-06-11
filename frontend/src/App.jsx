import { useEffect, useState } from "react";
import "./App.css";

import { getCurrentUser, loginUser, registerUser } from "./services/authApi";

import {
  createTrip,
  deleteTrip,
  getTripCurrency,
  getTripPlaces,
  getTripWeather,
  getTrips,
} from "./services/tripApi";

const TOKEN_STORAGE_KEY = "smartTravelPlannerToken";

const initialAuthForm = {
  name: "",
  email: "",
  password: "",
};

const initialTripForm = {
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
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem(TOKEN_STORAGE_KEY) || "",
  );

  const [formData, setFormData] = useState(initialTripForm);
  const [trips, setTrips] = useState([]);
  const [selectedTripWeather, setSelectedTripWeather] = useState(null);
  const [selectedTripCurrency, setSelectedTripCurrency] = useState(null);
  const [selectedTripPlaces, setSelectedTripPlaces] = useState(null);

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [weatherLoadingTripId, setWeatherLoadingTripId] = useState(null);
  const [currencyLoadingTripId, setCurrencyLoadingTripId] = useState(null);
  const [placesLoadingTripId, setPlacesLoadingTripId] = useState(null);
  const [targetCurrency, setTargetCurrency] = useState("JPY");
  const [placeCategory, setPlaceCategory] = useState("attractions");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isAuthenticated = Boolean(token && currentUser);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const loadTrips = async (activeToken = token) => {
    if (!activeToken) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getTrips(activeToken);
      setTrips(response.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async (activeToken) => {
    try {
      setAuthLoading(true);

      const response = await getCurrentUser(activeToken);
      setCurrentUser(response.data.user);
      await loadTrips(activeToken);
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken("");
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCurrentUser(token);
    }
  }, []);

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;

    setAuthForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleTripInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    try {
      clearMessages();
      setAuthLoading(true);

      const response =
        authMode === "register"
          ? await registerUser(authForm)
          : await loginUser({
              email: authForm.email,
              password: authForm.password,
            });

      const receivedToken = response.data.token;
      const receivedUser = response.data.user;

      localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
      setToken(receivedToken);
      setCurrentUser(receivedUser);
      setAuthForm(initialAuthForm);
      setSuccessMessage(
        authMode === "register"
          ? "Account registered successfully."
          : "Login successful.",
      );

      await loadTrips(receivedToken);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken("");
    setCurrentUser(null);
    setTrips([]);
    setSelectedTripWeather(null);
    setSelectedTripCurrency(null);
    setSelectedTripPlaces(null);
    setFormData(initialTripForm);
    setSuccessMessage("You have logged out.");
  };

  const handleCreateTrip = async (event) => {
    event.preventDefault();

    try {
      clearMessages();

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

      await createTrip(tripData, token);

      setFormData(initialTripForm);
      setSuccessMessage("Trip created successfully.");
      await loadTrips(token);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?",
    );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();

      await deleteTrip(tripId, token);

      setSuccessMessage("Trip deleted successfully.");
      setSelectedTripWeather(null);
      setSelectedTripCurrency(null);
      setSelectedTripPlaces(null);
      await loadTrips(token);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleViewWeather = async (tripId) => {
    try {
      clearMessages();
      setWeatherLoadingTripId(tripId);

      const response = await getTripWeather(tripId, token);
      setSelectedTripWeather(response.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setWeatherLoadingTripId(null);
    }
  };

  const handleViewCurrency = async (tripId) => {
    try {
      clearMessages();
      setCurrencyLoadingTripId(tripId);

      const response = await getTripCurrency(tripId, targetCurrency, token);
      setSelectedTripCurrency(response.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setCurrencyLoadingTripId(null);
    }
  };

  const handleViewPlaces = async (tripId) => {
    try {
      clearMessages();
      setPlacesLoadingTripId(tripId);

      const response = await getTripPlaces(tripId, placeCategory, token);
      setSelectedTripPlaces(response.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setPlacesLoadingTripId(null);
    }
  };

  if (authLoading && token && !currentUser) {
    return (
      <main className="app-container">
        <section className="card">
          <p>Checking login session...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-container">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Smart Travel Planner</p>
          <h1>Plan trips with Smart Travel Planner</h1>
          <p>
            Create travel records, store them in MongoDB, and combine each saved
            trip with real-time weather data from OpenWeather.
          </p>
        </div>

        {isAuthenticated && (
          <div className="user-panel">
            <p>
              Logged in as <strong>{currentUser.name}</strong>
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </section>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {!isAuthenticated ? (
        <section className="auth-wrapper">
          <form className="card auth-card" onSubmit={handleAuthSubmit}>
            <h2>{authMode === "register" ? "Create account" : "Login"}</h2>

            {authMode === "register" && (
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthInputChange}
                  placeholder="Lok Wen Zel"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthInputChange}
                placeholder="lok@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthInputChange}
                placeholder="Minimum 6 characters"
                minLength="6"
                required
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "register"
                  ? "Register"
                  : "Login"}
            </button>

            <button
              type="button"
              className="link-button"
              onClick={() => {
                clearMessages();
                setAuthMode(authMode === "register" ? "login" : "register");
              }}
            >
              {authMode === "register"
                ? "Already have an account? Login"
                : "No account yet? Register"}
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="layout-grid">
            <form className="card trip-form" onSubmit={handleCreateTrip}>
              <h2>Add a new trip</h2>

              <label>
                Destination
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleTripInputChange}
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
                  onChange={handleTripInputChange}
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
                  onChange={handleTripInputChange}
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
                    onChange={handleTripInputChange}
                    required
                  />
                </label>

                <label>
                  End Date
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleTripInputChange}
                    required
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleTripInputChange}
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
                  onChange={handleTripInputChange}
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
                    onChange={handleTripInputChange}
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
                    onChange={handleTripInputChange}
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

                <div className="section-tools">
                  <label>
                    Convert to
                    <input
                      type="text"
                      value={targetCurrency}
                      onChange={(event) =>
                        setTargetCurrency(event.target.value.toUpperCase())
                      }
                      maxLength="3"
                      placeholder="JPY"
                    />
                  </label>

                  <label>
                    Places
                    <select
                      value={placeCategory}
                      onChange={(event) => setPlaceCategory(event.target.value)}
                    >
                      <option value="attractions">Attractions</option>
                      <option value="restaurants">Restaurants</option>
                      <option value="cafes">Cafes</option>
                      <option value="museums">Museums</option>
                      <option value="hotels">Hotels</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => loadTrips(token)}
                    className="secondary-button"
                  >
                    Refresh
                  </button>
                </div>
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
                          className="secondary-button"
                          onClick={() => handleViewCurrency(trip._id)}
                          disabled={currencyLoadingTripId === trip._id}
                        >
                          {currencyLoadingTripId === trip._id
                            ? "Converting..."
                            : "Convert Budget"}
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleViewPlaces(trip._id)}
                          disabled={placesLoadingTripId === trip._id}
                        >
                          {placesLoadingTripId === trip._id
                            ? "Finding places..."
                            : "Find Nearby Attractions"}
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

          {selectedTripPlaces && (
            <section className="card weather-section">
              <h2>Combined Trip + Places Result</h2>

              <div className="places-summary">
                <p>
                  <strong>Destination:</strong>{" "}
                  {selectedTripPlaces.trip.destination},{" "}
                  {selectedTripPlaces.trip.country}
                </p>
                <p>
                  <strong>Search Query:</strong>{" "}
                  {selectedTripPlaces.places.query}
                </p>
                <p>
                  <strong>Results Found:</strong>{" "}
                  {selectedTripPlaces.places.count}
                </p>
              </div>

              {selectedTripPlaces.places.places.length === 0 ? (
                <p>No places found for this destination.</p>
              ) : (
                <div className="places-list">
                  {selectedTripPlaces.places.places.map((place) => (
                    <article key={place.id} className="place-card">
                      <h3>{place.name}</h3>

                      <p>
                        <strong>Address:</strong> {place.address}
                      </p>

                      <p>
                        <strong>Rating:</strong>{" "}
                        {place.rating
                          ? `${place.rating} (${place.userRatingCount} reviews)`
                          : "Not available"}
                      </p>

                      <p>
                        <strong>Type:</strong>{" "}
                        {place.primaryType || "Not specified"}
                      </p>

                      {place.googleMapsUri && (
                        <a
                          href={place.googleMapsUri}
                          target="_blank"
                          rel="noreferrer"
                          className="external-link"
                        >
                          Open in Google Maps
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;
