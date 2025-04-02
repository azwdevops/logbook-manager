import { Navigate, Outlet } from "react-router-dom";

// PrivateRoute component ensures that only logged-in users can access certain routes
const PrivateRoute = () => {
  // Retrieve the "loggedIn" status from localStorage to check if the user is logged in
  const loggedIn = localStorage.getItem("loggedIn");

  // If the user is logged in, render the child routes (via <Outlet />); otherwise, redirect to home page
  return loggedIn ? <Outlet /> : <Navigate to="/" />;
};

// Exporting PrivateRoute component to be used in routing
export default PrivateRoute;
