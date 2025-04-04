import React, { useState, useEffect } from 'react';
import { instance } from '../../Service/AxiosHolder/AxiosHolder';
import Swal from 'sweetalert2';
import { Edit, Trash2, X, Plus, CircleUserRound, KeyRound, RefreshCw, Loader2 } from 'lucide-react';

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
            errorMessage("Failed to load users.");
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
            errorMessage("Failed to load users.");
        });
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
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
                    errorMessage("Failed to delete user.");
                });
            }
        });
    };

    const handleUpdate = (user) => {
        setUserToUpdate(user);
        setUsername(user.username);
        setEmail(user.email);
        setPassword('');  
        setRole(user.role);
        setModalOpen(true);
    };

    const handleSubmitUpdate = (e) => {
        e.preventDefault();

        const updatedUser = { 
            id: userToUpdate.id,  
            username,
            email,
            password: password || undefined, // Only send password if it's changed
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
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
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
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 mx-4 my-6">
       
            
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-lg">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl shadow-lg">
                    <table className="min-w-full bg-white dark:bg-gray-700">
                        <thead className="bg-gray-800 dark:bg-gray-900 text-white">
                            <tr>
                                <th className="py-4 px-6 text-left font-semibold text-lg">Username</th>
                                <th className="py-4 px-6 text-left font-semibold text-lg">Email</th>
                                <th className="py-4 px-6 text-left font-semibold text-lg">Role</th>
                                <th className="py-4 px-6 text-left font-semibold text-lg">Password</th>
                                <th className="py-4 px-6 text-left font-semibold text-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                    <td className="py-4 px-6 text-lg">{user.username}</td>
                                    <td className="py-4 px-6 text-lg">{user.email}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                            user.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                            user.role === 'Trainer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            <KeyRound className="text-gray-500 dark:text-gray-400 mr-3" size={20} />
                                            <span className="text-gray-500 dark:text-gray-400 mr-3 text-lg">••••••</span>
                                            <button
                                                onClick={() => handleResetPassword(user.id)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-lg font-medium flex items-center"
                                            >
                                                <RefreshCw className="mr-2" size={18} />
                                                Reset
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => handleUpdate(user)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-lg font-medium transition-colors flex items-center"
                                            >
                                                <Edit className="mr-2" size={18} />
                                      
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-lg font-medium transition-colors flex items-center"
                                            >
                                                <Trash2 className="mr-2" size={18} />
                                        
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Keep the modal code exactly the same as before */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl"> {/* Increased max-width */}
                        <div className="p-8"> {/* Increased padding */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                                    <Edit className="mr-3" size={24} />
                                    {userToUpdate ? 'Update User' : 'Create User'}
                                </h2>
                                <button 
                                    onClick={() => setModalOpen(false)} 
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitUpdate}>
                                <div className="mb-6"> {/* Increased margin-bottom */}
                                    <label htmlFor="username" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Username
                                    </label>
                                    <input 
                                        type="text" 
                                        id="username" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                        className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        required 
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        required 
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            id="password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Leave blank to keep current"
                                        />
                                        <KeyRound className="absolute right-4 top-3.5 text-gray-400 dark:text-gray-500" size={22} />
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <label htmlFor="role" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Role
                                    </label>
                                    <select 
                                        id="role" 
                                        value={role} 
                                        onChange={(e) => setRole(e.target.value)} 
                                        className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Employee">Employee</option>
                                        <option value="Trainer">Trainer</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setModalOpen(false)} 
                                        className="px-6 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                    >
                                        <X className="mr-2" size={20} />
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-3 text-lg bg-blue-600 border border-transparent rounded-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                    >
                                        <Edit className="mr-2" size={20} />
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUserController;