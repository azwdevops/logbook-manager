import { StrictMode } from "react"; // Importing StrictMode to enable additional checks and warnings in development
import { createRoot } from "react-dom/client"; // Importing createRoot to render the React app into the DOM
import "./index.css"; // Importing global CSS for the app
import App from "./App.jsx"; // Importing the main App component
import { store } from "@/redux/app/store"; // Importing the Redux store for state management
import { BrowserRouter as Router } from "react-router-dom"; // Importing BrowserRouter to handle routing in the app
import { Provider } from "react-redux"; // Importing Provider to make Redux store available to the app

// Rendering the app inside the root element
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {" "}
    {/* Wrapping the app in StrictMode for development checks */}
    <Provider store={store}>
      {" "}
      {/* Providing the Redux store to the entire app */}
      <Router>
        {" "}
        {/* Wrapping the app in Router for routing functionality */}
        <App /> {/* Rendering the App component */}
      </Router>
    </Provider>
  </StrictMode>
);
