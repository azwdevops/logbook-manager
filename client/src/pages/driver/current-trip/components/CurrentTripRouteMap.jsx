// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import CustomModal from "@/components/shared/CustomModal";
import L from "leaflet"; // Leaflet for map features like markers and polylines
import axios from "axios"; // For API requests

// OpenRouteService API key (stored in environment variables)
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

// Custom function to create a marker with a specified color
const createMarkerIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

// Main component to display the current trip route map
const CurrentTripRouteMap = ({ openCurrentTripRouteMap, setOpenCurrentTripRouteMap, currentTrip }) => {
  const [route, setRoute] = useState(null); // State to hold the route data from the API

  // Return null if there's no current trip data
  if (!currentTrip) return null;

  // Destructure trip locations from currentTrip prop
  const { current_location, pickup_location, dropoff_location } = currentTrip;

  // Create an array of locations with labels and colors for each point (current, pickup, dropoff)
  // Filter out any location without coordinates
  const locations = [
    { coords: current_location?.coords, label: "Current Location", color: "red" },
    { coords: pickup_location?.coords, label: "Pickup Location", color: "blue" },
    { coords: dropoff_location?.coords, label: "Dropoff Location", color: "green" },
  ].filter((loc) => loc.coords); // Remove undefined locations

  // Show an error message if there are fewer than 2 valid locations
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

  // Set the center of the map to the pickup location or the first available location
  const mapCenter = pickup_location?.coords || locations[0].coords;

  // Fetch the actual route from OpenRouteService API
  useEffect(() => {
    const fetchRoute = async () => {
      if (locations.length < 2) return;

      // Prepare coordinates in [longitude, latitude] format for OpenRouteService
      const coordinates = locations.map((loc) => [loc.coords.lng, loc.coords.lat]);

      try {
        // Make the API request to get the route data
        const response = await axios.post(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
          { coordinates },
          { headers: { Authorization: `Bearer ${ORS_API_KEY}`, "Content-Type": "application/json" } }
        );

        // Extract the route coordinates from the response and format for Leaflet
        const routeCoords = response.data.features[0].geometry.coordinates.map(([lng, lat]) => ({
          lat,
          lng,
        }));

        // Update the state with the fetched route coordinates
        setRoute(routeCoords);
      } catch (error) {
        // Log any errors and reset route state if API fails
        console.error("Error fetching route from ORS:", error);
        setRoute(null); // Fallback if API request fails
      }
    };

    fetchRoute(); // Call fetchRoute when the component mounts or currentTrip changes
  }, [currentTrip]);

  // Render the map and markers inside a modal
  return (
    <CustomModal isOpen={openCurrentTripRouteMap}>
      <div className="dialog">
        <h3>Planned Trip Route Map</h3>
        <p className="tc">The map below shows the planned trip route following actual roads.</p>
        <br />
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={12} style={{ height: "70vh", width: "100%" }} scrollWheelZoom={false}>
          {/* TileLayer is the base map layer */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Draw the route line if route data is available */}
          {route && <Polyline positions={route} color="blue" weight={4} />}

          {/* Create markers for each location (current, pickup, dropoff) */}
          {locations.map((loc, index) => (
            <Marker key={index} position={[loc.coords.lat, loc.coords.lng]} icon={createMarkerIcon(loc.color)}>
              {/* Popup to show the location label */}
              <Popup>{loc.label}</Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Button to close the modal */}
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
