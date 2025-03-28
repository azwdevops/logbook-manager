import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LocationMap = ({ onLocationSelect }) => {
  const [marker, setMarker] = useState(null);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMarker(e.latlng);
        onLocationSelect(e.latlng);
      },
    });
    return marker ? <Marker position={marker} /> : null;
  };

  return (
    <MapContainer center={[39.8283, -98.5795]} zoom={5} style={{ height: "300px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
};

export default LocationMap;
