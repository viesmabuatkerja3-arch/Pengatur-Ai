/**
 * Web Crypto-based hashing and session rate limiting for application master password
 */

const SALT_STORAGE_KEY = 'alokasiai_salt';
const HASH_STORAGE_KEY = 'alokasiai_pwd_hash';
const ATTEMPTS_STORAGE_KEY = 'alokasiai_auth_attempts';

interface AuthAttempts {
  count: number;
  lockedUntil: number | null;
}

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hash password with salt using PBKDF2 with SHA-256
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  return bufferToHex(exportedKey);
}

// Check if master password is set
export function isPasswordSet(): boolean {
  return !!localStorage.getItem(HASH_STORAGE_KEY);
}

// Set new master password
export async function setMasterPassword(password: string): Promise<void> {
  const salt = window.crypto.randomUUID();
  const hash = await hashPassword(password, salt);
  localStorage.setItem(SALT_STORAGE_KEY, salt);
  localStorage.setItem(HASH_STORAGE_KEY, hash);
  resetAttempts();
}

// Verify entered password
export async function verifyMasterPassword(password: string): Promise<{ success: boolean; remainingAttempts?: number; lockedMinutes?: number }> {
  const status = getAttemptStatus();
  if (status.isLocked) {
    const minutesLeft = Math.ceil((status.lockedUntil! - Date.now()) / (60 * 1000));
    return { success: false, lockedMinutes: Math.max(1, minutesLeft) };
  }

  const salt = localStorage.getItem(SALT_STORAGE_KEY);
  const storedHash = localStorage.getItem(HASH_STORAGE_KEY);

  if (!salt || !storedHash) {
    return { success: false };
  }

  const computedHash = await hashPassword(password, salt);
  if (computedHash === storedHash) {
    resetAttempts();
    return { success: true };
  } else {
    const newAttempts = recordFailedAttempt();
    return {
      success: false,
      remainingAttempts: Math.max(0, 5 - newAttempts.count),
      lockedMinutes: newAttempts.lockedUntil ? Math.ceil((newAttempts.lockedUntil - Date.now()) / (60 * 1000)) : undefined
    };
  }
}

// Check rate limit status
export function getAttemptStatus(): { isLocked: boolean; lockedUntil: number | null; attemptsCount: number } {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return { isLocked: false, lockedUntil: null, attemptsCount: 0 };
    const data: AuthAttempts = JSON.parse(raw);
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      return { isLocked: true, lockedUntil: data.lockedUntil, attemptsCount: data.count };
    }
    if (data.lockedUntil && Date.now() >= data.lockedUntil) {
      resetAttempts();
      return { isLocked: false, lockedUntil: null, attemptsCount: 0 };
    }
    return { isLocked: false, lockedUntil: null, attemptsCount: data.count };
  } catch {
    return { isLocked: false, lockedUntil: null, attemptsCount: 0 };
  }
}

function recordFailedAttempt(): AuthAttempts {
  const current = getAttemptStatus();
  const newCount = current.attemptsCount + 1;
  let lockedUntil: number | null = null;
  if (newCount >= 5) {
    // Lock for 15 minutes
    lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  const payload: AuthAttempts = { count: newCount, lockedUntil };
  localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function resetAttempts(): void {
  localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
}
