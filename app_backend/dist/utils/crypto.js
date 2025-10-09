"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptField = encryptField;
exports.decryptField = decryptField;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-gcm';
function getKey() {
    const key = process.env.FIELD_ENCRYPTION_KEY || '';
    if (!key || key.length < 32) {
        throw new Error('FIELD_ENCRYPTION_KEY must be at least 32 characters');
    }
    return Buffer.from(key.slice(0, 32));
}
function encryptField(plainText) {
    if (!plainText)
        return null;
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv(algorithm, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}
function decryptField(cipherText) {
    if (!cipherText)
        return null;
    const data = Buffer.from(cipherText, 'base64');
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const enc = data.subarray(28);
    const decipher = crypto_1.default.createDecipheriv(algorithm, getKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    return decrypted;
}
