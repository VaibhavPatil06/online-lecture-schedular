import CryptoJS from "crypto-js";

export function encrypt(text: string): string {
  const secretKey = import.meta.env.VITE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("VITE_SECRET_KEY is missing");
  }

  // Normalize the key using SHA256 to ensure 32 bytes
  const key = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(secretKey).toString());
  const iv = CryptoJS.lib.WordArray.random(16); // 16-byte IV

  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    iv: iv,
  });

  // Return IV (Base64) + ":" + encrypted data (Base64)
  return `${CryptoJS.enc.Base64.stringify(iv)}:${encrypted.ciphertext.toString(
    CryptoJS.enc.Base64
  )}`;
}
