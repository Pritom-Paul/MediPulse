import React, { useState, useEffect } from 'react';

function App() {
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
  
      // Get the filename from the content-disposition header or use a default
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `file-${fileId}`;
  
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
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
      // 1. Verify token first
      const protectedRes = await fetch('http://localhost:5000/api/protected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!protectedRes.ok) {
        throw new Error('Authentication failed');
      }
      
      setMessage('Access granted');
  
      // 2. Fetch patients
      const patientsRes = await fetch('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!patientsRes.ok) throw new Error('Failed to fetch patients');
      
      const patientsData = await patientsRes.json();
      setPatients(patientsData);
      
      // Debug: Log patient IDs
      console.log('Patient IDs:', patientsData.map(p => p.id));
      
      // 3. Fetch files for all patients
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
      
      // 4. Special debug for patient 2
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

  // Helper to format date
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
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 className="text-3xl font-bold underline text-green-500">
      Dental Management System
    </h1>
      {!token ? (
        <form onSubmit={handleLogin}>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={{ marginTop: '1rem' }} type="submit">
            Login
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      ) : (
        <div>
          <p>{message}</p>
          
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <>
              <h2>Patients</h2>
              {patients.length > 0 ? (
                <div>
                  {patients.map(patient => (
                    <div key={patient.id} style={{ 
                      marginBottom: '1.5rem', 
                      padding: '1rem',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      backgroundColor: patient.id === 2 ? '#f8f8ff' : 'white'
                    }}>
                      <h3>{patient.name} {patient.id === 2 && '(DEBUG PATIENT)'}</h3>
                      <p><strong>Patient ID:</strong> {patient.unique_id}</p>
                      <p><strong>DOB:</strong> {patient.dob}</p>
                      <p><strong>Tags:</strong> {patient.tags}</p>
                      <p><strong>Notes:</strong> {patient.notes}</p>
                      
                      <h4 style={{ marginTop: '1rem' }}>Files</h4>
                      {files.filter(f => f.patient_id === patient.id).length > 0 ? (
                        <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                          {files
                            .filter(f => f.patient_id === patient.id)
                            .map(file => (
                              <li key={file.id} style={{ 
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: '#f5f5f5',
                                borderLeft: '4px solid #4CAF50'
                              }}>
                                <div><strong>Type:</strong> {file.file_type}</div>
                                <div><strong>Uploaded:</strong> {formatDate(file.uploaded_at)}</div>
                                <div><strong>File ID:</strong> {file.id}</div>
                                <button 
                                  onClick={() => downloadFile(file.id)}
                                  style={{
                                    marginTop: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Download File
                                </button>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p style={{ color: patient.id === 2 ? 'red' : 'inherit' }}>
                          {patient.id === 2 ? 'DEBUG: No files found for patient 2' : 'No files for this patient'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No patients found</p>
              )}
              
              {/* Debug Information */}
              <div style={{ 
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px'
              }}>
                <h3>Debug Information</h3>
                <p><strong>Total Patients:</strong> {patients.length}</p>
                <p><strong>Total Files:</strong> {files.length}</p>
                <p><strong>Files for Patient 2:</strong> {JSON.stringify(files.filter(f => f.patient_id === 2))}</p>
                <button 
                  onClick={() => fetchProtectedData()}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Reload Data
                </button>
              </div>
            </>
          )}

          <button 
            onClick={logout} 
            style={{ 
              marginTop: '2rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;