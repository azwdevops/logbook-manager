// Importing axios for making HTTP requests
import axios from "axios";

// Importing global variables for production and development environment URLs
import globals from "./globals";

// Destructuring to get the URLs for live production and development environments from globals
const { liveProduction, productionHome, devHome } = globals;

// Setting the base URL based on the environment (production or development)
let mainURL;
if (liveProduction) {
  mainURL = productionHome; // Use production URL if in live production
} else {
  mainURL = devHome; // Use development URL otherwise
}

// Creating an axios instance with custom configuration
const API = axios.create({
  baseURL: `${mainURL}/api/v1`, // Setting the base URL for API requests
  withCredentials: true, // Ensuring credentials (like cookies) are sent with requests
  withXSRFToken: true, // Enabling XSRF protection for requests
});

// Setting default values for XSRF token headers
API.defaults.xsrfHeaderName = "X-CSRFTOKEN"; // Name of the header for the XSRF token
API.defaults.xsrfCookieName = "csrftoken"; // Name of the cookie where the XSRF token is stored

// Setting up an interceptor for requests to add common headers
API.interceptors.request.use((req) => {
  req.headers.Accept = "application/json"; // Setting the "Accept" header to indicate JSON responses
  return req; // Returning the modified request object
});

// Exporting the API instance to be used throughout the app for making requests
export default API;
