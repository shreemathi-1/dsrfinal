'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a .csv, .xlsx, or .xls file.');
      e.target.value = '';
      return;
    }

    setFile(selectedFile);

    // Validate file contents
    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      
      if (!workbook.SheetNames.length) {
        throw new Error('Excel file appears to be empty');
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!worksheet) {
        throw new Error('Excel sheet appears to be empty');
      }

      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
        blankrows: false
      });

      if (!data || data.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      console.log('File validation successful:', {
        rowCount: data.length,
        firstRow: data[0]
      });

    } catch (error) {
      console.error('File validation error:', error);
      setError(error.message);
      e.target.value = '';
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/complaints/bulk', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Clear form and show success
      setFile(null);
      setError('');
      setUploadProgress(100);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = async () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add headers
      const headers = [
        'S.No.',
        'Acknowledgement No.',
        'State Name',
        'District Name',
        'Police Station',
        'Crime Additional Information',
        'Category',
        'Sub Category',
        'Status',
        'Incident Date',
        'Complaint Date',
        'Last Action Taken on',
        'Fraudulent Amount',
        'Lien Amount',
        'Suspect Name',
        'Suspect Mobile No',
        'Suspect Id No.',
        'Complainant Name',
        'Complainant Address',
        'Complainant Mobile No.',
        'Complainant Email'
      ];

      // Create worksheet with headers
      const ws = XLSX.utils.aoa_to_sheet([headers]);

      // Add sample data row
      const sampleData = headers.map(() => ''); // Empty row
      XLSX.utils.sheet_add_aoa(ws, [sampleData], { origin: -1 });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Template');

      // Save file
      XLSX.writeFile(wb, 'complaint_upload_template.xlsx');
    } catch (error) {
      console.error('Template download error:', error);
      setError('Failed to download template');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Bulk Upload Complaints</h2>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Download the Excel template with all required columns</li>
          <li>• Fill in the complaint data according to the format</li>
          <li>• Upload the completed Excel file</li>
          <li>• System will automatically process and create complaints</li>
        </ul>
      </div>

      {/* Template Download */}
      <div className="mb-6">
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Excel Template
        </button>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Excel File
        </label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {file && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {file.name}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          !file || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
} 