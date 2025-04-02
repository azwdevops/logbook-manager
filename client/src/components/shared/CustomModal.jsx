// Import Material UI components for dialog and progress spinner
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle"; // Dialog title component (not used in this snippet)
import CircularProgress from "@mui/material/CircularProgress"; // Circular progress spinner for loading state
import { useSelector } from "react-redux"; // Hook to access Redux store state

// CustomModal component to display a modal with loading indicator
const CustomModal = (props) => {
  // Accessing the loading state from Redux store
  const loading = useSelector((state) => state?.shared?.loading);

  return (
    // Dialog component from Material UI to display a modal
    <Dialog
      open={props?.isOpen} // Modal visibility controlled by isOpen prop
      maxWidth="lg" // Default max width for the modal
      style={{
        maxWidth: props?.maxWidth, // Custom maxWidth if provided via props
        margin: "auto", // Center the modal horizontally
        maxHeight: props?.maxHeight, // Custom maxHeight if provided via props
      }}
      fullScreen // Make the modal fullscreen on mobile devices
      hideBackdrop // Hide the backdrop behind the modal
      disableEnforceFocus // Allow focus on elements outside of the dialog
      disableBackdropClick // Prevent closing the dialog when clicking the backdrop
      PaperProps={{
        style: {
          boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px", // Custom box shadow for the modal
          backgroundColor: "#dfe4f0", // Light background color for the modal
          borderRadius: "10px", // Rounded corners for the modal
        },
      }}
      id={loading && "item-loading"} // Set an ID for loading state for potential CSS styling
    >
      {/* Render the children passed to the modal */}
      {props?.children}

      {/* Show loading spinner if loading state is true */}
      {loading && <CircularProgress style={{ position: "absolute", marginLeft: "45%", marginTop: "25%" }} />}
    </Dialog>
  );
};

// Export CustomModal component for use in other parts of the application
export default CustomModal;
