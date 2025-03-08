import axios from 'axios';

// Create an axios instance
const instance = axios.create({
    baseURL: 'http://localhost:8081/api/v1', 
    headers: {
        'Content-Type': 'application/json',
    },
});

const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token);
        
        instance.defaults.headers['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('authToken');
        
        delete instance.defaults.headers['Authorization'];
    }
};

export { instance, setAuthToken };
