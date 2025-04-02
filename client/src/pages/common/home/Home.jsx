// Importing necessary libraries and components
import React from "react"; // React library
import "./Home.css"; // Custom CSS for the Home component
import { useDispatch, useSelector } from "react-redux"; // Redux hooks for dispatching actions and accessing the store
import { Link } from "react-router-dom"; // Link component for navigation
import { toggleLogin } from "@/redux/features/authSlice"; // Action to toggle login state
import globals from "@/utils/globals"; // Global constants and settings

// Home component definition
const Home = () => {
  // Extracting user information from the Redux store
  const userId = useSelector((state) => state?.auth?.user?.id); // Accessing the user ID from auth slice
  const user_groups = useSelector((state) => state?.auth?.user?.user_groups); // Accessing user groups from auth slice

  // Dispatch hook to dispatch actions to the Redux store
  const dispatch = useDispatch();

  return (
    <div className="home">
      {/* Left section of the home page */}
      <div className="left">
        <h1>Your Trucking Logbook Solution</h1> {/* Heading */}
        {/* Conditionally render content based on user group and login state */}
        {[globals?.DRIVER_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && userId && (
          // If user is a DRIVER and logged in, show driver-specific options
          <>
            <p>Manage your logbooks as a trucking driver</p>
            <Link to="/previous-trips/" className="add-button">
              My Trips
            </Link>
          </>
        )}
        {[globals?.CARRIER_ADMIN_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && userId && (
          // If user is a CARRIER_ADMIN and logged in, show admin-specific options
          <>
            <p>Manage trips for your drivers and view their logbooks</p>
            <Link to="/trips/" className="add-button">
              View Trips
            </Link>
          </>
        )}
        {/* If user is not logged in, show the login button */}
        {!userId && (
          <button className="add-button" type="button" onClick={() => dispatch(toggleLogin(true))}>
            Login Now
          </button>
        )}
      </div>

      {/* Right section of the home page with an image */}
      <div className="right">
        <img src="/static/logbook_manager.jpg" alt="" />
      </div>
    </div>
  );
};

// Exporting the Home component for use in other parts of the app
export default Home;
