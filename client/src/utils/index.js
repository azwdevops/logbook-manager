// toggle sidebar on menu button click
const navbarDisplayHelper = () => {
  // const toggle = document.getElementById("header-toggle")
  const bodysection = document.getElementById("body-section");
  // headerpd = document.getElementById("header");

  // show navbar

  // either adds or removes class when showBtn is added and hideBtn is removed, the button is shown and viceversa
  const mobile_menuBtnShow = document.getElementById("mobile-menu-btn-show");
  const mobile_menuBtnHide = document.getElementById("mobile-menu-btn-hide");
  const desktop_menuBtnShow = document.getElementById("desktop-menu-btn-show");
  const desktop_menuBtnHide = document.getElementById("desktop-menu-btn-hide");

  mobile_menuBtnShow.classList.toggle("hide-btn");
  mobile_menuBtnHide.classList.toggle("hide-btn");

  desktop_menuBtnShow.classList.toggle("hide-btn");
  desktop_menuBtnHide.classList.toggle("hide-btn");
  // change icon
  // toggle.classList.toggle("bx-x");

  // add padding to body
  bodysection.classList.toggle("body-section");

  // add padding to header
  //   headerpd.classList.toggle("body-pd");
};

export const showNavbar = () => {
  const mobile_nav = document.getElementById("mobile-nav-bar");
  const desktop_nav = document.getElementById("desktop-nav-bar");
  // show navbar
  mobile_nav.classList.toggle("show");
  desktop_nav.classList.toggle("show");
  navbarDisplayHelper();
};

// hide nav bar when user clicks on any space to hide sidebar
export const hideNavBar = () => {
  const mobile_nav = document.getElementById("mobile-nav-bar");
  if (mobile_nav.classList.contains("show")) {
    mobile_nav.classList.remove("show");
    navbarDisplayHelper();
  }
};

export const showError = (err) => {
  if (err.response?.status === 400) {
    // we confirm if error is available, if so show it
    if (err?.response?.data?.message) {
      if (
        err?.response?.data?.message === "Refresh token not found in cookies" ||
        err?.response?.data?.message === "Token refresh failed"
      ) {
        localStorage.removeItem("persist:root");
        localStorage.removeItem("access_token");
      } else {
        window.alert(err?.response?.data?.message);
      }
    } else {
      // here we assume if error is not available in if above, we assume it's a serializer error and then show it as below
      // this may change if more information comes up on how to handle this
      window.alert(Object.values(err.response?.data)[0][0]);
    }
  } else if (err?.response?.status === 401) {
    if (err?.response?.data?.message === "Given token not valid for any token type") {
      // we reload window to ensure user is logged out
      localStorage.removeItem("access_token");
      window.location.href = "/";
    } else {
      window.alert(err?.response?.data?.message);
    }
  }
};
