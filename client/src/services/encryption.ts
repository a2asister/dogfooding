const CHUNK_SIZE = 1024 * 1024;

export async function generateKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return key;
}

export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array; tag: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );

  const tag = new Uint8Array(encrypted.slice(-16));
  const ciphertext = encrypted.slice(0, -16);

  return { encrypted: ciphertext, iv, tag };
}

export async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array,
  tag: Uint8Array
): Promise<ArrayBuffer> {
  const combined = new Uint8Array(encryptedData.byteLength + tag.byteLength);
  combined.set(new Uint8Array(encryptedData), 0);
  combined.set(tag, encryptedData.byteLength);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as Uint8Array<ArrayBuffer>
    },
    key,
    combined
  );

  return decrypted;
}

export async function encryptFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{
  encryptedChunks: Uint8Array[];
  key: string;
  iv: string;
  tag: string;
  chunkCount: number;
}> {
  const key = await generateKey();
  const exportedKey = await exportKey(key);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const encryptedChunks: Uint8Array[] = [];

  let lastTag: Uint8Array | null = null;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = await file.slice(start, end).arrayBuffer();

    const isLast = i === totalChunks - 1;

    if (isLast) {
      const result = await encryptData(chunk, key);
      encryptedChunks.push(new Uint8Array(result.encrypted));
      lastTag = result.tag;
    } else {
      const counterIv = new Uint8Array(16);
      counterIv.set(iv, 0);
      const counterView = new DataView(counterIv.buffer);
      counterView.setUint32(12, i, false);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-CTR',
          counter: counterIv,
          length: 128
        },
        key,
        chunk
      );
      encryptedChunks.push(new Uint8Array(encrypted));
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) * 100) / totalChunks));
    }
  }

  return {
    encryptedChunks,
    key: exportedKey,
    iv: btoa(String.fromCharCode(...iv)),
    tag: btoa(String.fromCharCode(...(lastTag || new Uint8Array(16)))),
    chunkCount: totalChunks
  };
}
