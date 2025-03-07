import crypto from "crypto";

// Normalize key to 32 bytes using SHA256
function normalizeKey(secretKey) {
  return crypto.createHash("sha256").update(secretKey, "utf-8").digest();
}

export function decrypt(encryptedText) {
  try {
    if (!encryptedText.includes(":")) {
      throw new Error("Invalid encrypted text format");
    }

    const textParts = encryptedText.split(":");
    const iv = Buffer.from(textParts[0], "base64"); // Convert IV from Base64
    const encryptedData = Buffer.from(textParts[1], "base64"); // Convert encrypted data from Base64

    if (iv.length !== 16) {
      throw new Error("Invalid IV length (must be 16 bytes)");
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("SECRET_KEY is missing");
    }

    const key = normalizeKey(secretKey); // Ensure it's exactly 32 bytes

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf-8");
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null;
  }
}
