import React, { useEffect, useState } from "react";

import "./Profile.css";
import { useDispatch, useSelector } from "react-redux";
import API from "@/utils/API";
import { showError } from "@/utils";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { CircularProgress } from "@mui/material";
import ChangePassword from "@/components/auth/ChangePassword";

const Profile = () => {
  const [openChangePassword, setOpenChangePassword] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector((state) => state?.auth?.user);
  const loading = useSelector((state) => state?.shared?.loading);

  const [userData, setUserData] = useState();

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.patch(`/users/maintain-user/`, userData)
      .then((res) => {
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <>
      <div className={`dialog profile ${loading && "page-loading"}`} style={{ maxWidth: "1000px", margin: "auto" }}>
        <h3>Manage your profile</h3>
        <div className="dialog-row">
          <span>
            <label htmlFor="">First Name</label>
            <input type="text" name="first_name" value={userData?.first_name} onChange={handleChange} />
          </span>
          <span>
            <label htmlFor="">Last Name</label>
            <input type="text" name="last_name" value={userData?.last_name} onChange={handleChange} />
          </span>
          <span>
            <label htmlFor="">My Initials</label>
            <input type="text" name="driver_initials" value={userData?.driver_initials} onChange={handleChange} />
          </span>
        </div>
        {loading && <CircularProgress style={{ position: "absolute", marginLeft: "25%", marginTop: "0%" }} size={80} />}
        <div className="dialog-row">
          <span>
            <label htmlFor="">My Driver Number</label>
            <input type="text" name="driver_number" value={userData?.driver_number} onChange={handleChange} />
          </span>
          <span>
            <label htmlFor="">Email Address</label>
            <input type="text" name="email" value={userData?.email} onChange={handleChange} />
          </span>
          <span>
            <label htmlFor="">Truck/Trailer Number</label>
            <input type="text" name="truck_trailer_number" value={userData?.truck_trailer_number} onChange={handleChange} />
          </span>
        </div>
        <div className="profile-buttons">
          <button type="button" className="add-button" onClick={() => setOpenChangePassword(true)}>
            Change Password
          </button>
          <button type="button" className="add-button" onClick={handleSubmit}>
            Update Profile
          </button>
        </div>
      </div>
      {openChangePassword && <ChangePassword openChangePassword={openChangePassword} setOpenChangePassword={setOpenChangePassword} />}
    </>
  );
};

export default Profile;
