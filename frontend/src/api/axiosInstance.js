import axios from "axios";

const instance = axios.create({
  //baseURL: 'http://localhost:5000/api', //this is the local url
  baseURL: "https://tutorfinder-dk85.onrender.com/api", // this is the cloud api url
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
