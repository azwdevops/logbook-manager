import axios from "axios";

import globals from "./globals";

const { liveProduction, productionHome, devHome } = globals;

let mainURL;
if (liveProduction) {
  mainURL = productionHome;
} else {
  mainURL = devHome;
}

const API = axios.create({
  baseURL: `${mainURL}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
});

API.defaults.xsrfHeaderName = "X-CSRFTOKEN";
API.defaults.xsrfCookieName = "csrftoken";

API.interceptors.request.use((req) => {
  req.headers.Accept = "application/json";
  return req;
});

export default API;
