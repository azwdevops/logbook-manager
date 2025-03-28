// material ui items
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";

const CustomModal = (props) => {
  const loading = useSelector((state) => state?.shared?.loading);
  return (
    <Dialog
      open={props?.isOpen}
      maxWidth="lg"
      style={{
        maxWidth: props?.maxWidth,
        margin: "auto",
        maxHeight: props?.maxHeight,
      }}
      fullScreen
      hideBackdrop
      disableEnforceFocus
      disableBackdropClick
      PaperProps={{
        style: {
          boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px",
          backgroundColor: "#dfe4f0",
          borderRadius: "10px",
        },
      }}
      id={loading && "item-loading"}
    >
      {props?.children}
      {loading && <CircularProgress style={{ position: "absolute", marginLeft: "45%", marginTop: "25%" }} />}
    </Dialog>
  );
};

export default CustomModal;
