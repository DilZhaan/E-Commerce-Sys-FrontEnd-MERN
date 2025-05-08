import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiDownload, FiUpload, FiPlus, FiSearch, FiFilter, FiChevronLeft } from "react-icons/fi";
import { FaUserCog, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Name validation function - only letters, spaces, and hyphens
const NameValidation = (name) => {
  return /^[A-Za-z\s-]+$/.test(name);
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "Active",
    proPic: null,
    proPicPreview: null
  });
  // Error messages state
  const [errors, setErrors] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const fileInputRef = useRef(null);

  // Get today's date for date validation
  const today = new Date().toISOString().split('T')[0];

  const BACKEND_URL = "http://localhost:4000";
  const API_URL = BACKEND_URL + "/api/users/admin";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`, {
        withCredentials: true
      });
      const formattedUsers = response.data.data.map((user) => ({
        _id: user._id,
        proPic: BACKEND_URL + "/" + user.proPic,
        name: `${user.fName} ${user.lName}`,
        fName: user.fName,
        lName: user.lName,
        address: user.address,
        dob: user.dob,
        role: user.role,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        status: "Active",
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleTemplateDownload = () => {
    const headers =
      "fName,lName,email,role,gender,phone,address,dob,createdAt,updatedAt,status\n";
    const exampleRow =
      "John,Doe,john.doe@example.com,GENERAL,Male,1234567890,123 Main St,1990-01-01,2023-01-01,2023-01-01,Active\n";
    const csvContent = headers + exampleRow;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setNewUser(
      user ? { 
        ...user,
        proPic: null, // Don't allow editing profile pic
        proPicPreview: user.proPic // Use current proPic URL for preview
      } : { 
        name: "", 
        email: "", 
        phone: "",
        role: "", 
        status: "Active",
        proPic: null,
        proPicPreview: null
      }
    );
    // Clear any previous errors
    setErrors({
      fName: "",
      lName: "",
      email: "",
      phone: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        withCredentials: true
      });
      fetchUsers();
      if (isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    let isValid = true;
    const newErrors = { ...errors };
    
    // Validate first name
    if (newUser.fName && !NameValidation(newUser.fName)) {
      newErrors.fName = "First name should only contain letters";
      isValid = false;
    } else {
      newErrors.fName = "";
    }
    
    // Validate last name
    if (newUser.lName && !NameValidation(newUser.lName)) {
      newErrors.lName = "Last name should only contain letters";
      isValid = false;
    } else {
      newErrors.lName = "";
    }
    
    // Validate phone number
    if (newUser.phone && newUser.phone.length < 10) {
      newErrors.phone = "Phone number should be 10 digits";
      isValid = false;
    } else {
      newErrors.phone = "";
    }
    
    setErrors(newErrors);
    
    if (!isValid) {
      return;
    }
    
    try {
      // Create FormData to handle multipart/form-data
      const formData = new FormData();
      
      // Add all the user fields to the FormData
      formData.append("fName", newUser.fName || "");
      formData.append("lName", newUser.lName || "");
      formData.append("email", newUser.email || "");
      formData.append("role", newUser.role || "");
      formData.append("gender", newUser.gender || "");
      formData.append("phone", newUser.phone || "");
      formData.append("address", newUser.address || "");
      formData.append("dob", newUser.dob || "");
      formData.append("status", newUser.status || "Active");
      
      // Only add profile picture if it's a new user (not editing) and the profile pic exists
      if (!editingUser && newUser.proPic) {
        // If the proPic is a base64 string, convert it to a blob first
        if (typeof newUser.proPic === 'string' && newUser.proPic.startsWith('data:')) {
          // Convert base64 to blob
          const response = await fetch(newUser.proPic);
          const blob = await response.blob();
          formData.append("proPic", blob, "profile.jpg");
        } else if (newUser.proPic instanceof File) {
          // If it's already a File object
          formData.append("proPic", newUser.proPic);
        }
      }
      
      // Add default password for new users
      if (!editingUser) {
        formData.append("pwd", "defaultPassword123");
      }
      
      // Send the request with FormData
      if (editingUser) {
        await axios.put(`${API_URL}/users/${editingUser._id}`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}/users`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting user:", error);
    }
  };

  const handleCsvImport = async () => {
    if (!fileInputRef.current.files[0]) {
      setImportError("Please select a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target.result;
        const lines = csvData.split("\n").slice(1);
        const newUsers = lines
          .filter((line) => line.trim())
          .map((line) => {
            const [
              fName,
              lName,
              email,
              role,
              gender,
              phone,
              address,
              dob,
              createdAt,
              updatedAt,
              status,
            ] = line.split(",");
            return {
              fName: fName?.trim(),
              lName: lName?.trim(),
              email: email?.trim(),
              role: role?.trim(),
              gender: gender?.trim(),
              phone: phone?.trim(),
              address: address?.trim(),
              dob: dob?.trim(),
              createdAt: createdAt?.trim(),
              updatedAt: updatedAt?.trim(),
              status: status?.trim() || "Active",
            };
          });

        await Promise.all(
          newUsers.map((user) => {
            const formData = new FormData();
            // Add all user fields to FormData
            formData.append("fName", user.fName || "");
            formData.append("lName", user.lName || "");
            formData.append("email", user.email || "");
            formData.append("role", user.role || "");
            formData.append("gender", user.gender || "");
            formData.append("phone", user.phone || "");
            formData.append("address", user.address || "");
            formData.append("dob", user.dob || "");
            formData.append("status", user.status || "Active");
            formData.append("pwd", "defaultPassword123");
            
            return axios.post(`${API_URL}/users`, formData, {
              withCredentials: true,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          })
        );

        fetchUsers();
        setIsImportModalOpen(false);
        alert("CSV import successful");
      } catch (error) {
        console.error("Error importing CSV:", error);
        setImportError("Failed to import CSV file.");
      }
    };
    reader.readAsText(fileInputRef.current.files[0]);
  };

  const handleCsvExport = () => {
    const headers =
      "fName,lName,email,role,gender,phone,address,dob,createdAt,updatedAt,status\n";
    const csvContent =
      headers +
      users
        .map(
          (user) =>
            `${user.fName},${user.lName},${user.email},${user.role},${user.gender},${user.phone || ""},${user.address || ""},${user.dob || ""},${user.createdAt},${user.updatedAt},${user.status}`
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiChevronLeft className="text-2xl text-gray-600" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <FaUserCog className="text-2xl text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage and monitor user accounts</p>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FiUpload className="text-lg" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleCsvExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FiDownload className="text-lg" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleTemplateDownload()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <FiDownload className="text-lg" />
              <span>Template</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiPlus className="text-lg" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
              <FiFilter className="text-lg" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.proPic || "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleRowClick(user)}
                            className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          <button
                            onClick={() => {
                              handleOpenModal(user);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-[36rem] shadow-xl rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center mb-6">
              <img
                src={selectedUser.proPic || "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain"}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-2 border-blue-500 shadow-md"
                onError={(e) => {
                  e.target.src = "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain";
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">First Name</p>
                <p className="font-medium text-gray-800">{selectedUser.fName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Last Name</p>
                <p className="font-medium text-gray-800">{selectedUser.lName}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-800">{selectedUser.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="font-medium text-gray-800">{selectedUser.role}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="font-medium text-gray-800">{selectedUser.gender}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    selectedUser.status === "Active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedUser.status}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                <p className="font-medium text-gray-800">{selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : "-"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="font-medium text-gray-800">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium text-gray-800">{selectedUser.address || "-"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-800">{selectedUser.phone || "-"}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  handleOpenModal(selectedUser);
                  setIsDetailModalOpen(false);
                }}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-[36rem] shadow-xl rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img
                    src={newUser.proPicPreview || "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain"}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-2 border-blue-500 shadow-md"
                    onError={(e) => {
                      e.target.src = "https://th.bing.com/th/id/OIP._oHjxcDbPRe0HSQA1B4SygHaHa?rs=1&pid=ImgDetMain";
                    }}
                  />
                  {!editingUser && (
                    <input
                      type="file"
                      id="proPic"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewUser({ ...newUser, proPic: file });
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewUser(prev => ({ ...prev, proPicPreview: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newUser.fName || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const validValue = value.replace(/[^A-Za-z\s-]/g, '');
                      if (validValue !== value) {
                        setErrors({...errors, fName: "Only letters, spaces, and hyphens allowed"});
                      } else {
                        setErrors({...errors, fName: ""});
                      }
                      setNewUser({ ...newUser, fName: validValue });
                    }}
                    className={`w-full px-3 py-2 border ${errors.fName ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.fName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newUser.lName || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const validValue = value.replace(/[^A-Za-z\s-]/g, '');
                      if (validValue !== value) {
                        setErrors({...errors, lName: "Only letters, spaces, and hyphens allowed"});
                      } else {
                        setErrors({...errors, lName: ""});
                      }
                      setNewUser({ ...newUser, lName: validValue });
                    }}
                    className={`w-full px-3 py-2 border ${errors.lName ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.lName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email || ""}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role || ""}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="GENERAL">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone || ""}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={newUser.gender || ""}
                    onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newUser.dob ? new Date(newUser.dob).toISOString().split("T")[0] : ""}
                    onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max={today}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newUser.status || "Active"}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newUser.address || ""}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-6 border w-[28rem] shadow-xl rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">Import Users from CSV</h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-5">
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with user data. Make sure your CSV follows the correct format.
              </p>
              <button 
                onClick={handleTemplateDownload}
                className="text-sm text-blue-500 hover:text-blue-700 hover:underline font-medium mb-4"
              >
                Download template
              </button>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {importError && (
                <p className="text-red-500 mt-2 text-sm">{importError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCsvImport}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;