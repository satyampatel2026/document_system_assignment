# Student Document Upload & Monitoring System

## 1. Project Overview

This project is a Node.js and Express-based Document Upload & Monitoring System.

The application allows users to:

* Create users
* Upload documents
* Store documents in AWS S3
* Store document metadata in MySQL
* Send SNS email notifications
* Generate S3 presigned URLs
* Monitor application logs using AWS CloudWatch
* Monitor custom CloudWatch metrics
* Trigger CloudWatch alarms for upload failures

---

## 2. Technology Stack

* Node.js
* Express.js
* MySQL
* AWS S3
* AWS SNS
* AWS CloudWatch Logs
* AWS CloudWatch Metrics
* AWS CloudWatch Alarm
* Multer
* Postman
* dotenv

---

## 3. Application Architecture

```text
Client / Postman
       |
       v
Node.js + Express
       |
       +------------> MySQL
       |
       +------------> AWS S3
       |                 |
       |                 v
       |            Document File
       |
       +------------> AWS SNS
       |                 |
       |                 v
       |               Email
       |
       +------------> CloudWatch
                         |
                 +-------+-------+
                 |               |
               Logs           Metrics
                                 |
                                 v
                               Alarm
                                 |
                                 v
                                SNS
                                 |
                                 v
                               Email
```

---

## 4. Project Structure

```text
document-system/
│
├── src/
│   ├── config/
│   │   ├── aws.config.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── user.controller.js
│   │   └── document.controller.js
│   │
│   ├── middleware/
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── routes/
│   │   ├── user.routes.js
│   │   └── document.routes.js
│   │
│   ├── services/
│   │   ├── s3.service.js
│   │   ├── sns.service.js
│   │   └── cloudwatch.service.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   |
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Database Setup

Database name:

```text
document_system
```

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Documents Table

```sql
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_url VARCHAR(1000),
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 6. AWS S3

Documents are uploaded to AWS S3.

Object structure:

```text
documents/
├── user-1/
│   ├── resume.pdf
│   └── marksheet.pdf
│
└── user-2/
    └── resume.pdf
```

Allowed file types:

* PDF
* JPG
* JPEG
* PNG

Maximum file size:

```text
5 MB
```

Files are uploaded directly to S3 using Multer memory storage.

---

## 7. AWS SNS

SNS topic:

```text
document-upload-notification
```

After a successful document upload, the application publishes a notification to the SNS topic.

The subscribed email receives the notification.

The project also supports S3 Event Notifications → SNS as an advanced configuration.

---

## 8. CloudWatch Logs

CloudWatch Log Group:

```text
/student-document-system
```

Log Stream:

```text
document-system-server
```

Important application logs include:

```text
Server started
Upload started
S3 upload successful
Document metadata saved successfully
SNS notification sent successfully
SNS notification failed
Document upload failed
```

---

## 9. CloudWatch Custom Metrics

Namespace:

```text
StudentDocumentSystem
```

Metrics:

```text
DocumentsUploaded
DocumentsUploadFailed
SNSNotificationsSent
SNSNotificationsFailed
```

These metrics are used to monitor application activity and failures.

---

## 10. CloudWatch Alarm

Alarm name:

```text
DocumentUploadFailureAlarm
```

Condition:

```text
DocumentsUploadFailed >= 5
within 5 minutes
```

When the alarm enters the ALARM state, SNS sends a notification to the configured email subscription.

---

## 11. S3 Presigned URL

The application generates temporary presigned URLs for accessing uploaded documents.

Example:

```text
GET /api/documents/:id
```

The response contains:

```json
{
  "success": true,
  "data": {
    "presignedUrl": "https://..."
  }
}
```

The generated URL is temporary and expires after the configured duration.

---

## 12. Environment Variables

Create a `.env` file:

```env
PORT=5000

AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_SNS_TOPIC_ARN=your_sns_topic_arn

AWS_CLOUDWATCH_LOG_GROUP=/student-document-system
AWS_CLOUDWATCH_LOG_STREAM=document-system-server
```

MySQL configuration:

```text
host=localhost
user=root
password=your_mysql_password
database=document_system
```

Never commit the real `.env` file or AWS secret credentials to GitHub.

---

## 13. Installation

Clone the project and install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application runs on:

```text
http://localhost:5000
```

---

## 14. API Documentation

### Create User

```http
POST /api/users
```

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com"
}
```

---

### Get User

```http
GET /api/users/:id
```

Example:

```text
GET /api/users/1
```

---

### Upload Document

```http
POST /api/documents/upload
```

Content-Type:

```text
multipart/form-data
```

Fields:

```text
userId
document
```

---

### Get User Documents

```http
GET /api/documents/user/:userId
```

Example:

```text
GET /api/documents/user/1
```

---

### Get Document

```http
GET /api/documents/:id
```

Example:

```text
GET /api/documents/1
```

This endpoint also generates a temporary S3 presigned URL.

---

### Delete Document

```http
DELETE /api/documents/:id
```

Example:

```text
DELETE /api/documents/1
```

The document is deleted from S3 and its metadata is deleted from MySQL.

---

## 15. Error Handling

The application handles:

* Missing user ID
* Missing document
* Invalid file type
* File larger than 5 MB
* S3 upload failure
* Database failure
* SNS notification failure
* Document not found
* S3 delete failure

---

## 16. Testing Scenarios

The following scenarios were tested:

1. Successful user creation
2. Successful document upload
3. Invalid file type
4. File larger than 5 MB
5. Multiple users uploading documents
6. Fetch user documents
7. Fetch individual document
8. Delete document
9. S3 document storage
10. SNS notification
11. CloudWatch logs
12. CloudWatch metrics
13. CloudWatch alarm
14. Presigned URL access

---

## 17. Security

* AWS credentials are stored in environment variables.
* `.env` is excluded from Git.
* File type validation is implemented.
* File size is limited to 5 MB.
* S3 is used for document storage instead of permanent local storage.
* IAM permissions should follow the least-privilege principle.

---

## 18. AWS Monitoring Flow

```text
Document Upload
      |
      v
S3 Upload
      |
      v
CloudWatch Metrics
      |
      v
DocumentsUploaded

If upload fails
      |
      v
DocumentsUploadFailed
      |
      v
5 failures / 5 minutes
      |
      v
CloudWatch Alarm
      |
      v
SNS
      |
      v
Email Notification
```

---

## 19. Final Deliverables

The project submission includes:

* GitHub repository
* Source code
* Database schema
* Sample database data
* S3 configuration
* SNS topic and subscription
* SNS notification screenshot
* CloudWatch logs
* CloudWatch custom metrics
* CloudWatch dashboard
* CloudWatch alarm
* Postman API collection
* README documentation
* Testing evidence
* Architecture explanation
