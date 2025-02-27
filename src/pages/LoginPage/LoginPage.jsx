import React, { useState } from 'react';
import { Checkbox, TextField, Button, Typography, Box, FormControlLabel, Select, MenuItem, InputLabel, FormControl, OutlinedInput, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import TrainersAbout from '../TrainersPage/TrainersAbout/TrainersAbout';
import TrainersCourse from '../TrainersPage/TrainersCourse/TrainersCourse';
import TrainersDashboard from '../TrainersPage/TrainersDashboard/TrainersDashboard';
import TrainersJobPage from '../TrainersPage/TrainersJobPage/TrainersJobPage';

import EmployeeAbout from '../EmployeePage/EmployeeAbout/EmployeeAbout';
import EmployeeCourse from '../EmployeePage/EmployeeCourse/EmployeeCourse';
import EmployeeDashboard from '../EmployeePage/EmployeeDashboard/EmployeeDashboard';
import EmployeeJobPage from '../EmployeePage/EmployeeJobPage/EmployeeJobPage';

import EmployeesAbout from '../EmployeesPage/EmployeesAbout/EmployeesAbout';
import EmployeesCourse from '../EmployeesPage/EmployeesCourse/EmployeesCourse';
import EmployeesDashboard from '../EmployeesPage/EmployeesDashboard/EmployeesDashboard';
import EmployeesJobPage from '../EmployeesPage/EmployeesJobPage/EmployeesJobPage';

import AdminCoursePage from '../AdminPage/AdminCoursePage/AdminCoursePage';
import AdminJobPage from '../AdminPage/AdminJobPage/AdminJobPage';
import AdminUserPage from '../AdminPage/AdminUserPage/AdminUserPage';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: { default: '#000000' },
        text: { primary: '#ffffff' },
    },
});

function succes() {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Your Login Successful",
        showConfirmButton: false,
        timer: 2000,
    });
}

function error() {
    Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Your Login Unsuccessful",
        showConfirmButton: false,
        timer: 2000,
    });
}

const roles = ['Employee', 'Trainer', 'Employees', 'Admin'];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [tandc, setTandc] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        // Here you should perform the validation for the login
        if (!email || !password) {
            error();
            return;
        }

        // Call the success alert
        succes();

        // Based on role, navigate to the relevant route
        if (role === 'Admin') {
            navigate('/admin/dashboard');
        } else if (role === 'Employee') {
            navigate('/employees/dashboard');
        } else if (role === 'Employees') {
            navigate('/employees/dashboard');
        } else if (role === 'Trainer') {
            navigate('/trainers/dashboard');
        }
    };

    const handleSignUp = () => {
        console.log('Sign Up button clicked');
        navigate('/sign');
    };

    return (
        <div>
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
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                input={<OutlinedInput label="Role" />}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role} value={role}>{role}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={<Checkbox checked={tandc} onChange={(e) => setTandc(e.target.checked)} />}
                            label={<Typography>I agree to the Terms & Conditions</Typography>}
                        />

                        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
                            Login
                        </Button>

                        <Button variant="outlined" color="primary" fullWidth onClick={handleSignUp}>
                            Sign Up
                        </Button>
                    </Box>
                </Box>
            </ThemeProvider>
        </div>
    );
}
