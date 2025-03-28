import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RouteMap = () => {
  // Static route coordinates (Example: New York to Los Angeles)
  const routeCoordinates = [
    [40.7128, -74.006], // New York
    [41.8781, -87.6298], // Chicago
    [39.7392, -104.9903], // Denver
    [36.1699, -115.1398], // Las Vegas
    [34.0522, -118.2437], // Los Angeles
  ];

  const stops = [
    { location: [41.8781, -87.6298], name: "Rest Stop - Chicago" },
    { location: [39.7392, -104.9903], name: "Refuel - Denver" },
    { location: [36.1699, -115.1398], name: "Rest Stop - Las Vegas" },
  ];

  return (
    <Card sx={{ mt: 4, p: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Route Map
        </Typography>
        <Typography variant="body2" gutterBottom>
          The map below shows the planned route along with key rest stops and refueling locations.
        </Typography>
        <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: "400px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={routeCoordinates} color="blue" />
          {stops.map((stop, index) => (
            <Marker key={index} position={stop.location}>
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default RouteMap;
