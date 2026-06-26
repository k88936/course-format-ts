/**
 * Shared utilities for zip-based course loaders
 */

// ── Types ────────────────────────────────────────────

export type ZipData = Record<string, Uint8Array>

// ── Constants ─────────────────────────────────────────

export const TEST_AES_KEY = "DFC929E375655998A34E56A21C98651C"

// ── AES-256-CBC decryption using Web Crypto API ──────

export async function decryptAesCbc(encryptedBase64: string, aesKey: string): Promise<string | undefined> {
  try {
    const keyBytes = new TextEncoder().encode(aesKey)
    const ivBytes = new TextEncoder().encode(aesKey.slice(0, 16))
    const encryptedBytes = base64ToBuffer(encryptedBase64)

    let cryptoKey: CryptoKey
    try {
      cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
      )
    } catch {
      // crypto.subtle may not be available
      return undefined
    }

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: ivBytes },
      cryptoKey,
      encryptedBytes.buffer as ArrayBuffer
    )

    return new TextDecoder().decode(decryptedBuffer)
  } catch {
    return undefined
  }
}

// ── Base64 / binary conversion utilities ──────────────

export function base64ToBuffer(base64: string): Uint8Array {
  const binaryStr = atob(base64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return bytes
}

export function bufferToBase64(buffer: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i])
  }
  return btoa(binary)
}
