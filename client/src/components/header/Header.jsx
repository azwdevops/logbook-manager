// Import installed packages
import { useDispatch, useSelector } from "react-redux"; // Redux hooks for state management
import { Link } from "react-router-dom"; // Link component for navigation

// Import styles
import "./Header.css";

// Import shared/global items
import { showNavbar } from "@/utils"; // Function to toggle the navigation bar visibility
import { toggleLogin, toggleSignup } from "@/redux/features/authSlice"; // Redux actions for authentication modals
import Login from "@/components/shared/auth/Login"; // Login component
import Signup from "@/components/shared/auth/Signup"; // Signup component

// Header component
const Header = () => {
  // Retrieve authentication-related state from Redux store
  const firstName = useSelector((state) => state?.auth?.user?.first_name); // Get the user's first name
  const openLogin = useSelector((state) => state?.auth?.openLogin); // Boolean to track login modal state
  const openSignup = useSelector((state) => state?.auth?.openSignup); // Boolean to track signup modal state
  const userId = useSelector((state) => state?.auth?.user?.id); // Get the authenticated user ID
  const dispatch = useDispatch(); // Redux dispatch function to trigger actions

  return (
    <>
      {/* Header section */}
      <header className="header" id="header">
        <div className="header-left">
          <>
            {/* Mobile navigation icons */}
            <span className="hide-on-desktop" style={{ display: "flex" }}>
              <i className="bx bx-menu dodgerblue" id="mobile-menu-btn-show" onClick={showNavbar}></i>
              <i className="bx bx-window-close red hideBtn" onClick={showNavbar} id="mobile-menu-btn-hide"></i>
            </span>

            {/* Desktop navigation icons */}
            <span className="hide-on-mobile" style={{ display: "flex" }}>
              <i className="bx bx-menu dodgerblue hide-btn" id="desktop-menu-btn-show" onClick={showNavbar}></i>
              <i className="bx bx-window-close red" onClick={showNavbar} id="desktop-menu-btn-hide"></i>
            </span>
          </>
          {/* Website title */}
          <h1>
            <Link to="/" className="dodgerblue">
              Logbook<span style={{ color: "#333333" }}> Manager</span>
            </Link>
          </h1>
        </div>

        {/* If user is authenticated, show their name; otherwise, show login/signup buttons */}
        {userId ? (
          <div className="header-right authenticated">
            <>
              <div>
                <h4>
                  <span className="green bd">&bull; {firstName}</span> {/* Display user's first name */}
                </h4>
              </div>
            </>
          </div>
        ) : (
          <div className="header-right hide-on-mobile">
            {/* Login button triggers login modal */}
            <span className="button" onClick={() => dispatch(toggleLogin(true))}>
              Login
            </span>
            {/* Signup button triggers signup modal */}
            <span className="button" onClick={() => dispatch(toggleSignup(true))}>
              Signup
            </span>
          </div>
        )}
      </header>

      {/* Conditionally render login/signup modals */}
      {openLogin && <Login />}
      {openSignup && <Signup />}
    </>
  );
};

export default Header;
