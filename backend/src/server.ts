import https from 'https';
import fs from 'fs';
import path from 'path';
import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;

const sslDir = path.join(__dirname, '..', '..', 'ssl');
const sslKeyPath = process.env.SSL_KEY_PATH || path.join(sslDir, 'server.key');
const sslCertPath = process.env.SSL_CERT_PATH || path.join(sslDir, 'server.crt');
const sslOptions = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on https://localhost:${PORT}`);
});
