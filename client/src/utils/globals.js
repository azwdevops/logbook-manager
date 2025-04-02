// Exporting an object containing various global configuration settings
export default {
  // Boolean flag indicating whether the app is running in live production environment
  liveProduction: true, // Set to false for development, true for production

  // URL for the production environment (used when liveProduction is true)
  productionHome: "https://logbookmanager.devzask.com",

  // URL for the development environment (used when liveProduction is false)
  devHome: "http://localhost:8000",

  // Group names for user roles in the system
  SYSTEM_ADMIN_GROUP: "System Admin", // Role for system administrators
  CARRIER_ADMIN_GROUP: "Carrier Admin", // Role for carrier administrators
  DRIVER_GROUP: "Driver", // Role for drivers
};
