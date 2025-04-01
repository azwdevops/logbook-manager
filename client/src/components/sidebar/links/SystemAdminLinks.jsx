const SystemAdminLinks = ({ Link, pathname }) => {
  return (
    <>
      <Link to="/carriers/" className={`${pathname}` === "/carriers/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-dashboard"></i>
        <span className="nav-name">Carriers</span>
      </Link>
    </>
  );
};

export default SystemAdminLinks;
