import CustomModal from "@/components/shared/CustomModal";
import { toggleLoading } from "@/redux/features/sharedSlice";
import { showError } from "@/utils";
import API from "@/utils/API";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const EditCarrier = (props) => {
  const { openEditCarrier, setOpenEditCarrier, setCarriersList, currentCarrier } = props;

  const dispatch = useDispatch();

  const [carrierData, setCarrierData] = useState({});

  useEffect(() => {
    setCarrierData({ ...currentCarrier });
  }, [currentCarrier]);

  const handleChange = (e) => {
    setCarrierData({ ...carrierData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(toggleLoading(true));
    await API.patch(`/logbook/maintain-carriers/`, carrierData)
      .then((res) => {
        setCarriersList((prev) =>
          prev?.map((item) => (item?.id === res?.data?.updated_carrier_data?.id ? res?.data?.updated_carrier_data : item))
        );

        window.alert(res?.data?.message);
      })
      .catch((err) => showError(err))
      .finally(() => dispatch(toggleLoading(false)));
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

export default EditCarrier;
