function createLogger(label) {
    return {
        info: (...args) => console.log(`[${label}] INFO:`, ...args),
        warn: (...args) => console.warn(`[${label}] WARN:`, ...args),
        error: (...args) => console.error(`[${label}] ERROR:`, ...args),
    };
}

module.exports = createLogger;
