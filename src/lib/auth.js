import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'a-very-long-and-secure-32-byte-secret-key-aura-hrm';

// Hashes password using standard node pbkdf2 Sync
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verifies hashed password matches input
export function verifyPassword(password, storedPassword) {
  try {
    const [salt, hash] = storedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Creates signed session token (HMAC-SHA256)
export function createSessionToken(payload) {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours expiration
  });
  const base64Data = Buffer.from(data).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET).update(base64Data).digest('hex');
  return `${base64Data}.${signature}`;
}

// Verifies signed session token
export function verifySessionToken(token) {
  if (!token) return null;
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', SECRET).update(base64Data).digest('hex');
    if (signature !== expectedSignature) return null;

    const dataStr = Buffer.from(base64Data, 'base64').toString('utf8');
    const payload = JSON.parse(dataStr);

    if (payload.exp < Date.now()) return null; // Expired
    return payload;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}
