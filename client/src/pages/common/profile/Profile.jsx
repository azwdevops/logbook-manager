// Importing necessary libraries and components
import React, { useEffect, useState } from "react"; // React library
import "./Profile.css"; // Custom CSS for the Profile component
import { useDispatch, useSelector } from "react-redux"; // Redux hooks to dispatch actions and select state
import API from "@/utils/API"; // API utility to make requests
import { showError } from "@/utils"; // Utility to handle errors
import { toggleLoading } from "@/redux/features/sharedSlice"; // Redux action to toggle loading state
import { CircularProgress } from "@mui/material"; // Material UI CircularProgress component for loading spinner
import ChangePassword from "@/components/shared/auth/ChangePassword"; // Component to handle changing password

// Profile component definition for managing user profile
const Profile = () => {
  const [openChangePassword, setOpenChangePassword] = useState(false); // State to control visibility of ChangePassword modal

  const dispatch = useDispatch(); // Dispatch hook to dispatch actions to Redux store

  const user = useSelector((state) => state?.auth?.user); // Selecting user data from Redux store
  const loading = useSelector((state) => state?.shared?.loading); // Selecting loading state from Redux store

  const [userData, setUserData] = useState(); // State to hold editable user data

  // Effect to set the userData state whenever the user data from Redux changes
  useEffect(() => {
    setUserData(user);
  }, [user]);

  // Handle input changes and update userData state
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Handle form submission to update user profile
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    dispatch(toggleLoading(true)); // Set loading state to true
    await API.patch(`/users/maintain-user/`, userData) // Make PATCH request to update user data
      .then((res) => {
        window.alert(res?.data?.message); // Show success message
      })
      .catch((err) => showError(err)) // Handle error
      .finally(() => dispatch(toggleLoading(false))); // Set loading state to false after request is complete
  };

  return (
    <>
      {/* Profile form wrapped in a div with conditional loading state */}
      <div className={`dialog profile ${loading && "page-loading"}`} style={{ maxWidth: "1000px", margin: "auto" }}>
        <h3>Manage your profile</h3>

        {/* Form fields for user details */}
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

        {/* Show a loading spinner while the profile is being updated */}
        {loading && <CircularProgress style={{ position: "absolute", marginLeft: "25%", marginTop: "0%" }} size={80} />}

        {/* Additional form fields for driver number and email */}
        <div className="dialog-row">
          <span>
            <label htmlFor="">My Driver Number</label>
            <input type="text" name="driver_number" value={userData?.driver_number} onChange={handleChange} />
          </span>
          <span>
            <label htmlFor="">Email Address</label>
            <input type="text" name="email" value={userData?.email} onChange={handleChange} />
          </span>
        </div>

        {/* Buttons to change password and update profile */}
        <div className="profile-buttons">
          <button type="button" className="add-button" onClick={() => setOpenChangePassword(true)}>
            Change Password
          </button>
          <button type="button" className="add-button" onClick={handleSubmit}>
            Update Profile
          </button>
        </div>
      </div>

      {/* Conditionally render the ChangePassword modal */}
      {openChangePassword && <ChangePassword openChangePassword={openChangePassword} setOpenChangePassword={setOpenChangePassword} />}
    </>
  );
};

// Exporting the Profile component for use in other parts of the app
export default Profile;
