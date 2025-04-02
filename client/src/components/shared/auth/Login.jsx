// Import React hooks for managing state and navigation
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// Import React Router functions for navigation
import { Link, useNavigate } from "react-router-dom";
// Import Redux action to toggle loading state
import { toggleLoading } from "@/redux/features/sharedSlice";
// Import API utility for making HTTP requests
import API from "@/utils/API";
// Import utility function to handle and display errors
import { showError } from "@/utils";
// Import Redux actions for authentication management
import { authSuccess, toggleLogin, toggleSignup } from "@/redux/features/authSlice";
// Import custom modal component
import CustomModal from "@/components/shared/CustomModal";

/**
 * Login Component
 *
 * A modal-based login form where users enter their email and password.
 * On successful login, the user is redirected to the homepage.
 */
const Login = () => {
  // Initialize Redux dispatch function
  const dispatch = useDispatch();

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Get login modal state from Redux store
  const openLogin = useSelector((state) => state?.auth?.openLogin);

  // Local state to manage login form inputs
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  /**
   * Handle input field changes and update the state
   * @param {Object} e - The event object from input change
   */
  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission for user login
   * @param {Object} e - The event object from form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true)); // Show loading state

    // API call to authenticate user
    await API.post("/users/login/", loginData)
      .then((res) => {
        dispatch(authSuccess(res.data.user_data)); // Store user data in Redux
        dispatch(toggleLogin(false)); // Close login modal
        navigate("/"); // Redirect to home page
        localStorage.setItem("loggedIn", 1); // Store login state in local storage
      })
      .catch((err) => {
        showError(err); // Handle and display error
      })
      .finally(() => dispatch(toggleLoading(false))); // Hide loading state
  };

  /**
   * Handle switching to signup modal
   */
  const handleOpenSignup = () => {
    dispatch(toggleLogin(false)); // Close login modal
    dispatch(toggleSignup(true)); // Open signup modal
  };

  return (
    <CustomModal isOpen={openLogin} maxWidth="500px" maxHeight="fit-content">
      {/* Login Form */}
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Login to your account</h3>

        {/* Email Input */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Email</label>
          <input type="email" autoComplete="off" name="email" onChange={handleChange} value={loginData?.email} required />
        </div>

        {/* Password Input */}
        <div className="dialog-row-single-item">
          <label htmlFor="">Password</label>
          <input type="password" autoComplete="off" name="password" onChange={handleChange} value={loginData?.password} required />
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button type="button" onClick={() => dispatch(toggleLogin(false))}>
            Close
          </button>
          <button type="submit">Login Now</button>
        </div>

        <br />
        <br />

        {/* Additional Links */}
        <div className="dialog-links">
          <p className="button-span">Forgot Password</p>
          <p className="button-span" onClick={handleOpenSignup}>
            Join Now
          </p>
        </div>
      </form>
    </CustomModal>
  );
};

export default Login;
