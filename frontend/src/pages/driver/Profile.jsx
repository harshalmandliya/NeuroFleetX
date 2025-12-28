import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Car, IdCard, MapPin, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadDriverProfilePicture } from '../../api/profileService';

const DriverProfile = () => {
  const { user, setUser, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    licenseNumber: '',
    taxiPlate: 'NYC-1234'
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Log user data for debugging
  useEffect(() => {
    console.log('Driver user data updated:', user);
    if (user?.profilePictureUrl) {
      console.log('Driver profile picture URL:', user.profilePictureUrl);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    
    setIsUploading(true);
    try {
      console.log('Starting driver profile picture upload...');
      await uploadDriverProfilePicture(selectedFile);
      console.log('Driver profile picture upload successful');
      
      // Refresh the user profile to get the latest data
      if (refreshUser) {
        console.log('Refreshing driver user data...');
        await refreshUser();
        console.log('Driver user data refreshed');
      }
      
      // Clear the selected file
      setSelectedFile(null);
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture: ' + (error.message || 'Unknown error'));
      
      // Clear preview only on error
      setPreviewImage(null);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update the profile
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Driver Profile</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your driver information and credentials</p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-32 h-32 flex items-center justify-center overflow-hidden">
                    {previewImage || user?.profilePictureUrl ? (
                      <img 
                        src={previewImage || user.profilePictureUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image load error for URL:', previewImage || user.profilePictureUrl);
                          console.log('Image element:', e.target);
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully for URL:', previewImage || user.profilePictureUrl);
                        }}
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer">
                    <Camera className="h-5 w-5 text-gray-600" />
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                {(previewImage || user?.profilePictureUrl) && (
                  <div className="mt-4">
                    <button
                      onClick={handleImageUpload}
                      disabled={isUploading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isUploading ? 'Uploading...' : 'Save Picture'}
                    </button>
                  </div>
                )}
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Driver
                  </span>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 md:pl-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={profileData.firstName}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={profileData.lastName}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={profileData.email}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={profileData.phone}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                        Driver's License Number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="licenseNumber"
                          id="licenseNumber"
                          value={profileData.licenseNumber}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="taxiPlate" className="block text-sm font-medium text-gray-700">
                        Taxi Plate Number
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IdCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="taxiPlate"
                          id="taxiPlate"
                          value={profileData.taxiPlate}
                          onChange={handleChange}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setPreviewImage(null);
                        setSelectedFile(null);
                      }}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">First Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user?.firstName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user?.lastName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">(555) 123-4567</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">123 Main Street, New York, NY 10001</dd>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Driver Information</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Driver's License</dt>
                        <dd className="mt-1 text-sm text-gray-900">DL-789456123</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">License Expiry</dt>
                        <dd className="mt-1 text-sm text-gray-900">Dec 31, 2026</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Taxi Plate</dt>
                        <dd className="mt-1 text-sm text-gray-900">NYC-1234</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Vehicle Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">Electric Sedan</dd>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setEditing(true)}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;