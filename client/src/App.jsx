import "./App.scss";
import { hideNavBar } from "@/utils";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "@/utils/PrivateRoute";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "@/utils/API";
import { authSuccess } from "@/redux/features/authSlice";
import { toggleLoading } from "@/redux/features/sharedSlice";
import NotFound from "@/pages/common/not-found/NotFound";
import Home from "@/pages/common/home/Home";
import CurrentTrip from "@/pages/driver/current-trip/CurrentTrip";
import PreviousTrips from "@/pages/driver/previous-trips/PreviousTrips";
import Profile from "@/pages/common/profile/Profile";
import globals from "@/utils/globals";
import Carriers from "@/pages/system-admin/carriers/Carriers";
import Drivers from "@/pages/carrier-admin/drivers/Drivers";
import Trips from "@/pages/carrier-admin/trips/Trips";
import Trucks from "@/pages/carrier-admin/trucks/Trucks";

function App() {
  const dispatch = useDispatch();

  const user_groups = useSelector((state) => state?.auth?.user?.user_groups);

  useEffect(() => {
    const fetchData = async () => {
      await API.get(`/users/maintain-user/`)
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
        {[globals?.SYSTEM_ADMIN_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <Route exact path="/carriers/" element={<Carriers />} />
        )}
        {[globals?.DRIVER_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <>
            <Route exact path="/current-trip/" element={<CurrentTrip />} />
            <Route exact path="/previous-trips/" element={<PreviousTrips />} />
          </>
        )}
        {[globals?.CARRIER_ADMIN_GROUP]?.some((allowed_group) => user_groups?.includes(allowed_group)) && (
          <>
            <Route exact path="/drivers/" element={<Drivers />} />
            <Route exact path="/trucks/" element={<Trucks />} />
            <Route exact path="/trips/" element={<Trips />} />
          </>
        )}
        <Route exact path="/profile/" element={<Profile />} />
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
