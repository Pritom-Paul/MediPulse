import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: username.trim(),
          password: password.trim()
        })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setMessage('Login successful!');
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  const downloadFile = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
  
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `file-${fileId}`;
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download file');
    }
  };

  const fetchProtectedData = async () => {
    setLoading(true);
    setError('');
    try {
      const protectedRes = await fetch('http://localhost:5000/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!protectedRes.ok) {
        throw new Error('Authentication failed');
      }
      
      setMessage('Access granted');
  
      const patientsRes = await fetch('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!patientsRes.ok) throw new Error('Failed to fetch patients');
      
      const patientsData = await patientsRes.json();
      setPatients(patientsData);
      
      console.log('Patient IDs:', patientsData.map(p => p.id));
      
      const filesData = [];
      for (const patient of patientsData) {
        try {
          console.log(`Fetching files for patient ${patient.id}...`);
          const filesRes = await fetch(
            `http://localhost:5000/api/files/list/${patient.id}`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (!filesRes.ok) {
            console.warn(`Failed to fetch files for patient ${patient.id}:`, filesRes.status);
            continue;
          }
          
          const patientFiles = await filesRes.json();
          console.log(`Files for patient ${patient.id}:`, patientFiles);
          filesData.push(...patientFiles.map(f => ({ ...f, patient_id: patient.id })));
        } catch (err) {
          console.error(`Error fetching files for patient ${patient.id}:`, err);
        }
      }
      
      setFiles(filesData);
      console.log('All files:', filesData);
      
      if (patientsData.some(p => p.id === 2)) {
        console.log('Running special debug for patient 2...');
        const debugRes = await fetch('http://localhost:5000/api/files/list/2', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const debugData = await debugRes.json();
        console.log('Direct fetch for patient 2 files:', debugData);
      }
      
    } catch (err) {
      console.error('Main fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProtectedData();
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setMessage('');
    setPatients([]);
    setFiles([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app-container">
      <h1 className="text-3xl font-bold underline text-green-500">
        Dental Management System
      </h1>
      
      {!token ? (
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      ) : (
        <div className="dashboard">
          {message && <p className="success-message">{message}</p>}
          
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <>
              <h2>Patients</h2>
              {patients.length > 0 ? (
                <div className="patients-list">
                  {patients.map(patient => (
                    <div 
                      key={patient.id} 
                      className={`patient-card ${patient.id === 2 ? 'debug-patient' : ''}`}
                    >
                      <h3>{patient.name} {patient.id === 2 && '(DEBUG PATIENT)'}</h3>
                      <p><strong>Patient ID:</strong> {patient.unique_id}</p>
                      <p><strong>DOB:</strong> {patient.dob}</p>
                      <p><strong>Tags:</strong> {patient.tags}</p>
                      <p><strong>Notes:</strong> {patient.notes}</p>
                      
                      <h4>Files</h4>
                      {files.filter(f => f.patient_id === patient.id).length > 0 ? (
                        <ul className="files-list">
                          {files
                            .filter(f => f.patient_id === patient.id)
                            .map(file => (
                              <li key={file.id} className="file-item">
                                <div><strong>Type:</strong> {file.file_type}</div>
                                <div><strong>Uploaded:</strong> {formatDate(file.uploaded_at)}</div>
                                <div><strong>File ID:</strong> {file.id}</div>
                                <button 
                                  onClick={() => downloadFile(file.id)}
                                  className="download-button"
                                >
                                  Download File
                                </button>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className={patient.id === 2 ? 'debug-no-files' : 'no-files'}>
                          {patient.id === 2 ? 'DEBUG: No files found for patient 2' : 'No files for this patient'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No patients found</p>
              )}
              
              <div className="debug-info">
                <h3>Debug Information</h3>
                <p><strong>Total Patients:</strong> {patients.length}</p>
                <p><strong>Total Files:</strong> {files.length}</p>
                <p><strong>Files for Patient 2:</strong> {JSON.stringify(files.filter(f => f.patient_id === 2))}</p>
                <button 
                  onClick={() => fetchProtectedData()}
                  className="reload-button"
                >
                  Reload Data
                </button>
              </div>
            </>
          )}

          <button onClick={logout} className="logout-button underline text-red-500">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default App;