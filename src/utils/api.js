import axios from "axios";

const api = axios.create({
    baseURL : "http://localhost:8080/api",
    headers : {
        "Content-Type" : "application/json",
    },
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response){
            const status = error.response.status;
            
            if(status == 401){
                console.log("Unauthorized - redirecting to login");
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
             if (status === 403) {
        console.log("Forbidden - Access Denied");
      }

      if (status === 500) {
        console.log("Server Error");
      }
        }
        return Promise.reject(error);       
    }
);

export default api;