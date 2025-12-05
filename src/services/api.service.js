import axios from "axios";

const commonConfig = {
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
};

export default (baseURL) => {
    // In development, point directly to backend to avoid proxy issues with large payloads
    const fullURL = import.meta.env.DEV 
        ? `http://localhost:3000${baseURL}`
        : baseURL;
    
    const instance = axios.create({
        baseURL: fullURL,
        ...commonConfig,
    });

    // Add request interceptor to attach JWT token
    instance.interceptors.request.use(
        (config) => {
            // Get token from localStorage
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                if (userData.token) {
                    config.headers.Authorization = `Bearer ${userData.token}`;
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor to handle 401 errors
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('user');
                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};