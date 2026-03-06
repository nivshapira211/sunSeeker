"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, db_1.default)();
const PORT = process.env.PORT || 3000;
const sslDir = path_1.default.join(__dirname, '..', '..', 'ssl');
const sslKeyPath = process.env.SSL_KEY_PATH
    ? (path_1.default.isAbsolute(process.env.SSL_KEY_PATH) ? process.env.SSL_KEY_PATH : path_1.default.join(process.cwd(), process.env.SSL_KEY_PATH))
    : path_1.default.join(sslDir, 'server.key');
const sslCertPath = process.env.SSL_CERT_PATH
    ? (path_1.default.isAbsolute(process.env.SSL_CERT_PATH) ? process.env.SSL_CERT_PATH : path_1.default.join(process.cwd(), process.env.SSL_CERT_PATH))
    : path_1.default.join(sslDir, 'server.crt');
function startServer() {
    if (fs_1.default.existsSync(sslKeyPath) && fs_1.default.existsSync(sslCertPath)) {
        const sslOptions = {
            key: fs_1.default.readFileSync(sslKeyPath),
            cert: fs_1.default.readFileSync(sslCertPath),
        };
        https_1.default.createServer(sslOptions, app_1.default).listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on https://localhost:${PORT}`);
        });
    }
    else {
        http_1.default.createServer(app_1.default).listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT} (no SSL certs found)`);
        });
    }
}
startServer();
