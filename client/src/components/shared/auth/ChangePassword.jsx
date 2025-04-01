import API from "@/utils/API";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import CustomModal from "@/components/shared/CustomModal";

const ChangePassword = (props) => {
  const { openChangePassword, setOpenChangePassword } = props;
  const userId = useSelector((state) => state?.auth?.user?.id);
  const dispatch = useDispatch();
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordData?.new_password?.trim() !== passwordData?.confirm_new_password?.trim()) {
      return window.alert("New password and confirm password must be the same");
    }
    dispatch(toggleLoading(true));
    await API.post("/users/change-password/", { ...passwordData, userId })
      .then((res) => {
        localStorage.removeItem("loggedIn");
        window.location.href = "/";
        window.alert(res?.data?.message);
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_new_password: "",
        });
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openChangePassword} maxWidth="500px" maxHeight="400px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Change your password</h3>
        <div className="dialog-row-single-item">
          <label htmlFor="">Old Password</label>
          <input type="password" name="old_password" onChange={handleChange} value={passwordData?.old_password} required />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">New Password</label>
          <input type="password" name="new_password" onChange={handleChange} value={passwordData?.new_password} required />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Confirm New Password</label>
          <input type="password" name="confirm_new_password" onChange={handleChange} value={passwordData?.confirm_new_password} required />
        </div>
        <div className="form-buttons">
          <button type="button" className="" onClick={() => setOpenChangePassword(false)}>
            Close
          </button>
          <button type="submit" className="">
            Submit
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default ChangePassword;
