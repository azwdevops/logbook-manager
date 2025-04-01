import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/utils/API";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import CustomModal from "@/components/shared/CustomModal";
import { authSuccess, toggleLogin, toggleSignup } from "@/redux/features/authSlice";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    driver_number: "",
    password: "",
    confirm_password: "",
  });
  const openSignup = useSelector((state) => state?.auth?.openSignup);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData?.password?.trim() !== userData?.confirm_password?.trim()) {
      return alert("Password and confirm password should be the same");
    }
    dispatch(toggleLoading(true));
    const driver_initials = userData.first_name.charAt(0).toLocaleUpperCase() + userData.last_name.charAt(0).toLocaleUpperCase();

    const body = {
      ...userData,
      driver_initials,
    };
    await API.post("/users/signup/", body)
      .then((res) => {
        window.alert(res?.data?.message);
        dispatch(authSuccess(res.data.user_data));
        dispatch(toggleSignup(false));
        localStorage.setItem("loggedIn", 1);
      })
      .catch((err) => {
        showError(err);
      })
      .finally(() => dispatch(toggleLoading(false)));
  };

  const handleOpenLogin = () => {
    dispatch(toggleSignup(false));
    dispatch(toggleLogin(true));
  };

  return (
    <CustomModal isOpen={openSignup} maxWidth="800px" maxHeight="450px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Sign up now to manage your logbooks</h3>
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
        <div className="form-buttons">
          <button type="button" onClick={() => dispatch(toggleSignup(false))}>
            Close
          </button>
          <button type="submit" className="">
            Submit
          </button>
        </div>
      </form>
      <br />
      <div style={{ paddingLeft: "1rem", textAlign: "center" }}>
        Already a member?{" "}
        <span to="/login" className="button-span" onClick={handleOpenLogin}>
          Login Now
        </span>
      </div>
    </CustomModal>
  );
};

export default Signup;
