import axios from 'axios';





const loginApi = axios.create({
    baseURL: 'http://localhost:8081/api/v1/user', 
    headers: {
        'Content-Type': 'application/json',
    },
});

const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token); 
        console.log("save on : "+token);
        
        loginApi.defaults.headers['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('authToken'); 
        delete loginApi.defaults.headers['Authorization'];
    }
};

const userGetData = axios.create({
    baseURL: 'http://localhost:8081/api/v1/user', 
    headers: {
        'Content-Type': 'application/json',
    },
});

userGetData.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken',token);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; //
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



export { loginApi, setAuthToken,userGetData };
