import React, { useState } from "react";
import {
    Checkbox,
    TextField,
    Button,
    Typography,
    createTheme,
    ThemeProvider,
    CssBaseline,
    Box,
    FormControlLabel,
    OutlinedInput,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'


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

const roles = ["Employee", "Trainer"];


function succes() {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Your Sign Successful",
        showConfirmButton: false,
        timer: 2000
    });
}

function error() {
    Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Your Sign UnSuccessful",
        showConfirmButton: false,
        timer: 2000
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


    const handleSignUp = (event) => {
        event.preventDefault();

        if (!email || !userName || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            error();
            return;
        }

        if (password !== confirmPassword) {
            error();
            alert("Passwords do not match!");
            return;
        }

        if (!role) {
            error();
            alert("Please select a role.");
            return;
        }
        succes();

        alert(
            `Sign Up Successful!\n\nEmail: ${email}\nUsername: ${userName}\nRole: ${role}\nT&C Accepted: ${tandc}`
        );

        console.log("Email:", email);
        console.log("Username:", userName);
        console.log("Password:", password);
        console.log("Role:", role);
        console.log("T&C Accepted:", tandc);
    };

    const handleLogin = () => {
        console.log("Redirecting to login...");
        navigate('/signup');

    };

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

                    <FormControl fullWidth size="small">
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
                            />
                        }
                        label={<Typography variant="body2">I agree with the Terms & Conditions</Typography>}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ padding: "8px", fontSize: "1rem", height: "45px", borderRadius: 1 }}
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