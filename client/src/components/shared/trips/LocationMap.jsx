import React, { useEffect } from "react"; // Importing necessary React hooks
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet"; // Importing required Leaflet components
import "leaflet/dist/leaflet.css"; // Importing Leaflet's CSS for map styling
import L from "leaflet"; // Importing Leaflet library for map functionalities

/**
 * Function to create a custom marker icon with a specific color.
 *
 * @param {string} color - The color for the marker icon (e.g., "blue", "green", "red").
 * @returns {L.Icon} - A Leaflet icon object with the specified color.
 */
const createMarkerIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`, // URL to colored marker icon
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", // URL to marker shadow
    iconSize: [25, 41], // Size of the marker icon
    iconAnchor: [12, 41], // Anchor point for the marker
    popupAnchor: [1, -34], // Anchor for the popup
    shadowSize: [41, 41], // Size of the shadow
  });

/**
 * Component to update the map's center position when the location changes.
 *
 * @param {Object} props - Component props.
 * @param {Array} props.center - Latitude and longitude coordinates to center the map.
 */
const MapViewUpdater = ({ center }) => {
  const map = useMap(); // Access the Leaflet map instance

  useEffect(() => {
    if (center) {
      map.setView(center, 13); // Update the map's view with the new center and a zoom level of 13
    }
  }, [center, map]); // Effect runs when `center` or `map` changes

  return null; // This component doesn't render anything itself
};

const LocationMap = ({ tripDetails }) => {
  // Extracting relevant trip details from props
  const { currentLocation, pickupLocation, dropoffLocation } = tripDetails || {};

  // Creating an array of markers with their coordinates, color, and label
  const markers = [
    { coords: currentLocation?.coords, color: "blue", label: "Current Location" },
    { coords: pickupLocation?.coords, color: "green", label: "Pickup Location" },
    { coords: dropoffLocation?.coords, color: "red", label: "Dropoff Location" },
  ].filter((loc) => loc.coords && loc.coords.lat !== undefined && loc.coords.lng !== undefined); // ✅ Ensure valid coordinates

  // Default center if no valid markers: Use the geographical center of the USA
  const defaultCenter = markers.length > 0 ? [markers[0].coords.lat, markers[0].coords.lng] : [39.8283, -98.5795];

  // Dynamically set the map center to the current location, or use default center
  const mapCenter = currentLocation?.coords ? [currentLocation.coords.lat, currentLocation.coords.lng] : defaultCenter;

  // Extract polyline positions from markers if at least two valid markers exist
  const polylinePositions = markers.length >= 2 ? markers.map((loc) => [loc.coords.lat, loc.coords.lng]) : [];

  return (
    <MapContainer center={mapCenter} zoom={5} style={{ height: "500px", width: "100%" }} scrollWheelZoom={false}>
      {/* Updating the map center dynamically based on `mapCenter` */}
      <MapViewUpdater center={mapCenter} />

      {/* TileLayer to display the map's background (OpenStreetMap in this case) */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Rendering markers for each location */}
      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.coords.lat, marker.coords.lng]} icon={createMarkerIcon(marker.color)}>
          {/* Tooltip for each marker, displayed on hover */}
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#000" }}>{marker.label}</span>
          </Tooltip>
        </Marker>
      ))}

      {/* Drawing a polyline if there are at least two markers */}
      {polylinePositions.length >= 2 && <Polyline positions={polylinePositions} color="blue" />}
    </MapContainer>
  );
};

export default LocationMap; // Exporting the LocationMap component for use in other parts of the app
