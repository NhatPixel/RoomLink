import axios from "axios";

const refreshAxios = axios.create({
    baseURL: "https://roomlink-6im6.onrender.com/api",
    withCredentials: true,
});

export default refreshAxios;
