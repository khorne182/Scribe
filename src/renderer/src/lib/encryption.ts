/**
 * Encryption Utilities for Scribe
 * 
 * This module handles encryption/decryption of sensitive note data.
 * Uses Node.js crypto module for secure encryption.
 */

import { createHash, createCipher, createDecipher, randomBytes } from 'crypto'

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-cbc'
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16

  /**
   * Generate a secure encryption key from a password
   */
  static generateKey(password: string, salt?: string): string {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : randomBytes(16)
    const key = createHash('sha256')
      .update(password)
      .update(saltBuffer)
      .digest('hex')
    
    return key.substring(0, this.KEY_LENGTH * 2) // Convert to hex string
  }

  /**
   * Encrypt text data
   */
  static encrypt(text: string, key: string): string {
    try {
      const iv = randomBytes(this.IV_LENGTH)
      const cipher = createCipher(this.ALGORITHM, key)
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Prepend IV to encrypted data
      return iv.toString('hex') + ':' + encrypted
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt text data
   */
  static decrypt(encryptedText: string, key: string): string {
    try {
      const parts = encryptedText.split(':')
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format')
      }

      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]
      
      const decipher = createDecipher(this.ALGORITHM, key)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Check if text is encrypted (has the IV:encrypted format)
   */
  static isEncrypted(text: string): boolean {
    return text.includes(':') && text.split(':').length === 2
  }

  /**
   * Generate a random salt for key generation
   */
  static generateSalt(): string {
    return randomBytes(16).toString('hex')
  }
}
