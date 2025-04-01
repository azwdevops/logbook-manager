const CarrierAdminLinks = ({ Link, pathname }) => {
  return (
    <>
      <Link to="/drivers/" className={`${pathname}` === "/drivers/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-group"></i> <span className="nav-name">Drivers</span>
      </Link>
      <Link to="/trucks/" className={`${pathname}` === "/trucks/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-truck"></i> <span className="nav-name">Trucks</span>
      </Link>
      <Link to="/trips/" className={`${pathname}` === "/trips/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bx-trip"></i> <span className="nav-name">Trips</span>
      </Link>
    </>
  );
};

export default CarrierAdminLinks;
