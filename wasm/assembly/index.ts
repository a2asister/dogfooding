// AES-256-GCM encryption WASM module
// This is a simplified implementation for demonstration purposes

export function generateKey(): Uint8Array {
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = u8(Math.floor(Math.random() * 256));
  }
  return key;
}

export function generateIV(): Uint8Array {
  const iv = new Uint8Array(12);
  for (let i = 0; i < 12; i++) {
    iv[i] = u8(Math.floor(Math.random() * 256));
  }
  return iv;
}

export function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(Math.min(a.length, b.length));
  for (let i = 0; i < result.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}

export function encryptChunkSimple(chunk: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
  const result = new Uint8Array(chunk.length);
  const keyBlock = new Uint8Array(16);
  const counter = new Uint8Array(16);

  for (let i = 0; i < 12; i++) {
    counter[i] = iv[i];
  }

  let counterValue: u32 = 0;

  for (let i = 0; i < chunk.length; i += 16) {
    counter[12] = u8(counterValue & 0xff);
    counter[13] = u8((counterValue >> 8) & 0xff);
    counter[14] = u8((counterValue >> 16) & 0xff);
    counter[15] = u8((counterValue >> 24) & 0xff);

    for (let j = 0; j < 16; j++) {
      keyBlock[j] = counter[j] ^ key[j % key.length];
    }

    const end = Math.min(i + 16, chunk.length);
    for (let j = i; j < end; j++) {
      result[j] = chunk[j] ^ keyBlock[j % 16];
    }

    counterValue++;
  }

  return result;
}

export function decryptChunkSimple(chunk: Uint8Array, key: Uint8Array, iv: Uint8Array): Uint8Array {
  return encryptChunkSimple(chunk, key, iv);
}

export function hashData(data: Uint8Array): Uint32Array {
  let h1: u32 = 0x67452301;
  let h2: u32 = 0xefcdab89;
  let h3: u32 = 0x98badcfe;
  let h4: u32 = 0x10325476;

  const padded = new Uint8Array(data.length + 64);
  for (let i = 0; i < data.length; i++) {
    padded[i] = data[i];
  }
  padded[data.length] = 0x80;

  for (let i = 0; i < data.length; i += 64) {
    const w = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      const idx = i + j * 4;
      w[j] = (u32(padded[idx]) | (u32(padded[idx + 1]) << 8) |
              (u32(padded[idx + 2]) << 16) | (u32(padded[idx + 3]) << 24));
    }

    let a = h1, b = h2, c = h3, d = h4;

    for (let j = 0; j < 16; j++) {
      const f = (b & c) | (~b & d);
      const temp = ((a << 7) | (a >> 25)) + f + d + 0x5a827999 + w[j];
      d = c;
      c = b;
      b = (b << 30) | (b >> 2);
      a = temp;
    }

    h1 += a;
    h2 += b;
    h3 += c;
    h4 += d;
  }

  return new Uint32Array([h1, h2, h3, h4]);
}
