// DriverLinks component to display navigation links for drivers
const DriverLinks = ({ Link, pathname }) => {
  return (
    <>
      {/* Link to Current Trip page, with active class applied if the current pathname matches "/current-trip/" */}
      <Link to="/current-trip/" className={`${pathname}` === "/current-trip/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bx-trip"></i> {/* Icon for Current Trip */}
        <span className="nav-name">Current Trip</span> {/* Label for the link */}
      </Link>

      {/* Link to Previous Trips page, with active class applied if the current pathname matches "/previous-trips/" */}
      <Link to="/previous-trips/" className={`${pathname}` === "/previous-trips/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-dashboard"></i> {/* Icon for Previous Trips */}
        <span className="nav-name">Previous Trips</span> {/* Label for the link */}
      </Link>
      <Link to="/my-logbooks/" className={`${pathname}` === "/my-logbooks/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bx-clipboard"></i>
        <span className="nav-name">My Logbooks</span> {/* Label for the link */}
      </Link>
    </>
  );
};

// Export DriverLinks component for use in other parts of the application
export default DriverLinks;
