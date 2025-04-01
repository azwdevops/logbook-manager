import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const AddCarrier = (props) => {
  const { openAddCarrier, setOpenAddCarrier, setCarriersList, carriersList } = props;

  const dispatch = useDispatch();

  const [carrierData, setCarrierData] = useState({
    name: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setCarrierData({ ...carrierData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (carrierData?.password?.trim() !== carrierData?.confirm_password?.trim()) {
      return alert("Password and confirm password should be the same");
    }
    dispatch(toggleLoading(true));
    await API.post(`/logbook/maintain-carriers/`, carrierData)
      .then((res) => {
        setCarriersList([...carriersList, res.data.new_carrier_data]);
        setCarrierData({
          name: "",
          email: "",
          first_name: "",
          last_name: "",
          password: "",
          confirm_password: "",
        });
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
  };

  return (
    <CustomModal isOpen={openAddCarrier} maxWidth="800px" maxHeight="350px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Add New Carrier and Carrier Admin Details</h3>
        <div className="dialog-row">
          <span>
            <label htmlFor="">Carrier Name</label>
            <input type="text" name="name" onChange={handleChange} value={carrierData?.name} required />
          </span>
          <span>
            <label htmlFor="">Email</label>
            <input type="email" name="email" onChange={handleChange} value={carrierData?.email} required />
          </span>
        </div>
        <div className="dialog-row">
          <span>
            <label htmlFor="">First Name</label>
            <input type="text" name="first_name" onChange={handleChange} value={carrierData?.first_name} required />
          </span>
          <span>
            <label htmlFor="">Last Name</label>
            <input type="text" name="last_name" onChange={handleChange} value={carrierData?.last_name} required />
          </span>
        </div>
        <div className="dialog-row">
          <span>
            <label htmlFor="">Password</label>
            <input type="password" name="password" onChange={handleChange} value={carrierData?.password} required />
          </span>
          <span>
            <label htmlFor="">Confirm Password</label>
            <input type="password" name="confirm_password" onChange={handleChange} value={carrierData?.confirm_password} required />
          </span>
        </div>
        <div className="form-buttons">
          <button type="button" onClick={() => setOpenAddCarrier(false)}>
            Close
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddCarrier;
