import { LogEntry, LogLevel } from "../src";

const levels: LogLevel[] = [
  'emergency',
  'alert',
  'critical',
  'error',
  'warning',
  'notice',
  'info',
  'debug',
];

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getTestLogs(amount: number) {
  const logs: LogEntry[] = [];

  for (let i = 0; i < amount; i++) {
    logs.push({
      timestamp: new Date().toISOString(),
      level: levels[getRandomInt(0, levels.length - 1)],
    });
  }
  return logs;
}

export const testLog: LogEntry = {
  timestamp: new Date().toISOString(),
  level: 'error',
  message: '2c356c57-42d4-41b0-a2ec-76269119a371',
};
