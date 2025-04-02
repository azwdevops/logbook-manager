import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import API from "@/utils/API";
import { logoutUser, toggleLogin, toggleSignup } from "@/redux/features/authSlice";
import { showError } from "@/utils";
import globals from "@/utils/globals";
import SystemAdminLinks from "./links/SystemAdminLinks";
import DriverLinks from "./links/DriverLinks";
import CarrierAdminLinks from "./links/CarrierAdminLinks";

const Sidebar = () => {
  const { pathname } = useLocation(); // Get the current URL path

  // Get user ID and groups from Redux state
  const userId = useSelector((state) => state?.auth?.user?.id);
  const user_groups = useSelector((state) => state?.auth?.user?.user_groups);

  const dispatch = useDispatch(); // Initialize Redux dispatch
  const navigate = useNavigate(); // Initialize navigation hook

  // Logout function
  const logout = async () => {
    await API.post("/users/logout/")
      .then((res) => {
        dispatch(logoutUser()); // Dispatch logout action
        navigate("/"); // Redirect to home page
        localStorage.removeItem("loggedIn"); // Remove login status from local storage
      })
      .catch((err) => showError(err)); // Handle errors
  };

  // Sidebar navigation component
  const SIDEBARNAV = () => (
    <nav className="nav">
      <div className="nav__list">
        {/* Home link */}
        <Link to="/" className={`${pathname}` === "/" ? "sidebar-link active" : "sidebar-link"}>
          <i className="bx bxs-home"></i> <span className="nav-name">Home</span>
        </Link>

        {/* Show Signup/Login links if user is not logged in */}
        {!userId && (
          <>
            <Link to="#" className={`sidebar-link ${pathname === "/revision/" && "active"}`}>
              <div className="main-link" onClick={() => dispatch(toggleSignup(true))}>
                <i className="bx bx-user-plus"></i>
                <span>Signup</span>
              </div>
            </Link>
            <Link to="#" className={`sidebar-link ${pathname === "/revision/" && "active"}`}>
              <div className="main-link" onClick={() => dispatch(toggleLogin(true))}>
                <i class="bx bx-log-in"></i>
                <span>Login</span>
              </div>
            </Link>
          </>
        )}

        {/* Show system admin links if user belongs to the System Admin group */}
        {[globals?.SYSTEM_ADMIN_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <SystemAdminLinks Link={Link} pathname={pathname} />
        )}

        {/* Show driver links if user belongs to the Driver group */}
        {[globals?.DRIVER_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <DriverLinks Link={Link} pathname={pathname} />
        )}

        {/* Show carrier admin links if user belongs to the Carrier Admin group */}
        {[globals?.CARRIER_ADMIN_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <CarrierAdminLinks Link={Link} pathname={pathname} />
        )}

        {/* Show Profile and Logout options if user is logged in */}
        {userId && (
          <>
            <Link to="/profile/" className={`${pathname}` === "/profile/" ? "sidebar-link active" : "sidebar-link"}>
              <i className="bx bxs-user"></i> <span className="nav-name">Profile</span>
            </Link>
            <Link to="#" className={`${pathname}` === "#" ? "sidebar-link active" : "sidebar-link"} onClick={logout}>
              <i className="bx bx-log-out"></i> <span className="nav-name">Logout</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="left-navbar show hide-on-mobile" id="desktop-nav-bar">
        <SIDEBARNAV />
      </div>

      {/* Sidebar for mobile */}
      <div className="left-navbar hide-on-desktop" id="mobile-nav-bar">
        <SIDEBARNAV />
      </div>
    </>
  );
};

export default Sidebar;
