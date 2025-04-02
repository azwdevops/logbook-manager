// Import API utility for making HTTP requests
import API from "@/utils/API";
// Import React hooks for state management
import { useState } from "react";
// Import Redux hooks for state management and dispatching actions
import { useDispatch, useSelector } from "react-redux";
// Import action to toggle loading state
import { toggleLoading } from "@/redux/features/sharedSlice";
// Import utility function to handle and display errors
import { showError } from "@/utils";
// Import custom modal component
import CustomModal from "@/components/shared/CustomModal";

/**
 * ChangePassword Component
 *
 * A modal form for users to change their password.
 * Users must enter their old password, a new password,
 * and confirm the new password before submission.
 */
const ChangePassword = (props) => {
  // Destructure props to get modal state management functions
  const { openChangePassword, setOpenChangePassword } = props;

  // Get the authenticated user ID from Redux store
  const userId = useSelector((state) => state?.auth?.user?.id);

  // Redux dispatch function to trigger actions
  const dispatch = useDispatch();

  // Local state to store password inputs
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  /**
   * Handle input field changes and update the state
   * @param {Object} e - The event object from input change
   */
  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission for changing the password
   * @param {Object} e - The event object from form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure new password and confirmation match
    if (passwordData?.new_password?.trim() !== passwordData?.confirm_new_password?.trim()) {
      return window.alert("New password and confirm password must be the same");
    }

    dispatch(toggleLoading(true)); // Show loading state

    // API call to update the password
    await API.post("/users/change-password/", { ...passwordData, userId })
      .then((res) => {
        localStorage.removeItem("loggedIn"); // Remove logged-in state
        window.location.href = "/"; // Redirect to home page
        window.alert(res?.data?.message); // Show success message

        // Reset password input fields
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_new_password: "",
        });
      })
      .catch((err) => showError(err)) // Handle errors
      .finally(() => dispatch(toggleLoading(false))); // Hide loading state
  };

  return (
    <CustomModal isOpen={openChangePassword} maxWidth="500px" maxHeight="400px">
      {/* Change Password Form */}
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Change your password</h3>

        {/* Old Password Input */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Old Password</label>
          <input type="password" name="old_password" onChange={handleChange} value={passwordData?.old_password} required />
        </div>

        {/* New Password Input */}
        <div className="dialog-row-single-item">
          <label htmlFor="">New Password</label>
          <input type="password" name="new_password" onChange={handleChange} value={passwordData?.new_password} required />
        </div>

        {/* Confirm New Password Input */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Confirm New Password</label>
          <input type="password" name="confirm_new_password" onChange={handleChange} value={passwordData?.confirm_new_password} required />
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenChangePassword(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default ChangePassword;
