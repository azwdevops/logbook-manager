import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <h3>Page Not found</h3>
      <br />
      <div className="tc">
        <Link to="/" className="add-button">
          Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
