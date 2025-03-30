import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import CustomModal from "@/components/shared/CustomModal";
import L from "leaflet";
import axios from "axios"; // For API requests

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

// Custom marker icons
const createMarkerIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const CurrentTripRouteMap = ({ openCurrentTripRouteMap, setOpenCurrentTripRouteMap, currentTrip }) => {
  const [route, setRoute] = useState(null); // Holds actual road-following route

  if (!currentTrip) return null;

  const { current_location, pickup_location, dropoff_location } = currentTrip;

  // Extract coordinates safely
  const locations = [
    { coords: current_location?.coords, label: "Current Location", color: "red" },
    { coords: pickup_location?.coords, label: "Pickup Location", color: "blue" },
    { coords: dropoff_location?.coords, label: "Dropoff Location", color: "green" },
  ].filter((loc) => loc.coords); // Remove any undefined locations

  if (locations.length < 2) {
    return (
      <CustomModal isOpen={openCurrentTripRouteMap}>
        <div className="dialog">
          <h3>Planned Trip Route Map</h3>
          <p className="tc">Not enough location data to display the route.</p>
          <br />
          <div className="form-buttons">
            <button type="button" onClick={() => setOpenCurrentTripRouteMap(false)}>
              Close
            </button>
          </div>
        </div>
      </CustomModal>
    );
  }

  const mapCenter = pickup_location?.coords || locations[0].coords;

  // Fetch actual route from OpenRouteService
  useEffect(() => {
    const fetchRoute = async () => {
      if (locations.length < 2) return;

      const coordinates = locations.map((loc) => [loc.coords.lng, loc.coords.lat]); // ORS requires [lng, lat]

      try {
        const response = await axios.post(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
          { coordinates },
          { headers: { Authorization: `Bearer ${ORS_API_KEY}`, "Content-Type": "application/json" } }
        );

        // Convert ORS response into Leaflet-friendly format
        const routeCoords = response.data.features[0].geometry.coordinates.map(([lng, lat]) => ({
          lat,
          lng,
        }));

        setRoute(routeCoords);
      } catch (error) {
        console.error("Error fetching route from ORS:", error);
        setRoute(null); // Fallback if API request fails
      }
    };

    fetchRoute();
  }, [currentTrip]);

  return (
    <CustomModal isOpen={openCurrentTripRouteMap}>
      <div className="dialog">
        <h3>Planned Trip Route Map</h3>
        <p className="tc">The map below shows the planned trip route following actual roads.</p>
        <br />
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={12} style={{ height: "70vh", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Draw actual road-following route */}
          {route && <Polyline positions={route} color="blue" weight={4} />}

          {/* Markers for locations */}
          {locations.map((loc, index) => (
            <Marker key={index} position={[loc.coords.lat, loc.coords.lng]} icon={createMarkerIcon(loc.color)}>
              <Popup>{loc.label}</Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenCurrentTripRouteMap(false)}>
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default CurrentTripRouteMap;
