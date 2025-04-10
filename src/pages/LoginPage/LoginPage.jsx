import React, { useState } from 'react';
import { Checkbox, TextField, Button, Typography, Box, FormControlLabel, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { instance, setAuthToken } from '../../Service/AxiosHolder/AxiosHolder';


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
    const [username, setUserName] = useState('');
    const [tandc, setTandc] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username || !password) {
            errorMessage("Please fill all fields.");
            return;
        }

     

        instance.post('/user/login', {
            username: username,
            password: password
        })
            .then((response) => {
                if (response.data) {
               
                    setAuthToken(response.data);

                    successMessage();
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

    const fetchUserData = async () => {
 
        try {
            const response = await instance.get(`/user/getUser/${username}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            localStorage.setItem("userData", JSON.stringify(response.data));
            
            console.log(response.data.role);
            
            if (response.data.role == "Admin") {
                navigate('/admin/dashboard/users');

            }else if (response.data.role == "Employee"){
                navigate('/error');
            }else if (response.data.role == "Employees"){
                navigate('/employees/dashboard/home');
            }
            else if (response.data.role == "Trainer"){
                navigate('/trainers/dashboard/home');
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            errorMessage("Could not fetch user data. Please try again.");
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
