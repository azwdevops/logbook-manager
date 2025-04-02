// SystemAdminLinks component to display navigation links for system administrators
const SystemAdminLinks = ({ Link, pathname }) => {
  return (
    <>
      {/* Link to Carriers page, with 'active' class applied if pathname matches "/carriers/" */}
      <Link to="/carriers/" className={`${pathname}` === "/carriers/" ? "sidebar-link active" : "sidebar-link"}>
        <i className="bx bxs-dashboard"></i> {/* Icon for Carriers */}
        <span className="nav-name">Carriers</span> {/* Label for the link */}
      </Link>
    </>
  );
};

// Export SystemAdminLinks component for use in other parts of the application
export default SystemAdminLinks;
