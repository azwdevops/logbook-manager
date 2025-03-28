import "./App.scss";
import { hideNavBar } from "@/utils";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import Home from "@/pages/home/Home";
import PrivateRoute from "@/utils/PrivateRoute";
import NotFound from "@/pages/not-found/NotFound";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import API from "./utils/API";
import { authSuccess } from "./redux/features/authSlice";
import { toggleLoading } from "./redux/features/sharedSlice";
import Dashboard from "./pages/dashboard/Dashboard";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      await API.get(`/users/get-user/`)
        .then((res) => {
          dispatch(authSuccess(res.data.user_data));
        })
        .catch((err) => {})
        .finally(() => dispatch(toggleLoading(false)));
    };
    fetchData();
  }, [dispatch]);

  const RoutesComponent = () => (
    <Routes>
      <Route exact path="/" element={<Home />} />
      {/* PRIVATE ROUTES */}

      <Route element={<PrivateRoute />}>
        <Route exact path="/dashboard/" element={<Dashboard />} />
      </Route>
      {/* PUBLIC ROUTES */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <div id="body-pd">
      <Header />
      <Sidebar />
      {/* DISPLAY FOR DESKTOP */}
      <div className="main-content hide-on-mobile body-section" id="body-section">
        <RoutesComponent />
      </div>
      {/* DISPLAY FOR MOBILE */}
      <div className="main-content hide-on-desktop" id="body-section" onClick={hideNavBar}>
        <RoutesComponent />
      </div>
    </div>
  );
}

export default App;
