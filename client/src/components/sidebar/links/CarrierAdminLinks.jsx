// CarrierAdminLinks component to display navigation links for Carrier Admin
const CarrierAdminLinks = ({ Link, pathname }) => {
  return (
    <>
      {/* Link to "/drivers/", add 'active' class if pathname matches */}
      <Link to="/drivers/" className={`${pathname}` === "/drivers/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-group"></i> {/* Icon for drivers */}
        <span className="nav-name">Drivers</span> {/* Text for the drivers link */}
      </Link>

      {/* Link to "/trucks/", add 'active' class if pathname matches */}
      <Link to="/trucks/" className={`${pathname}` === "/trucks/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-truck"></i> {/* Icon for trucks */}
        <span className="nav-name">Trucks</span> {/* Text for the trucks link */}
      </Link>

      {/* Link to "/trips/", add 'active' class if pathname matches */}
      <Link to="/trips/" className={`${pathname}` === "/trips/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bx-trip"></i> {/* Icon for trips */}
        <span className="nav-name">Trips</span> {/* Text for the trips link */}
      </Link>
    </>
  );
};

// Export CarrierAdminLinks component for use in other parts of the application
export default CarrierAdminLinks;
