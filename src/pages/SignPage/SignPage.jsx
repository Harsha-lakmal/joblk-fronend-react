import React, { useState } from "react";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx"; 
import {  Checkbox, TextField, Button, Typography, createTheme, ThemeProvider, CssBaseline, Box, FormControlLabel, OutlinedInput,   InputLabel,  MenuItem, FormControl,Select,} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#000000",
        },
        text: {
            primary: "#ffffff",
        },
    },
});

const roles = ["Trainer", "Employees"];

function showSuccessMessage() {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Sign Up Successful",
        showConfirmButton: false,
        timer: 2000,
    });
}

function showErrorMessage(message) {
    Swal.fire({
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 2000,
    });
}

export default function SignPage() {
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [tandc, setTandc] = useState(false);
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const date = new Date();
    const formattedDate = date.toLocaleDateString("si-LK"); 

    const handleSignUp = async (event) => {
        event.preventDefault();

        // Check if all fields are filled
        if (!email || !userName || !password || !confirmPassword || !role) {
            showErrorMessage("Please fill in all fields.");
            return;
        }

        // Check if terms and conditions are accepted
        if (!tandc) {
            showErrorMessage("Please accept the Terms & Conditions.");
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            showErrorMessage("Passwords do not match!");
            return;
        }

        // Create user data object
        const data = {
            username: userName,
            password: password,
            email: email,
            role: role,
            imgPathProfile: "null",
            imgPathCover: "null",
            registerDate: formattedDate
        };

        try {
            const response = await instance.post("/user/register", data);

            if (response.status === 201 || response.status === 200) {
                showSuccessMessage();
                setTimeout(() => navigate("/login"), 2000);
            } else {
                showErrorMessage("Sign Up Failed. Please try again.");
            }
        } catch (error) {
            showErrorMessage(error.response?.data?.message || "Server error. Please try again later.");
            console.error("Error:", error);
        }
    };

    const handleLogin = () => navigate("/login");

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "black",
                    padding: 2,
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSignUp}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: { xs: "85%", sm: "350px" },
                        padding: 3,
                        borderRadius: 2,
                        backgroundColor: "#121212",
                        boxShadow: 3,
                    }}
                >
                    <Typography variant="h5" textAlign="center" fontWeight="bold">
                        Sign Up
                    </Typography>

                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="small"
                        required
                        type="email"
                    />

                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        size="small"
                        required
                    />

                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        size="small"
                        required
                    />

                    <TextField
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        size="small"
                        required
                    />

                    <FormControl fullWidth size="small" required>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            input={<OutlinedInput label="Role" />}
                        >
                            {roles.map((roleOption) => (
                                <MenuItem key={roleOption} value={roleOption}>
                                    {roleOption}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={tandc}
                                onChange={(e) => setTandc(e.target.checked)}
                                color="primary"
                                sx={{ transform: "scale(0.9)" }}
                                required
                            />
                        }
                        label={<Typography variant="body2">I agree with the Terms & Conditions </Typography>}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={!tandc}
                        sx={{ 
                            padding: "8px", 
                            fontSize: "1rem", 
                            height: "45px", 
                            borderRadius: 1,
                            opacity: tandc ? 1 : 0.7
                        }}
                    >
                        Sign Up
                    </Button>

                    <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ padding: "8px", fontSize: "1rem", height: "45px", borderRadius: 1 }}
                        onClick={handleLogin}
                    >
                        Login
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
}