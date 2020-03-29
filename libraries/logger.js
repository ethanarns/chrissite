const winston = require('winston');
const moment = require('moment');
const fs = require('fs');
const colors = require('colors');

const LOG_DIR = "logs/";

// Try to create the log directory
try {
    fs.mkdirSync(LOG_DIR);
} catch (e) {
    if (e.code !== 'EEXIST') {
        console.error(e)
        process.exit(e.errno);
    }
}

try {
    fs.unlinkSync(LOG_DIR + 'debug.log');
} catch (e) {
    if (e.code !== 'ENOENT') {
        console.error(e)
        process.exit(e.errno);
    }
}

var env; // development, deployment, production, debug

if (!process.env.NODE_ENV) {
    console.error("No NODE_ENV found, only logging to console.");
} else {
    var env = process.env.NODE_ENV;
    env = env.trim().toLowerCase();
}

const getTimestamp = () => {
    return moment().format('YYYY-MM-DD hh:mm:ss').trim();
}

// For writing logs to file
const format_printf = winston.format.printf((info) =>{
    return `[${getTimestamp()}] ${info.level.toUpperCase()} - ${info.message}`
});

// Only use for console!
const format_printf_colors = winston.format.printf((info) =>{
    let level = info.level.toUpperCase();
    if (level == 'WARN') {
        level = colors.yellow(level);
    } else if (level == 'ERROR' || level == 'ERR') {
        level = colors.red(level)
    }
    return `[${getTimestamp()}] ${level} - ${info.message}`
});

// Always have an error log
const transports = [
    new winston.transports.File({
        filename: LOG_DIR + 'error.log',
        level: 'error'
    })
];

// Running, available to public. Warnings+ only
if (env === 'production') {
    console.warn("Starting in production mode");
    transports.push(new winston.transports.File({
        filename: LOG_DIR + 'warn.log',
        level: 'warn'
    }));
// On a server, but not deployed. Likely run over SSH
} else if (env === 'testing') {
    transports.push(new winston.transports.File({
        filename: LOG_DIR + 'verbose.log',
        level: 'verbose'
    }));
    transports.push(new winston.transports.Console({
        level: 'verbose',
        format: format_printf_colors
    }))
// Local/SSH, and in debug mode
} else if (env === 'debug') {
    transports.push(new winston.transports.File({
        filename: LOG_DIR + 'debug.log',
        level: 'debug'
    }));
    transports.push(new winston.transports.Console({
        level: 'debug',
        format: format_printf_colors
    }));
// Forgot to add NODE_ENV, or quick local testing
} else {
    transports.push(new winston.transports.Console({
        level: 'verbose',
        format: format_printf_colors
    }));
}

const logger = winston.createLogger({
    level: 'debug', // Transports override this
    format: format_printf,
    transports: transports
});

if (require.main === module) {
    logger.debug("Debug test");
    logger.verbose("Verbose test");
    logger.info("Info test");
    logger.warn("Warning test");
    logger.error("Error test");
}

module.exports = logger;