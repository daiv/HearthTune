import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Credential, Role, TimeUnit } from './types/types';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { PERMISSION } from './constants';

export function checkEnvFile() {
  console.log('Checking env file...');
  const mandatoryVar = [
    "MONGO_INITDB_ROOT_USERNAME",
    "MONGO_INITDB_ROOT_PASSWORD",
    "MONGO_INITDB_DATABASE",
    "MONGO_HOSTNAME",
  ];
  const missingEnvVariables = mandatoryVar.filter(envVar => {
    const value = process.env[envVar];
    return !value || value.trim() === "";
  });

  if (missingEnvVariables.length > 0) throw new Error(`The next .env variables are missing: ${missingEnvVariables.join(', ')}`);
  else console.log('env file is ok');
}

export function hashData<T>(data: T, customHashingKey?: string): string {
  const preparedData = typeof data === 'string' ? data : JSON.stringify(data);
  const key = customHashingKey || process.env.HASHING_KEY;
  if (!key) throw new Error('Missing hashing key');
  return crypto
    .createHmac("sha256", key)
    .update(preparedData)
    .digest("hex");
}

export function getMaxSessionsAllowed(role: Role): number {
  switch (role) {
    case 'basic': return 1;
    case 'superAdmin': return Infinity;
    case 'admin': return 3;
    default: return 2;
  }
}
export function isTrialExpired(activatedAt: Date): boolean {
  const now = new Date().getTime();
  const expirationDate = expiresIn(15, 'days', activatedAt).getTime();
  return now > expirationDate;
}

export function expiresIn(
  count: number,
  timeUnit: TimeUnit,
  startingDate: Date = new Date())
  : Date {
  const minutes = 60 * 1000;
  const hours = minutes * 60;
  const days = hours * 24;

  const UNIT_TO_MS: Record<TimeUnit, number> = {
    minutes,
    hours,
    days
  }

  return new Date(startingDate.getTime() + count * UNIT_TO_MS[timeUnit]);
}

export function createValidationCredentials(expiresAt: Date = expiresIn(2, 'days')): Credential {
  const credentials: Credential = {
    expiresAt,
    token: crypto.randomUUID(),
  }
  return credentials;
}
export const atLeast = (minRole: Role) => (role: Role) => PERMISSION[role] >= PERMISSION[minRole];
export const isExactly = (targetRole: Role) => (role: Role) => targetRole === role;

export const sanitize = (rawQuery: string): string => {
  const sanitizedQuery = rawQuery
    .replace(/[^\w\s\u00C0-\u017F!$&\-\.\+_]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return sanitizedQuery;
}
export const checkEmail = (email: string): string => {
  if (!email) return 'Email can not be empty';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  return '';
};