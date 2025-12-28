import apiClient from './apiClient';

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Uploading profile picture:', file);
  
  try {
    // Let the browser set the Content-Type with proper boundary
    // We don't need to explicitly set headers here
    const response = await apiClient.post('/user/profile/picture', formData);
    console.log('Profile picture upload response:', response);
    
    // Check if response is successful
    if (response.status >= 200 && response.status < 300) {
      console.log('Upload successful, response data:', response.data);
      return response.data;
    } else {
      throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data || `Server error: ${error.response.status} ${error.response.statusText}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Unable to reach server');
    } else {
      // Something else happened
      throw new Error(error.message || 'Failed to upload profile picture');
    }
  }
};

export const uploadDriverProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Uploading driver profile picture:', file);
  
  try {
    // Let the browser set the Content-Type with proper boundary
    // We don't need to explicitly set headers here
    const response = await apiClient.post('/driver/profile/picture', formData);
    console.log('Driver profile picture upload response:', response);
    
    // Check if response is successful
    if (response.status >= 200 && response.status < 300) {
      console.log('Driver upload successful, response data:', response.data);
      return response.data;
    } else {
      throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Driver profile picture upload error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data || `Server error: ${error.response.status} ${error.response.statusText}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Unable to reach server');
    } else {
      // Something else happened
      throw new Error(error.message || 'Failed to upload profile picture');
    }
  }
};