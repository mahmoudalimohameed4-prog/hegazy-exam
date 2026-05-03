const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Debugging (Remove in final production)
console.log('Current API URL:', API_BASE_URL);

export default API_BASE_URL;
