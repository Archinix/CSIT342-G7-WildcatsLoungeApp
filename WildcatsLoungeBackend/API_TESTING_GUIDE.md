# Wildcats Lounge API Testing Guide

## Base URL
```
http://localhost:8080
```

## 1. Login API
**Endpoint:** `POST /auth/login`
**Purpose:** Authenticate user credentials and get JWT token

### Request Body:
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "CUSTOMER",
    "createdAt": "1710712000000"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600000
}
```

---

## 2. Register API
**Endpoint:** `POST /auth/register`
**Purpose:** Create a new user account

### Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password@123"
}
```

### Expected Response (201 Created):
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "CUSTOMER",
    "createdAt": "1710712000000"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600000
}
```

---

## 3. Profile API (Get)
**Endpoint:** `GET /auth/users/{id}` or `GET /auth/users/email/{email}`
**Purpose:** Retrieve user profile data
**Authentication:** Required (Optional, works without)

### Example URLs:
- `GET http://localhost:8080/auth/users/1`
- `GET http://localhost:8080/auth/users/email/john.doe@example.com`

### Expected Response (200 OK):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "$2a$10$...",
  "id": 1,
  "createdAt": "1710712000000",
  "photoData": null,
  "photoFilename": null,
  "photoMimeType": null
}
```

---

## 4. Edit Profile API
**Endpoint:** `PUT /auth/users/{id}`
**Purpose:** Update user profile details (firstName, lastName)

### Request Body:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "john.doe@example.com",
  "password": "Password@123"
}
```

### Expected Response (200 OK):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "john.doe@example.com",
  "password": "$2a$10$...",
  "id": 1,
  "createdAt": "1710712000000",
  "photoData": null,
  "photoFilename": null,
  "photoMimeType": null
}
```

---

## 5. Edit Password API (NEW)
**Endpoint:** `POST /auth/users/{id}/change-password`
**Purpose:** Change user password with verification of current password

### Request Body:
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@456"
}
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully",
  "user": null,
  "accessToken": null,
  "refreshToken": null,
  "expiresIn": 0
}
```

### Error Response (401 Unauthorized):
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "user": null,
  "accessToken": null,
  "refreshToken": null,
  "expiresIn": 0
}
```

---

## 6. Upload Photo API (NEW)
**Endpoint:** `POST /auth/users/{id}/upload-photo`
**Purpose:** Upload and store user profile photo

### Request:
- **Method:** POST
- **Content-Type:** multipart/form-data
- **File Parameter:** file (single file)
- **Accepted Types:** .jpg, .jpeg, .png
- **Max Size:** 5MB

### Example using cURL:
```bash
curl -X POST http://localhost:8080/auth/users/1/upload-photo \
  -F "file=@/path/to/photo.jpg"
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "user": null,
  "accessToken": null,
  "refreshToken": null,
  "expiresIn": 0
}
```

### Error Responses:
**400 Bad Request - File Size:**
```json
{
  "success": false,
  "message": "File size exceeds 5MB limit",
  "user": null,
  "accessToken": null,
  "refreshToken": null,
  "expiresIn": 0
}
```

**400 Bad Request - File Type:**
```json
{
  "success": false,
  "message": "Only JPG and PNG files are allowed",
  "user": null,
  "accessToken": null,
  "refreshToken": null,
  "expiresIn": 0
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "user": null,
  "accessToken": null,
  "refreshToken": null,
  "expiresIn": 0
}
```

---

## 7. Get User Photo API (NEW)
**Endpoint:** `GET /auth/users/{id}/photo`
**Purpose:** Retrieve user's profile photo

### Example URL:
```
GET http://localhost:8080/auth/users/1/photo
```

### Expected Response (200 OK):
- Returns binary image data (JPEG/PNG)
- Content-Type: image/jpeg

### Error Response (404 Not Found):
```json
{
  "success": false,
  "message": "Photo not found",
  "user": null,
  "accessToken": null,
  "refreshToken": null,
  "expiresIn": 0
}
```

---

## Testing Steps in Postman

### Step 1: Register a New User
1. Method: POST
2. URL: `http://localhost:8080/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@example.com",
  "password": "TestPass@123"
}
```
5. Send and save the user ID from response

### Step 2: Login
1. Method: POST
2. URL: `http://localhost:8080/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "TestPass@123"
}
```
5. Send and save the accessToken

### Step 3: Get Profile
1. Method: GET
2. URL: `http://localhost:8080/auth/users/1`
3. Send

### Step 4: Update Profile
1. Method: PUT
2. URL: `http://localhost:8080/auth/users/1`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "test@example.com",
  "password": "TestPass@123"
}
```
5. Send

### Step 5: Change Password
1. Method: POST
2. URL: `http://localhost:8080/auth/users/1/change-password`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "currentPassword": "TestPass@123",
  "newPassword": "NewPass@456"
}
```
5. Send

### Step 6: Upload Photo
1. Method: POST
2. URL: `http://localhost:8080/auth/users/1/upload-photo`
3. Headers: `Content-Type: multipart/form-data`
4. Body: Form Data
   - Key: `file`
   - Value: Select your photo file (.jpg or .png)
5. Send

### Step 7: Get Photo
1. Method: GET
2. URL: `http://localhost:8080/auth/users/1/photo`
3. Send (should display the image)

---

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*)

## CORS Configuration
- Allowed Origins: `http://localhost:5173`
- Allowed Methods: GET, POST, PUT, DELETE
- Allowed Headers: All

## Database
- Database Type: PostgreSQL
- Host: aws-1-ap-southeast-2.pooler.supabase.com:5432
- Database: postgres
- User: postgres.asgqpleynqepvviditua (from config)

---

## Notes
- All passwords are encrypted with BCrypt
- JWT tokens expire in 1 hour (3600000ms)
- Photos are stored as BLOB/BYTE Array in the database
- Maximum photo size: 5MB
- Accepted photo formats: JPG, PNG
