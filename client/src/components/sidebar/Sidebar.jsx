import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import API from "@/utils/API";
import { logoutUser } from "@/redux/features/authSlice";
import { showError } from "@/utils";

const Sidebar = () => {
  const { pathname } = useLocation();

  const userId = useSelector((state) => state?.auth?.user?.id);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    await API.post("/users/logout/")
      .then((res) => {
        dispatch(logoutUser());
        navigate("/");
        localStorage.removeItem("loggedIn");
      })
      .catch((err) => showError(err));
  };

  const SIDEBARNAV = () => (
    <nav className="nav">
      <div className="nav__list">
        <Link to="/" className={`${pathname}` === "/" ? "sidebar-link active" : "sidebar-link"}>
          <i className="bx bxs-home"></i> <span className="nav-name">Home</span>
        </Link>
        {!userId && (
          <>
            <Link to="#" className={`sidebar-link ${pathname === "/revision/" && "active"}`}>
              <div className="main-link">
                <i className="bx bx-user-plus"></i>
                <span>Signup</span>
              </div>
            </Link>
            <Link to="#" className={`sidebar-link ${pathname === "/revision/" && "active"}`}>
              <div className="main-link">
                <i class="bx bx-log-in"></i>
                <span>Login</span>
              </div>
            </Link>
          </>
        )}
        {userId && (
          <>
            <Link to="/current-trip/" className={`${pathname}` === "/current-trip/" ? "sidebar-link active" : "sidebar-link"}>
              <i className="bx bx-trip"></i> <span className="nav-name">Current Trip</span>
            </Link>
            <Link to="/dashboard/" className={`${pathname}` === "/dashboard/" ? "sidebar-link active" : "sidebar-link"}>
              <i className="bx bxs-dashboard"></i> <span className="nav-name">Previous Trips</span>
            </Link>
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
      <div className="left-navbar show hide-on-mobile" id="desktop-nav-bar">
        <SIDEBARNAV />
      </div>
      {/* SIDEBAR MOBILE DISPLAY */}
      <div className="left-navbar hide-on-desktop" id="mobile-nav-bar">
        <SIDEBARNAV />
      </div>
    </>
  );
};

export default Sidebar;
