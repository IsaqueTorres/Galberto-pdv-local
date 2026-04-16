import crypto from 'node:crypto';

export function generateRandomState(size = 32): string {
  return crypto.randomBytes(size).toString('hex');
}

export function toBasicAuth(clientId: string, clientSecret: string): string {
  return Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
}