"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, db_1.default)();
const PORT = process.env.PORT || 3000;
const sslOptions = {
    key: fs_1.default.readFileSync(path_1.default.join(process.cwd(), process.env.SSL_KEY_PATH || '../certs/server.key')),
    cert: fs_1.default.readFileSync(path_1.default.join(process.cwd(), process.env.SSL_CERT_PATH || '../certs/server.cert')),
};
https_1.default.createServer(sslOptions, app_1.default).listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on https://localhost:${PORT}`);
});
