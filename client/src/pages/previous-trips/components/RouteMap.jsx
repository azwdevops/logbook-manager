import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import CustomModal from "@/components/shared/CustomModal";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { showError } from "@/utils";

const RouteMap = ({ openRouteMap, setOpenRouteMap, selectedTripId }) => {
  const dispatch = useDispatch();
  const [routeMapData, setRouteMapData] = useState([]);
  const [middleIndex, setMiddleIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      try {
        const response = await API.get(`/logbook/get-trip-route/${selectedTripId}/`);
        const data = response?.data?.route_map_data || {};
        setRouteMapData(data?.trip_stops || []);
        setMiddleIndex(data?.middle_index || 0);
      } catch (error) {
        showError(error);
      } finally {
        dispatch(toggleLoading(false));
      }
    };
    fetchData();
  }, [selectedTripId, dispatch]);

  // Get middle stop for centering the map
  const middleStop = routeMapData[middleIndex]?.stop_location?.coords || { lat: 39.8283, lng: -98.5795 };

  return (
    <CustomModal isOpen={openRouteMap}>
      <div className="dialog">
        <h3>Route Map</h3>
        <p className="tc">The map below shows the trip route including stops.</p>
        <br />
        <MapContainer center={[middleStop.lat, middleStop.lng]} zoom={5} style={{ height: "70vh", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Draw route polyline */}
          <Polyline
            positions={routeMapData.map((stop) => [stop?.stop_location?.coords?.lat, stop?.stop_location?.coords?.lng])}
            color="blue"
          />

          {/* Markers for stops */}
          {routeMapData.map((stop, index) => {
            const { stop_location } = stop;
            const stopName = stop_location?.name?.split(",")[0]; // Extract first part of the name
            const coords = stop_location?.coords;
            return (
              <Marker key={index} position={[coords?.lat, coords?.lng]}>
                <Popup>{stopName}</Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenRouteMap(false)}>
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default RouteMap;
