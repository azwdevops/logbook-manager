import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import CustomModal from "@/components/shared/CustomModal";
import L from "leaflet";
import axios from "axios";

// OpenRouteService API key
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

// Custom marker icons
const createMarkerIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const Directions = ({ openDirections, setOpenDirections, currentTrip }) => {
  const [route, setRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState("pickup");
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [watchId, setWatchId] = useState(null);

  // Destination options
  const destinations = [
    { value: "pickup", label: "Pickup Location" },
    { value: "dropoff", label: "Dropoff Location" },
  ];

  // Get the selected destination coordinates
  const destinationCoords = selectedDestination === "pickup" ? currentTrip.pickup_location.coords : currentTrip.dropoff_location.coords;

  // Set up geolocation watcher when component mounts
  useEffect(() => {
    if (!openDirections) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true }
    );

    setWatchId(id);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [openDirections]);

  // Fetch route whenever current location or destination changes
  useEffect(() => {
    if (!currentLocation || !destinationCoords) return;

    const fetchRoute = async () => {
      try {
        const response = await axios.post(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
          {
            coordinates: [
              [currentLocation.lng, currentLocation.lat],
              [destinationCoords.lng, destinationCoords.lat],
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${ORS_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const feature = response.data.features[0];
        const routeCoords = feature.geometry.coordinates.map(([lng, lat]) => ({
          lat,
          lng,
        }));

        setRoute(routeCoords);
        setDistance((feature.properties.summary.distance / 1000).toFixed(1)); // km
        setDuration((feature.properties.summary.duration / 60).toFixed(0)); // minutes
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    };

    fetchRoute();
  }, [currentLocation, destinationCoords]);

  // Center point for the map
  const mapCenter = currentLocation || destinationCoords;

  return (
    <CustomModal isOpen={openDirections}>
      <div className="dialog">
        <h3>Select destination to get directions to your destination</h3>

        <div style={{ display: "flex", gap: "2rem", justifyContent: "space-evenly" }}>
          <div>
            <label>Select Destination:</label>
            <br />
            <select
              style={{ borderRadius: "10px", padding: "5px 15px" }}
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
            >
              <option value="">--select destination--</option>
              {destinations.map((dest) => (
                <option key={dest.value} value={dest.value}>
                  {dest.label}
                </option>
              ))}
            </select>
          </div>

          {distance && duration && (
            <>
              <p>
                Distance: <br /> <b>{distance} km</b>
              </p>
              <p>
                Estimated time: <br /> <b>{duration} minutes</b>
              </p>
            </>
          )}
        </div>
        <br />
        {mapCenter && (
          <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={14} style={{ height: "60vh", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {route && <Polyline positions={route} color="blue" weight={4} />}

            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]} icon={createMarkerIcon("red")}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}

            {destinationCoords && (
              <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={createMarkerIcon("green")}>
                <Popup>{selectedDestination === "pickup" ? currentTrip.pickup_location.name : currentTrip.dropoff_location.name}</Popup>
              </Marker>
            )}
          </MapContainer>
        )}

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenDirections(false)}>
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default Directions;
