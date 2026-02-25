# Attendance API - Postman Testing Guide

## Sample Data Files Created

### 1. **attendance_sample.json**
Contains sample attendance records with the following fields:
- `politicianId` - MongoDB ObjectId of the politician
- `sessionId` - MongoDB ObjectId of the session  
- `status` - One of: "Present", "Absent", or "Excused"

### 2. **POSTMAN_ATTENDANCE_COLLECTION.json**
Postman collection file with pre-configured requests

---

## How to Use in Postman

### Step 1: Import Collection
1. Open Postman
2. Click **Import** (top left)
3. Select **File** tab
4. Choose `POSTMAN_ATTENDANCE_COLLECTION.json`
5. Click **Import**

### Step 2: Set Up Authorization (JWT Token)
1. Get your JWT token from login endpoint
2. In the collection, click on each request
3. Go to **Headers** tab
4. Replace `YOUR_JWT_TOKEN_HERE` with your actual JWT token

### Step 3: Test POST Request (Record Attendance)

**Endpoint:** `POST /api/attendance/record`

**Sample Request Body:**
```json
{
  "politicianId": "65a4c8f2e3b5f9e0d1c2a3b4",
  "sessionId": "65a4c8f2e3b5f9e0d1c2a3b5",
  "status": "Present"
}
```

**Status Options:**
- `"Present"` - Mark as present
- `"Absent"` - Mark as absent
- `"Excused"` - Mark as excused

**Expected Response (Success):**
```json
{
  "message": "Attendance recorded successfully",
  "record": {
    "_id": "65a4d2f8e3b5f9e0d1c2c3d4",
    "politicianId": "65a4c8f2e3b5f9e0d1c2a3b4",
    "sessionId": "65a4c8f2e3b5f9e0d1c2a3b5",
    "status": "Present",
    "createdAt": "2026-02-20T10:30:00.000Z",
    "updatedAt": "2026-02-20T10:30:00.000Z"
  }
}
```

### Step 4: Test GET Request (Get Attendance by Politician)

**Endpoint:** `GET /api/attendance/{politicianId}`

Replace `{politicianId}` with actual politician ID

**Expected Response (Success):**
```json
{
  "attendancePercentage": "75.00",
  "totalSessions": 4,
  "presentCount": 3,
  "records": [
    {
      "_id": "65a4d2f8e3b5f9e0d1c2c3d4",
      "politicianId": "65a4c8f2e3b5f9e0d1c2a3b4",
      "sessionId": {
        "_id": "65a4c8f2e3b5f9e0d1c2a3b5",
        "title": "Budget Session 2026",
        "date": "2026-02-15T00:00:00.000Z"
      },
      "status": "Present",
      "createdAt": "2026-02-20T10:30:00.000Z"
    }
  ]
}
```

---

## Important Notes

⚠️ **Requirements:**
- Admin authorization required for POST requests (uses `adminOnly` middleware)
- Must be authenticated user (uses `protect` middleware)
- Use valid MongoDB ObjectIds for `politicianId` and `sessionId`

📝 **Replace ObjectIds:**
- `65a4c8f2e3b5f9e0d1c2a3b4` - Sample politician ID (get from your database)
- `65a4c8f2e3b5f9e0d1c2a3b5` - Sample session ID (get from your database)

🔌 **Server URL:** http://localhost:5000 (adjust if different)

---

## Testing Checklist

- [ ] Backend server running on port 5000
- [ ] User authenticated with JWT token
- [ ] User has admin role for POST requests
- [ ] Valid politician ID exists in database
- [ ] Valid session ID exists in database
- [ ] Status is one of: "Present", "Absent", "Excused"
