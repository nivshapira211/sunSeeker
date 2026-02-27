# 🌅 SunShare: Sunrise & Sunset Sharing App

Welcome to **SunShare**! This is a Full Stack application (Node.js/React) designed for friends to share, like, and comment on beautiful sunrise and sunset moments. 

This guide provides step-by-step instructions on how to set up the local development environment, run the required tests, and start the application in production mode using PM2 and HTTPS.
By Niv Shapira and Ofek Saar
---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v18+ recommended)
* **MongoDB** (Installed locally. Atlas/Cloud is strictly forbidden for this project)
* **Git**
* **PM2** (Install globally: `npm install -g pm2`)
* **OpenSSL** (To generate local HTTPS certificates)

---

## 🔒 Step 1: Database Setup (Local MongoDB)

The application requires a local MongoDB instance protected by a username and password.

1. Open your local MongoDB terminal or MongoDB Compass.
2. Create a new database named `sunshare_db`.
3. Create a user with read/write privileges for this database:
   ```javascript
   use sunshare_db
   db.createUser({
     user: "admin",
     pwd: "your_secure_password",
     roles: [ { role: "readWrite", db: "sunshare_db" } ]
   })

## 🔐 Step 2: Generate HTTPS Certificates
Both the Frontend and Backend must run over HTTPS. You need to generate local SSL certificates.

Create a folder named certs in your project root.

Run the following command in your terminal to generate the keys (GitBash or Linux/Mac terminal):

```
openssl req -nodes -new -x509 -keyout certs/server.key -out certs/server.cert
Keep the paths to server.key and server.cert handy for the .env files.
```

## ⚙️ Step 3: Backend Setup & Execution
Open a terminal and navigate to the backend directory:

```
cd backend
npm install
```

Create a .env file in the backend folder and add the following:
```
Code snippet
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://admin:your_secure_password@localhost:27017/sunshare_db
JWT_SECRET=super_secret_jwt_key
JWT_REFRESH_SECRET=super_secret_refresh_key
AI_API_KEY=your_gemini_or_chatgpt_api_key
SSL_KEY_PATH=../certs/server.key
SSL_CERT_PATH=../certs/server.cert
Compile TypeScript to JavaScript:
```

```
npm run build
```
Run the Unit Tests (Mandatory before starting/merging):

```
npm test
```

Start the server in the background using PM2:
```
pm2 start dist/app.js --name "sunshare-backend"
pm2 save
```
The backend is now securely running in the background.

💻 Step 4: Frontend Setup & Execution
Open a new terminal and navigate to the frontend directory:

```
cd frontend
npm install
```

Create a .env file in the frontend folder:
```
Code snippet
REACT_APP_API_BASE_URL=https://localhost:3000/api
HTTPS=true
SSL_CRT_FILE=../certs/server.cert
SSL_KEY_FILE=../certs/server.key
```
Build the application for Production:

```
npm run build
```
Serve the Frontend:
You can use a package like serve to run the built React app over HTTPS, or start your local dev server if you are actively coding:

```
npm start
```
🛑 Stopping the Application
Because the backend runs in the background via PM2, closing the terminal will not stop it. To stop the backend gracefully:

```
pm2 stop sunshare-backend
```
To view the live server logs:

```
pm2 logs sunshare-backend
```

