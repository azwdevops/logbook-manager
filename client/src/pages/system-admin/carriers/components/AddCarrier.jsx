import CustomModal from "@/components/shared/CustomModal"; // Importing the CustomModal component for displaying modal
import { toggleLoading } from "@/redux/features/sharedSlice"; // Importing Redux action to toggle loading state
import { showError } from "@/utils"; // Importing utility function to display errors
import API from "@/utils/API"; // Importing custom API utility for making requests
import React, { useState } from "react"; // Importing React and useState hook for managing component state
import { useDispatch } from "react-redux"; // Importing useDispatch hook to dispatch actions

const AddCarrier = (props) => {
  // Destructuring props passed into the component
  const { openAddCarrier, setOpenAddCarrier, setCarriersList, carriersList } = props;

  const dispatch = useDispatch(); // Dispatch function to dispatch actions

  // State for managing carrier data inputs
  const [carrierData, setCarrierData] = useState({
    name: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  // Handle input field changes and update carrierData state
  const handleChange = (e) => {
    setCarrierData({ ...carrierData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check if password and confirm password match
    if (carrierData?.password?.trim() !== carrierData?.confirm_password?.trim()) {
      return alert("Password and confirm password should be the same");
    }

    // Start loading
    dispatch(toggleLoading(true));

    // Make API request to add a new carrier
    await API.post(`/logbook/maintain-carriers/`, carrierData)
      .then((res) => {
        // On success, add the new carrier to the list
        setCarriersList([...carriersList, res.data.new_carrier_data]);
        // Reset the carrierData state
        setCarrierData({
          name: "",
          email: "",
          first_name: "",
          last_name: "",
          password: "",
          confirm_password: "",
        });
        // Show success message
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err)) // Handle errors
      .finally(() => dispatch(toggleLoading(false))); // Stop loading
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

export default AddCarrier; // Export the AddCarrier component as default
