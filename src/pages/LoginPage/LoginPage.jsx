import React, { useState } from 'react';
import { Checkbox, TextField, Button, Typography, Box, FormControlLabel, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: { default: '#000000' },
        text: { primary: '#ffffff' },
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
    const [tandc, setTandc] = useState(false);
    const [username, setUserName] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password || !username) {
            errorMessage("Please fill all fields.");
            return;
        }

        handleGetUserData();
        const data = { username, password };
        

        try {
            const response = await fetch("http://localhost:8081/api/v1/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                errorMessage(errorText || "Login failed. Please check your credentials.");
                return;
            }

            const result = await response.text();
            if (result) {
                const token = result.trim();
                console.log(token);

                if (token) {
                    localStorage.setItem("token", token);
                    successMessage();

                    
                    
                    // navigate('/admin/dashboard');
                } else {
                    errorMessage("Invalid token received.");
                }
            } else {
                errorMessage("Invalid response format.");
            }
        } catch (error) {
            errorMessage("Server error. Please try again later.");
            console.error("Error:", error);
        }
    };


    const handleGetUserData = async () => {
        try {
            // Get the token from localStorage (assuming it's stored there)
            const token = localStorage.getItem("token");  
            if (!token) {
                errorMessage("No token found. Please log in.");
                return;
            }
    
            // Use the token for authorization
            const response = await fetch("http://localhost:8081/api/v1/user/getUser/"+ username, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                },
            });
    
            // Check for a valid response
            if (!response.ok) {
                const errorText = await response.text(); // Get the error message from the response
                errorMessage(errorText || "Not User! Try again.");
                return;
            }
    
            const result = await response.text();
            if (result) {
                const data = result.trim();
                console.log(data); 
    
                if (data) {
                    localStorage.setItem("data", data); // Store the data in localStorage
                    successMessage(); // Show success message
    
                    // Navigate or take appropriate action after successful response
                    // For example, you can navigate to a dashboard page
                    // navigate('/admin/dashboard');
                } else {
                    errorMessage("Invalid data received.");
                }
            } else {
                errorMessage("Invalid response format.");
            }
        } catch (error) {
            errorMessage("Server error. Please try again later.");
            console.error("Error:", error);
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
                        required
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
