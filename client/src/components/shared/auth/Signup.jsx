// Import necessary hooks and utilities
import { useState } from "react";
import API from "@/utils/API";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import CustomModal from "@/components/shared/CustomModal";
import { authSuccess, toggleLogin, toggleSignup } from "@/redux/features/authSlice";

/**
 * Signup Component
 *
 * A modal-based signup form for user registration.
 * Users enter their personal details, email, driver number, and password.
 * On successful signup, they are authenticated and logged in automatically.
 */
const Signup = () => {
  const dispatch = useDispatch();

  // Local state to manage user input fields
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    driver_number: "",
    password: "",
    confirm_password: "",
  });

  // Get the signup modal state from Redux store
  const openSignup = useSelector((state) => state?.auth?.openSignup);

  /**
   * Handles changes in input fields and updates state
   * @param {Object} e - The input change event
   */
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission for user registration
   * @param {Object} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password and confirm password match
    if (userData?.password?.trim() !== userData?.confirm_password?.trim()) {
      return alert("Password and confirm password should be the same");
    }

    dispatch(toggleLoading(true));

    // Generate driver initials using the first letter of first and last name (uppercase)
    const driver_initials = userData.first_name.charAt(0).toUpperCase() + userData.last_name.charAt(0).toUpperCase();

    // Prepare request body
    const body = { ...userData, driver_initials };

    // API call to register user
    await API.post("/users/signup/", body)
      .then((res) => {
        window.alert(res?.data?.message);
        dispatch(authSuccess(res.data.user_data)); // Save user data in Redux store
        dispatch(toggleSignup(false)); // Close signup modal
        localStorage.setItem("loggedIn", 1); // Store login state in local storage
      })
      .catch((err) => {
        showError(err);
      })
      .finally(() => dispatch(toggleLoading(false)));
  };

  /**
   * Handles switching to login modal
   */
  const handleOpenLogin = () => {
    dispatch(toggleSignup(false)); // Close signup modal
    dispatch(toggleLogin(true)); // Open login modal
  };

  return (
    <CustomModal isOpen={openSignup} maxWidth="800px" maxHeight="450px">
      {/* Signup Form */}
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Sign up now to manage your logbooks</h3>

        {/* Name Fields */}
        <div className="dialog-row">
          <span>
            <label htmlFor="">First Name</label>
            <input type="text" name="first_name" value={userData?.first_name} onChange={handleChange} required />
          </span>
          <span>
            <label htmlFor="">Last Name</label>
            <input type="text" name="last_name" value={userData?.last_name} onChange={handleChange} required />
          </span>
        </div>

        {/* Email and Driver Number Fields */}
        <div className="dialog-row">
          <span>
            <label htmlFor="">Email</label>
            <input type="email" name="email" value={userData?.email} onChange={handleChange} required />
          </span>
          <span>
            <label htmlFor="">Driver Number</label>
            <input type="text" name="driver_number" value={userData?.driver_number} onChange={handleChange} required />
          </span>
        </div>

        {/* Password Fields */}
        <div className="dialog-row">
          <span>
            <label htmlFor="">Password</label>
            <input type="password" name="password" value={userData?.password} onChange={handleChange} required />
          </span>
          <span>
            <label htmlFor="">Repeat Your Password</label>
            <input type="password" name="confirm_password" value={userData?.confirm_password} onChange={handleChange} required />
          </span>
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button type="button" onClick={() => dispatch(toggleSignup(false))}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>

      <br />

      {/* Already a member? Login Link */}
      <div style={{ paddingLeft: "1rem", textAlign: "center" }}>
        Already a member?{" "}
        <span className="button-span" onClick={handleOpenLogin}>
          Login Now
        </span>
      </div>
    </CustomModal>
  );
};

export default Signup;
