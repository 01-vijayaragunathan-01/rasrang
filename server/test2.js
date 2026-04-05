import crypto from 'crypto';

// 4 bytes = 32 bits
const buffer = crypto.randomBytes(32);
const randomString = buffer.toString('hex');

console.log(randomString);