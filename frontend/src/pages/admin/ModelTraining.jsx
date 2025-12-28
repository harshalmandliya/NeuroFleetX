import React, { useState } from 'react';
import { Upload, FileText, BarChart3 } from 'lucide-react';
import apiClient from '../../api/apiClient';

const ModelTraining = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [metrics, setMetrics] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/admin/model/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(response.data);
      
      // Refresh metrics after training
      try {
        await fetchMetrics();
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    } catch (error) {
      setMessage('Error: ' + (error.response?.data || 'Failed to train model'));
    } finally {
      setUploading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await apiClient.get('/admin/metrics');
      // Ensure we have valid data before setting state
      if (response.data && Array.isArray(response.data)) {
        setMetrics(response.data);
      } else {
        setMetrics([]);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetrics([]); // Set empty array on error
      throw error;
    }
  };

  React.useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Model Training</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload CSV data to retrain the ETA prediction model
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Training Data</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  CSV file with training data
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          {file && (
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm font-medium text-gray-900">{file.name}</span>
              </div>
              <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Training Model...
                </>
              ) : 'Train Model'}
            </button>
          </div>
          
          {message && (
            <div className={`mt-4 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Model Performance Metrics</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          {metrics && metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trained At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      R² Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RMSE
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MAE
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.map((metric, index) => (
                    <tr key={metric.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.trainedAt ? new Date(metric.trainedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(typeof metric.r2 === 'number' ? metric.r2 : 0).toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(typeof metric.rmse === 'number' ? metric.rmse : 0).toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(typeof metric.mae === 'number' ? metric.mae : 0).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Train a model to see performance metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelTraining;