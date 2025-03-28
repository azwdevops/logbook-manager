import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toggleLoading } from "@/redux/features/sharedSlice";
import API from "@/utils/API";
import { showError } from "@/utils";
import { authSuccess, toggleLogin, toggleSignup } from "@/redux/features/authSlice";
import CustomModal from "@/components/shared/CustomModal";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const openLogin = useSelector((state) => state?.auth?.openLogin);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(toggleLoading(true));
    await API.post("/users/login/", loginData)
      .then((res) => {
        dispatch(authSuccess(res.data.user_data));
        dispatch(toggleLogin(false));
        navigate("/");
        localStorage.setItem("loggedIn", 1);
      })
      .catch((err) => {
        showError(err);
      })
      .finally(() => dispatch(toggleLoading(false)));
  };

  const handleOpenSignup = () => {
    dispatch(toggleLogin(false));
    dispatch(toggleSignup(true));
  };

  return (
    <CustomModal isOpen={openLogin} maxWidth="500px" maxHeight="fit-content">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3 className="">Login to your account</h3>
        <div className="dialog-row-single-item">
          <label htmlFor="">Email</label>
          <input type="email" autoComplete="off" name="email" onChange={handleChange} value={loginData?.email} required />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Password</label>
          <input type="password" autoComplete="off" name="password" onChange={handleChange} value={loginData?.password} required />
        </div>
        <div className="form-buttons">
          <button type="button" onClick={() => dispatch(toggleLogin(false))}>
            Close
          </button>
          <button type="submit">Login Now</button>
        </div>
        <br />
        <br />
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
