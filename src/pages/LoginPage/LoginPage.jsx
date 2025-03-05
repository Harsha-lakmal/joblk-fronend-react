import React, { useState } from 'react';
import { Checkbox, TextField, Button, Typography, Box, FormControlLabel, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginApi, setAuthToken } from '../../Service/Axios';
import axios from 'axios';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: { default: '#000000' },
        text: { primary: '#ffffff' },
    },
});

// Define userGetData instance
const userGetData = axios.create({
    baseURL: 'http://localhost:8081/api/v1/user',  // Your user API endpoint
    headers: {
        'Content-Type': 'application/json',
    },
});

function successMessage() {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Login Successful",
        showConfirmButton: false,
        timer: 2000,
    });
}

function errorMessage(msg) {
    Swal.fire({
        position: "top-end",
        icon: "error",
        title: msg || "Login Unsuccessful",
        showConfirmButton: false,
        timer: 2000,
    });
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUserName] = useState('');
    const [tandc, setTandc] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username || !password) {
            errorMessage("Please fill all fields.");
            return;
        }

        // Validate email format (Optional if email used)
        // const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // if (email && !emailPattern.test(email)) {
        //     errorMessage("Please enter a valid email.");
        //     return;
        // }

        // Using then and catch for handling the Promise
        loginApi.post('/login', {
            username: username,
            password: password
        })
            .then((response) => {
                if (response.data) {
                    // Token save
                    localStorage.setItem('authToken', response.data.token);  // Save the token
                    setAuthToken(response.data);  // Set token to axios headers

                    successMessage();
                    getToken();
                    fetchUserData();
                } else {
                    errorMessage(response.data.message || "Login failed!");
                }
            })
            .catch((error) => {
                console.error("Login error:", error);
                errorMessage(error.response?.data?.message || "An error occurred. Try again.");
            });
    };

    // Retrieve token from localStorage
    function getToken() {
        const userdata = localStorage.getItem('authToken');
        console.log(userdata);  
        
    }

    const fetchUserData = async () => {
        try {
            const response = await userGetData.get(`/getUser/${username}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            console.log(response);
            return response.data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    };

    const handleSignUp = () => {
        navigate('/sign');
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'black',
                    p: 2,
                }}
            >
                <Box
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        width: { xs: '90%', sm: '350px' },
                        p: 4,
                        borderRadius: 3,
                        backgroundColor: '#121212',
                        boxShadow: 5,
                    }}
                >
                    <Typography variant="h4" textAlign="center" fontWeight="bold">
                        Login
                    </Typography>

                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <FormControlLabel
                        control={<Checkbox checked={tandc} onChange={(e) => setTandc(e.target.checked)} />}
                        label={<Typography>I agree to the Terms & Conditions</Typography>}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleLogin}
                        disabled={!tandc}
                    >
                        Login
                    </Button>

                    <Button variant="outlined" color="primary" fullWidth onClick={handleSignUp}>
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
