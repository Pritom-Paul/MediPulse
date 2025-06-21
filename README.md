# MediPlus – Patient Record Management App

MediPlus is a web app for doctors to securely manage patient records, upload documents like receipts and X-rays, and track medical history with ease.

## 🔑 Features

- Doctor login (admin-only access)
- Create, update, delete, and search patient records
- Upload & manage receipts/X-rays with categorization
- View patient history & add notes
- Secure file storage with basic encryption

## 🛠 Tech Stack

- **Frontend:** React  
- **Backend:** Node.js (Express)  
- **Database:** PostgreSQL

## 🧩 Key Screens

- Login Page  
- Patient Dashboard (with search)  
- Profile Page (details, notes, uploads)  
- File Manager (download/delete/categorize)

## 📁 Data Models

### Patient
- `id`, `name`, `dob`, `unique_id`, `hospital_tags`, `notes`

### Record
- `id`, `patient_id`, `file_url`, `issue_date`, `file_type`, `category`

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/mediplus.git
