import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapView = ({ city, filterType }) => {
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState([17.385, 78.4867]); // Default: Hyderabad

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/places", {
          params: city ? { city } : {},
        });
        setPlaces(response.data.places);
      } catch (err) {
        console.error("Failed to fetch places:", err);
      }
    };
    fetchPlaces();
  }, [city]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (err) => console.error(err)
    );
  }, []);

  const filteredPlaces =
    filterType === "All"
      ? places
      : places.filter((place) => place.type.toLowerCase() === filterType.toLowerCase());

  return (
    <MapContainer center={userLocation} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filteredPlaces.map((place, idx) => (
        <Marker
          key={idx}
          position={[place.lat, place.lng]}
          icon={new L.Icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          })}
        >
          <Popup>
            <b>{place.name}</b><br />
            Type: {place.type}<br />
            City: {place.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
