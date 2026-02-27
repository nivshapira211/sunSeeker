import https from 'https';
import fs from 'fs';
import path from 'path';
import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;

const sslOptions = {
  key: fs.readFileSync(path.join(process.cwd(), process.env.SSL_KEY_PATH || '../certs/server.key')),
  cert: fs.readFileSync(path.join(process.cwd(), process.env.SSL_CERT_PATH || '../certs/server.cert')),
};

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on https://localhost:${PORT}`);
});
