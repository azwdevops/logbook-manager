const DriverLinks = ({ Link, pathname }) => {
  return (
    <>
      <Link to="/current-trip/" className={`${pathname}` === "/current-trip/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bx-trip"></i> <span className="nav-name">Current Trip</span>
      </Link>
      <Link to="/previous-trips/" className={`${pathname}` === "/previous-trips/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-dashboard"></i> <span className="nav-name">Previous Trips</span>
      </Link>
    </>
  );
};

export default DriverLinks;
