import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Function to create custom colored markers
const createMarkerIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

// Component to update the map's center when the location changes
const MapViewUpdater = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 13); // Adjust zoom level for better visibility
    }
  }, [center, map]);

  return null;
};

const LocationMap = ({ tripDetails }) => {
  const { currentLocation, pickupLocation, dropoffLocation } = tripDetails || {};

  const markers = [
    { coords: currentLocation?.coords, color: "blue", label: "Current Location" },
    { coords: pickupLocation?.coords, color: "green", label: "Pickup Location" },
    { coords: dropoffLocation?.coords, color: "red", label: "Dropoff Location" },
  ].filter((loc) => loc.coords && loc.coords.lat !== undefined && loc.coords.lng !== undefined); // ✅ Ensure valid coordinates

  // Fallback center: Use first valid marker location, else default to USA center
  const defaultCenter = markers.length > 0 ? [markers[0].coords.lat, markers[0].coords.lng] : [39.8283, -98.5795];

  // Set center dynamically based on current location selection
  const mapCenter = currentLocation?.coords ? [currentLocation.coords.lat, currentLocation.coords.lng] : defaultCenter;

  // Extract polyline positions if at least two valid locations exist
  const polylinePositions = markers.length >= 2 ? markers.map((loc) => [loc.coords.lat, loc.coords.lng]) : [];

  return (
    <MapContainer center={mapCenter} zoom={5} style={{ height: "500px", width: "100%" }} scrollWheelZoom={false}>
      <MapViewUpdater center={mapCenter} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.coords.lat, marker.coords.lng]} icon={createMarkerIcon(marker.color)}>
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#000" }}>{marker.label}</span>
          </Tooltip>
        </Marker>
      ))}

      {polylinePositions.length >= 2 && <Polyline positions={polylinePositions} color="blue" />}
    </MapContainer>
  );
};

export default LocationMap;
