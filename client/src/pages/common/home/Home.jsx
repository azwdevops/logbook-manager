import React from "react";

import "./Home.css";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toggleLogin } from "@/redux/features/authSlice";

const Home = () => {
  const userId = useSelector((state) => state?.auth?.user?.id);

  const dispatch = useDispatch();

  return (
    <div className="home">
      <div className="left">
        <h1>Your Trucking Logbook Solution</h1>
        <p>Manage your logbooks as a trucking driver</p>
        {userId && (
          <Link to="/previous-trips/" className="add-button">
            My Trips
          </Link>
        )}
        {!userId && (
          <button className="add-button" type="button" onClick={() => dispatch(toggleLogin(true))}>
            Login Now
          </button>
        )}
      </div>
      <div className="right">
        <img src="/static/logbook_manager.jpg" alt="" />
      </div>
    </div>
  );
};

export default Home;
