import React, { useState, useEffect } from 'react';
import { instance } from '../../Service/AxiosHolder/AxiosHolder';
import Swal from 'sweetalert2';

function AdminUserController() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [userToUpdate, setUserToUpdate] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const token = localStorage.getItem('authToken');
    const [lastFetchedData, setLastFetchedData] = useState([]);

    function successMessage() {
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Successful",
            showConfirmButton: false,
            timer: 2000,
        });
    }

    function errorMessage(msg) {
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: msg || "Unsuccessful",
            showConfirmButton: false,
            timer: 2000,
        });
    }

    useEffect(() => {
        getData();
        const interval = setInterval(() => {
            checkForChanges();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    function getData() {
        setLoading(true);
        instance.get('/user/getAllUsers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setUsers(response.data);
            setLastFetchedData(response.data);
            setLoading(false);
        })
        .catch(error => {
            setError("Failed to load users.");
            setLoading(false);
        });
    }

    function checkForChanges() {
        instance.get('/user/getAllUsers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (JSON.stringify(response.data) !== JSON.stringify(lastFetchedData)) {
                setUsers(response.data);
                setLastFetchedData(response.data); 
            }
        })
        .catch(error => {
            setError("Failed to load users.");
        });
    }

    const handleDelete = (id) => {
        instance.delete(`/user/delete/user/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            successMessage();
            getData();
        })
        .catch(err => {
            errorMessage();
        });
    };

    const handleUpdate = (user) => {
        setUserToUpdate(user);
        setUsername(user.username);
        setEmail(user.email);
        setPassword('update');  
        setRole(user.role);
        setModalOpen(true);
    };

    const handleSubmitUpdate = (e) => {
        e.preventDefault();

        const updatedUser = { 
            id: userToUpdate.id,  
            username,
            email,
            password,
            role 
        };

        instance.put(`/user/updateUser`, updatedUser, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            successMessage();
            getData(); 
            setModalOpen(false);
        })
        .catch(err => {
            errorMessage("Failed to update user.");
        });
    };

    const handleResetPassword = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to reset the password for this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, reset it!',
            cancelButtonText: 'No, cancel!'
        }).then((result) => {
            if (result.isConfirmed) {
                instance.post(`/user/reset-password/${id}`, null, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(() => {
                    successMessage();
                })
                .catch((err) => {
                    errorMessage("Failed to reset password.");
                });
            }
        });
    };

    return (
        <div className="overflow-x-auto">
            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            {/* <button 
                onClick={() => getData()}  // Fetch data when clicked
                className="mb-4 bg-green-500 text-white py-2 px-4 rounded"
            >
                Refresh Data
            </button> */}

            <table className="min-w-full table-auto border-collapse">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-2 px-4 text-left">Username</th>
                        <th className="py-2 px-4 text-left">Email</th>
                        <th className="py-2 px-4 text-left">Role</th>
                        <th className="py-2 px-4 text-left">Password</th> 
                        <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b">
                            <td className="py-2 px-4">{user.username}</td>
                            <td className="py-2 px-4">{user.email}</td>
                            <td className="py-2 px-4">{user.role}</td>
                            <td className="py-2 px-4">
                                <span>••••••</span>
                                <button
                                    onClick={() => handleResetPassword(user.id)}
                                    className="ml-2 text-blue-500"
                                >
                                    Reset Password
                                </button>
                            </td>
                            <td className="py-2 px-4">
                                <button
                                    onClick={() => handleUpdate(user)}
                                    className="bg-yellow-500 text-white py-1 px-4 rounded mr-2"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-500 text-white py-1 px-4 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-2xl font-bold mb-4">Update User</h2>
                        <form onSubmit={handleSubmitUpdate}>
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-medium">Username</label>
                                <input 
                                    type="text" 
                                    id="username" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="role" className="block text-sm font-medium">Role</label>
                                <select 
                                    id="role" 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Trainer">Trainer</option>
                                    <option value="Employee">Employees</option>
                                </select>
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setModalOpen(false)} 
                                    className="mr-2 bg-gray-500 text-white py-1 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-500 text-white py-1 px-4 rounded"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUserController;
