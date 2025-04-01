import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import CustomModal from "@/components/shared/CustomModal";
import { useDispatch } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { showError } from "@/utils";
import axios from "axios";

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

const RouteMap = ({ openRouteMap, setOpenRouteMap, selectedTripId }) => {
  const dispatch = useDispatch();
  const [tripStopsData, setTripStopsData] = useState([]);
  const [middleStop, setMiddleStop] = useState(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true));
      try {
        const res = await API.get(`/logbook/get-trip-route/${selectedTripId}/`);
        const stops = res?.data?.route_map_data?.trip_stops || [];
        setTripStopsData(stops);

        if (stops.length > 0) {
          const middleIndex = res?.data?.route_map_data?.middle_index || Math.floor(stops.length / 2);
          setMiddleStop(stops[middleIndex]?.stop_location?.coords);
        }
      } catch (error) {
        showError(error);
      } finally {
        dispatch(toggleLoading(false));
      }
    };
    fetchData();
  }, [selectedTripId, dispatch]);

  useEffect(() => {
    if (tripStopsData.length < 2) return;

    const fetchRoute = async () => {
      const coordinates = tripStopsData.map((stop) => [stop.stop_location.coords.lng, stop.stop_location.coords.lat]);

      try {
        const response = await axios.post(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
          { coordinates },
          { headers: { Authorization: `Bearer ${ORS_API_KEY}`, "Content-Type": "application/json" } }
        );

        const routeCoords = response.data.features[0].geometry.coordinates.map(([lng, lat]) => ({
          lat,
          lng,
        }));
        setRoute(routeCoords);
      } catch (error) {
        console.error("Error fetching route from ORS:", error);
        setRoute(null);
      }
    };

    fetchRoute();
  }, [tripStopsData]);

  return (
    <CustomModal isOpen={openRouteMap}>
      <div className="dialog">
        <h3>Route Map</h3>
        <p className="tc">The map below shows the trip route including stops.</p>
        <br />
        {tripStopsData.length > 0 && middleStop && (
          <MapContainer
            center={[middleStop.lat, middleStop.lng]}
            zoom={12}
            style={{ height: "70vh", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Draw actual road-following route */}
            {route && <Polyline positions={route} color="blue" weight={4} />}

            {/* Markers for stops */}
            {tripStopsData.map((stop, index) => {
              const { stop_location } = stop;
              const stopName = stop_location?.name?.split(",")[0];
              const coords = stop_location?.coords;
              return (
                <Marker key={index} position={[coords.lat, coords.lng]}>
                  <Popup>{stopName}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

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
