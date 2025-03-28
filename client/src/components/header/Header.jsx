// import installed packages
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
// import styles

import "./Header.css";
// import material ui items
// import shared/global items
import { showNavbar } from "@/utils";
import Login from "@/components/auth/Login";
import { toggleLogin, toggleSignup } from "@/redux/features/authSlice";
import Signup from "@/components/auth/Signup";

// import redux API

// import components/pages

const Header = () => {
  const firstName = useSelector((state) => state?.auth?.user?.first_name);
  const openLogin = useSelector((state) => state?.auth?.openLogin);
  const openSignup = useSelector((state) => state?.auth?.openSignup);
  const userId = useSelector((state) => state?.auth?.user?.id);
  const dispatch = useDispatch();

  return (
    <>
      <header className="header" id="header">
        <div className="header-left">
          <>
            {/* FOR MOBILE DISPLAY ICONS */}
            <span className="hide-on-desktop" style={{ display: "flex" }}>
              <i className="bx bx-menu dodgerblue" id="mobile-menu-btn-show" onClick={showNavbar}></i>
              <i className="bx bx-window-close red hideBtn" onClick={showNavbar} id="mobile-menu-btn-hide"></i>
            </span>

            {/* FOR DESKTOP DISPLAY ICONS */}
            <span className="hide-on-mobile" style={{ display: "flex" }}>
              <i className="bx bx-menu dodgerblue hide-btn" id="desktop-menu-btn-show" onClick={showNavbar}></i>
              <i className="bx bx-window-close red" onClick={showNavbar} id="desktop-menu-btn-hide"></i>
            </span>
          </>
          <h1>
            <Link to="/" className="dodgerblue">
              Logbook<span style={{ color: "#333333" }}> Manager</span>
            </Link>
          </h1>
        </div>

        {userId ? (
          <div className="header-right authenticated">
            <>
              <div>
                <h4>
                  <span className="green bd">&bull; {firstName}</span>
                </h4>
              </div>
            </>
          </div>
        ) : (
          <div className="header-right hide-on-mobile">
            <span className="button" onClick={() => dispatch(toggleLogin(true))}>
              Login
            </span>
            <span className="button" onClick={() => dispatch(toggleSignup(true))}>
              Signup
            </span>
          </div>
        )}
      </header>
      {openLogin && <Login />}
      {openSignup && <Signup />}
    </>
  );
};

export default Header;
