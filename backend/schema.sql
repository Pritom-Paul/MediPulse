-- Create doctors table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE,
    unique_id VARCHAR(100) UNIQUE,
    tags TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('xray', 'prescription')),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
