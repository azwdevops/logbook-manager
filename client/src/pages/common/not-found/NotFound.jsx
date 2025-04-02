// Importing necessary libraries and components
import React from "react"; // React library
import { Link } from "react-router-dom"; // Link component for navigation

// NotFound component definition, which is displayed when a page is not found
const NotFound = () => {
  return (
    <div>
      {/* Heading to notify the user that the page was not found */}
      <h3>Page Not found</h3>
      <br />

      {/* Centered link to navigate the user back to the homepage */}
      <div className="tc">
        <Link to="/" className="add-button">
          Back Home
        </Link>
      </div>
    </div>
  );
};

// Exporting the NotFound component for use in other parts of the app
export default NotFound;
