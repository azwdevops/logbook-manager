import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // we use the local storage to avoid being redirected to home page on every page refresh
  const loggedIn = localStorage.getItem("loggedIn");

  return loggedIn ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
