import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('logs');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, 'app.log');

function write(level, msg, meta) {
  const line = `${new Date().toISOString()} [${level}] ${msg}${meta ? ' ' + JSON.stringify(meta) : ''}`;
  fs.appendFile(file, line + '\n', () => {});
  (level === 'ERROR' ? console.error : console.log)(line);
}

export const logger = {
  info: (m, x) => write('INFO', m, x),
  warn: (m, x) => write('WARN', m, x),
  error: (m, x) => write('ERROR', m, x)
};
