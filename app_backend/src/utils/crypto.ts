import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

function getKey(): Buffer {
    const key = process.env.FIELD_ENCRYPTION_KEY || '';
    if (!key || key.length < 32) {
        throw new Error('FIELD_ENCRYPTION_KEY must be at least 32 characters');
    }
    return Buffer.from(key.slice(0, 32));
}

export function encryptField(plainText?: string): string | null {
    if (!plainText) return null;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptField(cipherText?: string | null): string | null {
    if (!cipherText) return null;
    try {
        const data = Buffer.from(cipherText, 'base64');
        // If decoding produced very short data, treat as plaintext and return as-is
        if (data.length < 16) {
            return cipherText;
        }
        const iv = data.subarray(0, 12);
        const authTag = data.subarray(12, 28);
        const enc = data.subarray(28);
        const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
        return decrypted;
    } catch (_err) {
        // Backward-compat: if value is not valid ciphertext for current key/format,
        // assume it was stored in plaintext and return it raw.
        return cipherText;
    }
}


