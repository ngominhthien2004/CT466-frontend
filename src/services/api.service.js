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
    
    return axios.create({
        baseURL: fullURL,
        ...commonConfig,
    });
};