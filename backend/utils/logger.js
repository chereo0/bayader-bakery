const config = require('../config');

function info(...args) {
  if (['info', 'debug'].includes(config.LOG_LEVEL)) console.log('[INFO]', ...args);
}

function warn(...args) {
  if (['info', 'debug', 'warn'].includes(config.LOG_LEVEL)) console.warn('[WARN]', ...args);
}

function debug(...args) {
  if (config.LOG_LEVEL === 'debug') console.log('[DEBUG]', ...args);
}

function error(...args) {
  console.error('[ERROR]', ...args);
}

module.exports = { info, warn, error, debug };
