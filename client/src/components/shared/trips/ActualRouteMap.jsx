import React, { useEffect, useState } from "react"; // Importing React hooks
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet"; // Importing Leaflet components for map rendering
import "leaflet/dist/leaflet.css"; // Importing Leaflet CSS
import CustomModal from "@/components/shared/CustomModal"; // Importing custom modal component
import { useDispatch } from "react-redux"; // Redux dispatch hook
import { toggleLoading } from "@/redux/features/sharedSlice"; // Action to toggle loading state in the app
import API from "@/utils/API"; // API utility to interact with backend
import { showError } from "@/utils"; // Function to handle errors
import axios from "axios"; // Importing axios for making HTTP requests

// API key for OpenRouteService (ORS) from environment variables
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

/**
 * ActualRouteMap component displays a route map with stops, fetched from the server and OpenRouteService API.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.openActualRouteMap - State that determines whether the modal is open or closed.
 * @param {Function} props.setOpenActualRouteMap - Function to close the modal.
 * @param {string} props.selectedTripId - The ID of the selected trip to fetch data for.
 */
const ActualRouteMap = ({ openActualRouteMap, setOpenActualRouteMap, selectedTripId }) => {
  const dispatch = useDispatch(); // Initialize Redux dispatch
  const [tripStopsData, setTripStopsData] = useState([]); // Store trip stop data
  const [middleStop, setMiddleStop] = useState(null); // Store coordinates of the middle stop for map centering
  const [route, setRoute] = useState(null); // Store the route to display on the map

  // Fetch the trip stops and middle stop data when the component mounts or selectedTripId changes
  useEffect(() => {
    const fetchData = async () => {
      dispatch(toggleLoading(true)); // Show loading indicator
      try {
        // Fetch trip route data from the backend
        const res = await API.get(`/logbook/get-trip-route/${selectedTripId}/`);
        const stops = res?.data?.route_map_data?.trip_stops || []; // Extract trip stop data
        setTripStopsData(stops); // Update state with trip stop data

        if (stops.length > 0) {
          // Calculate the middle stop to center the map
          const middleIndex = res?.data?.route_map_data?.middle_index || Math.floor(stops.length / 2);
          setMiddleStop(stops[middleIndex]?.stop_location?.coords);
        }
      } catch (error) {
        showError(error); // Show error if fetching fails
      } finally {
        dispatch(toggleLoading(false)); // Hide loading indicator
      }
    };
    fetchData(); // Execute the fetchData function
  }, [selectedTripId, dispatch]); // Re-run the effect when `selectedTripId` changes

  // Fetch route from OpenRouteService when tripStopsData is available (at least two stops)
  useEffect(() => {
    if (tripStopsData.length < 2) return; // Ensure there are at least two stops for a route

    const fetchRoute = async () => {
      // Map trip stop data to coordinates (lng, lat) format required by ORS API
      const coordinates = tripStopsData.map((stop) => [stop.stop_location.coords.lng, stop.stop_location.coords.lat]);

      try {
        // Fetch route data from OpenRouteService API
        const response = await axios.post(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
          { coordinates },
          { headers: { Authorization: `Bearer ${ORS_API_KEY}`, "Content-Type": "application/json" } }
        );

        // Extract route coordinates from the response and set them to the state
        const routeCoords = response.data.features[0].geometry.coordinates.map(([lng, lat]) => ({
          lat,
          lng,
        }));
        setRoute(routeCoords);
      } catch (error) {
        console.error("Error fetching route from ORS:", error); // Log the error
        setRoute(null); // Reset the route if there’s an error
      }
    };

    fetchRoute(); // Execute the fetchRoute function
  }, [tripStopsData]); // Re-run the effect when `tripStopsData` changes

  return (
    <CustomModal isOpen={openActualRouteMap}>
      <div className="dialog">
        <h3>Route Map</h3>
        <p className="tc">The map below shows the trip route including stops.</p>
        <br />
        {tripStopsData?.length === 0 && (
          <p className="not-available bd">Route Map will be available when driver starts logging the trip activities.</p>
        )}
        <br />
        {/* Render the map if tripStopsData and middleStop are available */}
        {tripStopsData.length > 0 && middleStop && (
          <MapContainer
            center={[middleStop.lat, middleStop.lng]} // Set map center to the middle stop
            zoom={12} // Initial zoom level
            style={{ height: "70vh", width: "100%" }} // Map container styling
            scrollWheelZoom={false} // Disable scroll zoom for the map
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> {/* TileLayer for the map background */}
            {/* Render the route on the map if route data is available */}
            {route && <Polyline positions={route} color="blue" weight={4} />}
            {/* Render markers for each stop */}
            {tripStopsData.map((stop, index) => {
              const { stop_location } = stop;
              const stopName = stop_location?.name?.split(",")[0]; // Extract stop name
              const coords = stop_location?.coords;
              return (
                <Marker key={index} position={[coords.lat, coords.lng]}>
                  <Popup>{stopName}</Popup> {/* Show stop name in the popup */}
                </Marker>
              );
            })}
          </MapContainer>
        )}

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenActualRouteMap(false)}>
            Close
          </button>{" "}
          {/* Close button */}
        </div>
      </div>
    </CustomModal>
  );
};

export default ActualRouteMap; // Export the ActualRouteMap component
