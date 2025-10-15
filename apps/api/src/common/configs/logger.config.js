"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerConfig = void 0;
const winston = require("winston");
exports.loggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: {
        service: 'digital-umroh-api',
        version: process.env.APP_VERSION || '1.0.0',
    },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
    ...(process.env.NODE_ENV === 'production' && [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
        }),
    ]),
};
//# sourceMappingURL=logger.config.js.map