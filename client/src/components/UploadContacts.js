import React, { useState } from 'react';
import { uploadContacts } from '../api/contactsApi';

function UploadContacts({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setErrors([]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    setResult(null);
    setErrors([]);

    try {
      const response = await uploadContacts(file);
      setResult(response.data);
      
      if (response.data.inserted > 0) {
        setTimeout(() => {
          onUploadSuccess();
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
        setResult(error.response.data);
      } else {
        alert(error.response?.data?.error || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Upload Contacts</h5>
        
        <div className="mb-3">
          <input 
            type="file" 
            className="form-control" 
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
          />
          <small className="text-muted">Accepted formats: .xlsx, .xls</small>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        {result && result.inserted > 0 && (
          <div className="alert alert-success mt-3">
            <strong>Success!</strong> {result.inserted} contact{result.inserted > 1 ? 's' : ''} added successfully.
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-3">
            <h6>Validation Errors:</h6>
            <div className="table-responsive" style={{ maxHeight: '300px', overflow: 'auto' }}>
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((err, idx) => (
                    <tr key={idx}>
                      <td>{err.row}</td>
                      <td>{err.data.name}</td>
                      <td>{err.data.email}</td>
                      <td>{err.data.phone}</td>
                      <td className="text-danger">{err.errors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadContacts;