import "./App.scss"; // Importing the main stylesheet for the app
import { hideNavBar } from "@/utils"; // Importing utility function to hide the navigation bar
import Header from "@/components/header/Header"; // Importing the Header component
import Sidebar from "@/components/sidebar/Sidebar"; // Importing the Sidebar component
import { Route, Routes } from "react-router-dom"; // Importing routing components from react-router-dom
import PrivateRoute from "@/utils/PrivateRoute"; // Importing PrivateRoute component to handle protected routes
import { useEffect } from "react"; // Importing useEffect hook to manage side-effects
import { useDispatch, useSelector } from "react-redux"; // Importing Redux hooks for dispatching actions and accessing state
import API from "@/utils/API"; // Importing API utility for making HTTP requests
import { authSuccess } from "@/redux/features/authSlice"; // Importing action to update user authentication status in Redux
import { toggleLoading } from "@/redux/features/sharedSlice"; // Importing action to toggle the loading state
import NotFound from "@/pages/common/not-found/NotFound"; // Importing the NotFound page component for invalid routes
import Home from "@/pages/common/home/Home"; // Importing Home page component
import CurrentTrip from "@/pages/driver/current-trip/CurrentTrip"; // Importing CurrentTrip page component
import PreviousTrips from "@/pages/driver/previous-trips/PreviousTrips"; // Importing PreviousTrips page component
import Profile from "@/pages/common/profile/Profile"; // Importing Profile page component
import globals from "@/utils/globals"; // Importing global constants (e.g., user roles/groups)
import Carriers from "@/pages/system-admin/carriers/Carriers"; // Importing Carriers page component for system admin
import Drivers from "@/pages/carrier-admin/drivers/Drivers"; // Importing Drivers page component for carrier admin
import Trips from "@/pages/carrier-admin/trips/Trips"; // Importing Trips page component for carrier admin
import Trucks from "@/pages/carrier-admin/trucks/Trucks"; // Importing Trucks page component for carrier admin

// Main App component
function App() {
  const dispatch = useDispatch(); // Dispatch function to trigger Redux actions

  // Accessing user groups from Redux state
  const user_groups = useSelector((state) => state?.auth?.user?.user_groups);

  // Fetch user data on component mount and update the authentication state
  useEffect(() => {
    const fetchData = async () => {
      // Fetching user data from API and dispatching success action
      await API.get(`/users/maintain-user/`)
        .then((res) => {
          dispatch(authSuccess(res.data.user_data)); // Dispatching authentication success with fetched user data
        })
        .catch((err) => {}) // Error handling if API call fails
        .finally(() => dispatch(toggleLoading(false))); // Hiding loading spinner after API call finishes
    };
    fetchData(); // Calling the fetch function
  }, [dispatch]); // Dependency array to re-run effect when dispatch changes

  // Routing logic wrapped in a Routes component
  const RoutesComponent = () => (
    <Routes>
      <Route exact path="/" element={<Home />} /> {/* Public Home route */}
      {/* PRIVATE ROUTES */}
      <Route element={<PrivateRoute />}>
        {/* Conditional routes based on user group */}
        {[globals?.SYSTEM_ADMIN_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <Route exact path="/carriers/" element={<Carriers />} /> // Accessible by system admins only
        )}
        {[globals?.DRIVER_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <>
            <Route exact path="/current-trip/" element={<CurrentTrip />} /> // Accessible by drivers only
            <Route exact path="/previous-trips/" element={<PreviousTrips />} /> // Accessible by drivers only
          </>
        )}
        {[globals?.CARRIER_ADMIN_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <>
            <Route exact path="/drivers/" element={<Drivers />} /> // Accessible by carrier admins only
            <Route exact path="/trucks/" element={<Trucks />} /> // Accessible by carrier admins only
            <Route exact path="/trips/" element={<Trips />} /> // Accessible by carrier admins only
          </>
        )}
        <Route exact path="/profile/" element={<Profile />} /> {/* Profile route for all authenticated users */}
      </Route>
      {/* PUBLIC ROUTES */}
      <Route path="*" element={<NotFound />} /> {/* Fallback route for non-existing paths */}
    </Routes>
  );

  return (
    <div id="body-pd">
      {" "}
      {/* Main wrapper for the body content */}
      <Header /> {/* Rendering the Header component */}
      <Sidebar /> {/* Rendering the Sidebar component */}
      {/* DISPLAY FOR DESKTOP */}
      <div className="main-content hide-on-mobile body-section" id="body-section">
        <RoutesComponent /> {/* Rendering the RoutesComponent for desktop view */}
      </div>
      {/* DISPLAY FOR MOBILE */}
      <div className="main-content hide-on-desktop" id="body-section" onClick={hideNavBar}>
        <RoutesComponent /> {/* Rendering the RoutesComponent for mobile view */}
      </div>
    </div>
  );
}

// Exporting the App component to be used as the main entry point of the application
export default App;
