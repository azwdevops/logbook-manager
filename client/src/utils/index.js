// Helper function to toggle the sidebar and button states when the menu button is clicked
const navbarDisplayHelper = () => {
  // Get the body section element
  const bodysection = document.getElementById("body-section");

  // Get the show and hide buttons for mobile and desktop menu
  const mobile_menuBtnShow = document.getElementById("mobile-menu-btn-show");
  const mobile_menuBtnHide = document.getElementById("mobile-menu-btn-hide");
  const desktop_menuBtnShow = document.getElementById("desktop-menu-btn-show");
  const desktop_menuBtnHide = document.getElementById("desktop-menu-btn-hide");

  // Toggle the visibility of the buttons by adding/removing 'hide-btn' class
  mobile_menuBtnShow.classList.toggle("hide-btn");
  mobile_menuBtnHide.classList.toggle("hide-btn");
  desktop_menuBtnShow.classList.toggle("hide-btn");
  desktop_menuBtnHide.classList.toggle("hide-btn");

  // Toggle padding for the body section to adjust layout for the sidebar
  bodysection.classList.toggle("body-section");

  // Padding adjustment for header is commented out
  // headerpd.classList.toggle("body-pd");
};

// Function to show the navbar by toggling visibility for both mobile and desktop nav
export const showNavbar = () => {
  // Get mobile and desktop nav bar elements
  const mobile_nav = document.getElementById("mobile-nav-bar");
  const desktop_nav = document.getElementById("desktop-nav-bar");

  // Show navbar by toggling the 'show' class
  mobile_nav.classList.toggle("show");
  desktop_nav.classList.toggle("show");

  // Call helper function to toggle button visibility and body padding
  navbarDisplayHelper();
};

// Function to hide the navbar when the user clicks outside of the sidebar
export const hideNavBar = () => {
  // Get mobile nav bar element
  const mobile_nav = document.getElementById("mobile-nav-bar");

  // If mobile nav is shown, hide it and adjust other elements accordingly
  if (mobile_nav.classList.contains("show")) {
    mobile_nav.classList.remove("show");
    navbarDisplayHelper(); // Call helper to reset other UI changes
  }
};

// Function to handle API errors and show relevant messages to the user
export const showError = (err) => {
  // Check if the error status is 400 (Bad Request)
  if (err.response?.status === 400) {
    // If error message is available in response, show it to the user
    if (err?.response?.data?.message) {
      if (
        err?.response?.data?.message === "Refresh token not found in cookies" ||
        err?.response?.data?.message === "Token refresh failed"
      ) {
        // Clear authentication data from localStorage if token issues occur
        localStorage.removeItem("persist:root");
        localStorage.removeItem("access_token");
      } else {
        // Show the error message in an alert dialog
        window.alert(err?.response?.data?.message);
      }
    } else {
      // If no error message is available, show serializer error (fallback)
      window.alert(Object.values(err.response?.data)[0][0]);
    }
  } else if (err?.response?.status === 401) {
    // Handle 401 Unauthorized errors
    if (err?.response?.data?.message === "Given token not valid for any token type") {
      // If the token is invalid, remove token and reload page
      localStorage.removeItem("access_token");
      window.location.href = "/";
    } else {
      // Show the error message for other 401 issues
      window.alert(err?.response?.data?.message);
    }
  }
};

// Function to fetch location name based on latitude and longitude using reverse geocoding
export const fetchLocationName = async (lat, lng) => {
  try {
    // Perform reverse geocoding using OpenStreetMap API
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();

    // Return the location name if found, otherwise return 'Unknown Location'
    return data.display_name || "Unknown Location";
  } catch (error) {
    // If reverse geocoding fails, log the error and return 'Unknown Location'
    console.error("Reverse geocoding failed:", error);
    return "Unknown Location";
  }
};
