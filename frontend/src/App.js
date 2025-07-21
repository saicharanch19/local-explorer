import React, { useState } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState("");
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const categories = ["all", "schools", "colleges", "theaters", "medical shops"];

  const fetchPlaces = async (loc = location) => {
    if (!loc) return alert("Please enter a location");
    setLoading(true);
    try {
      const response = await axios.get(`https://local-explorer-2.onrender.com/api/places?location=${loc}`);
      const categorizedPlaces = {};
      Object.keys(response.data).forEach(category => {
        categorizedPlaces[category] = response.data[category].map(place => ({
          ...place,
          category: category
        }));
      });
      setPlaces(categorizedPlaces);
      setSelectedCategory("all");
    } catch (error) {
      console.error("Error fetching places:", error);
      alert("Failed to fetch places.");
    }
    setLoading(false);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const detailsResponse = await axios.get(
        `https://local-explorer-2.onrender.com/api/place-details?place_id=${placeId}`
      );
      const reviewsResponse = await axios.get(
        `https://local-explorer-2.onrender.com/api/place-reviews?place_id=${placeId}`
      );
      setSelectedPlace({
        ...detailsResponse.data,
        reviews: reviewsResponse.data
      });
    } catch (error) {
      console.error("Error fetching place details:", error);
      alert("Failed to fetch place details.");
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDki4k3wRgR7TEw1ugkkaWqe1tBxxnDfDk`
            );
            const address = response.data.results[0].formatted_address;
            setLocation(address);
            fetchPlaces(address);
          } catch (error) {
            console.error("Error getting location:", error);
            alert("Could not get your location name. Please enter manually.");
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not detect your location. Please enter manually.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please enter location manually.");
    }
  };

  const getPlacesToDisplay = () => {
    if (selectedCategory === "all") {
      return Object.values(places).flat();
    }
    return places[selectedCategory] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 text-center">
        <h1 className="text-3xl font-bold">Local Explorer</h1>
        <p className="mt-1">Discover Schools, Colleges, Theaters & Medical Shops Nearby</p>
      </header>

      <div className="flex justify-center mt-4 space-x-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-full text-white ${
              selectedCategory === cat ? "bg-red-600" : "bg-orange-400"
            } hover:bg-red-500`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex justify-center my-6">
        <input
          type="text"
          placeholder="Enter location (e.g., Hyderabad)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchPlaces()}
          className="border border-gray-300 rounded-l px-4 py-2 w-1/3"
        />
        <button
          onClick={() => fetchPlaces()}
          className="bg-red-500 text-white px-4 py-2 hover:bg-red-600"
        >
          Search
        </button>
        <button
          onClick={detectLocation}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          title="Auto-detect my location"
        >
          📍
        </button>
      </div>

      {loading && <p className="text-center text-gray-600">Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {getPlacesToDisplay().map((place, index) => (
          <div
            key={index}
            onClick={() => fetchPlaceDetails(place.place_id)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer overflow-hidden"
          >
            <div className="h-48 w-full overflow-hidden">
              <img
                src={place.photo_url}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-start mb-2">
                <div className="bg-gray-100 p-2 rounded-full mr-3 flex-shrink-0">
                  {place.category === "schools" && "🏫"}
                  {place.category === "colleges" && "🎓"}
                  {place.category === "theaters" && "🎬"}
                  {place.category === "medical shops" && "💊"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{place.name}</h3>
                  <p className="text-gray-500 text-sm">{place.formatted_address}</p>
                </div>
              </div>
              {place.rating && (
                <div className="flex items-center text-yellow-500 mt-2">
                  <span>⭐</span>
                  <span className="ml-1">{place.rating}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPlace && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setSelectedPlace(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPlace.photo_url && (
              <div className="h-64 w-full overflow-hidden">
                <img
                  src={selectedPlace.photo_url}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedPlace.name}</h2>
              <p className="text-gray-600 mb-4">{selectedPlace.formatted_address}</p>
              {selectedPlace.rating && (
                <p className="text-yellow-500 mb-4">⭐ {selectedPlace.rating}</p>
              )}
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Reviews</h3>
                {selectedPlace.reviews && selectedPlace.reviews.length > 0 ? (
                  selectedPlace.reviews.map((review, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500 mr-2">⭐ {review.rating}</span>
                        <span className="text-sm text-gray-500">
                          by {review.author_name}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.text}</p>
                      {review.relative_time_description && (
                        <p className="text-xs text-gray-400 mt-1">
                          {review.relative_time_description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews available</p>
                )}
              </div>

              <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setSelectedPlace(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;