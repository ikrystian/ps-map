/**
 * Encryption utility for secure message storage
 * Uses AES-256-CBC algorithm
 */

import crypto from "crypto"

// Get encryption key from environment variable
// In production, this should be a securely stored 32-byte key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex")
const ALGORITHM = "aes-256-cbc"

/**
 * Ensures the encryption key is exactly 32 bytes
 */
function getEncryptionKey(): Buffer {
  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error("Encryption key must be 32 bytes (64 hex characters)")
  }
  return Buffer.from(ENCRYPTION_KEY, "hex")
}

/**
 * Encrypts a string using AES-256-CBC
 * @param text - The text to encrypt
 * @returns Object containing encrypted text and initialization vector
 */
export function encryptMessage(text: string): { encrypted: string; iv: string } {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16)

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)

    // Encrypt the text
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    return {
      encrypted,
      iv: iv.toString("hex"),
    }
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt message")
  }
}

/**
 * Decrypts a string that was encrypted with AES-256-CBC
 * @param encrypted - The encrypted text
 * @param ivHex - The initialization vector as hex string
 * @returns The decrypted text
 */
export function decryptMessage(encrypted: string, ivHex: string): string {
  try {
    // Convert IV from hex to Buffer
    const iv = Buffer.from(ivHex, "hex")

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)

    // Decrypt the text
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt message")
  }
}

/**
 * Tests if encryption/decryption is working correctly
 */
export function testEncryption(): boolean {
  try {
    const testMessage = "Test message for encryption"
    const { encrypted, iv } = encryptMessage(testMessage)
    const decrypted = decryptMessage(encrypted, iv)
    return testMessage === decrypted
  } catch (error) {
    console.error("Encryption test failed:", error)
    return false
  }
}
