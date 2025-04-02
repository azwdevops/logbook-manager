import CustomModal from "@/components/shared/CustomModal"; // Importing the CustomModal component for displaying modal
import { toggleLoading } from "@/redux/features/sharedSlice"; // Importing Redux action to toggle loading state
import { showError } from "@/utils"; // Importing utility function to display errors
import API from "@/utils/API"; // Importing custom API utility for making requests
import React, { useEffect, useState } from "react"; // Importing React and hooks (useEffect, useState)
import { useDispatch } from "react-redux"; // Importing useDispatch hook to dispatch actions

const EditCarrier = (props) => {
  // Destructuring props passed into the component
  const { openEditCarrier, setOpenEditCarrier, setCarriersList, currentCarrier } = props;

  const dispatch = useDispatch(); // Dispatch function to dispatch actions

  // State for managing carrier data form inputs
  const [carrierData, setCarrierData] = useState({});

  // useEffect hook to update the carrier data when currentCarrier changes
  useEffect(() => {
    setCarrierData({ ...currentCarrier });
  }, [currentCarrier]);

  // Handle input field changes and update carrierData state
  const handleChange = (e) => {
    setCarrierData({ ...carrierData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Start loading
    dispatch(toggleLoading(true));

    // Make API request to update carrier data
    await API.patch(`/logbook/maintain-carriers/`, carrierData)
      .then((res) => {
        // Update the carrier in the carriers list with the updated data
        setCarriersList((prev) =>
          prev?.map((item) => (item?.id === res?.data?.updated_carrier_data?.id ? res?.data?.updated_carrier_data : item))
        );
        // Show success message
        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err)) // Handle errors
      .finally(() => dispatch(toggleLoading(false))); // Stop loading
  };

  return (
    <CustomModal isOpen={openEditCarrier} maxWidth="600px" maxHeight="250px">
      <form className="dialog" onSubmit={handleSubmit}>
        <h3>Edit Carrier and Carrier Admin Email</h3>
        <div className="dialog-row-single-item">
          <label htmlFor="">Carrier Name</label>
          <input type="text" name="name" onChange={handleChange} value={carrierData?.name} required />
        </div>
        <div className="dialog-row-single-item">
          <label htmlFor="">Email</label>
          <input type="email" name="email" onChange={handleChange} value={carrierData?.email} required />
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => setOpenEditCarrier(false)}>
            Close
          </button>
          <button type="submit">Update</button>
        </div>
      </form>
    </CustomModal>
  );
};

export default EditCarrier; // Export the EditCarrier component as default
