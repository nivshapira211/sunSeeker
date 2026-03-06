import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;

const sslDir = path.join(__dirname, '..', '..', 'ssl');
const sslKeyPath = process.env.SSL_KEY_PATH
  ? (path.isAbsolute(process.env.SSL_KEY_PATH) ? process.env.SSL_KEY_PATH : path.join(process.cwd(), process.env.SSL_KEY_PATH))
  : path.join(sslDir, 'server.key');
const sslCertPath = process.env.SSL_CERT_PATH
  ? (path.isAbsolute(process.env.SSL_CERT_PATH) ? process.env.SSL_CERT_PATH : path.join(process.cwd(), process.env.SSL_CERT_PATH))
  : path.join(sslDir, 'server.crt');

function startServer() {
  if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    const sslOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };
    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on https://localhost:${PORT}`);
    });
  } else {
    http.createServer(app).listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT} (no SSL certs found)`);
    });
  }
}

startServer();
