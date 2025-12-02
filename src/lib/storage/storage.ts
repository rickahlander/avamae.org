import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export type StorageType = 'local' | 'vercel-blob';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to storage based on environment configuration
 * Supports: local filesystem or Vercel Blob
 */
export async function uploadFile(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const storageType = (process.env.STORAGE_TYPE || 'local') as StorageType;

  if (storageType === 'vercel-blob') {
    return uploadToVercelBlob(file, folder);
  } else {
    return uploadToLocal(file, folder);
  }
}

/**
 * Upload file to Vercel Blob storage
 */
async function uploadToVercelBlob(
  file: File,
  folder: string
): Promise<UploadResult> {
  const { put } = await import('@vercel/blob');

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = path.extname(file.name);
  const filename = `${folder}/${timestamp}-${randomString}${extension}`;

  // Upload to Vercel Blob
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    key: filename,
  };
}

/**
 * Upload file to local storage (development only)
 */
async function uploadToLocal(
  file: File,
  folder: string
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = path.extname(file.name);
  const filename = `${timestamp}-${randomString}${extension}`;

  // Create upload directory if it doesn't exist
  const uploadDir = process.env.STORAGE_LOCAL_PATH || './public/uploads';
  const fullPath = path.join(process.cwd(), uploadDir, folder);

  if (!existsSync(fullPath)) {
    await mkdir(fullPath, { recursive: true });
  }

  // Write file
  const filePath = path.join(fullPath, filename);
  await writeFile(filePath, buffer);

  // Return public URL
  const publicUrl = `/uploads/${folder}/${filename}`;

  return {
    url: publicUrl,
    key: `${folder}/${filename}`,
  };
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const storageType = (process.env.STORAGE_TYPE || 'local') as StorageType;

  if (storageType === 'vercel-blob') {
    await deleteFromVercelBlob(key);
  } else {
    await deleteFromLocal(key);
  }
}

async function deleteFromVercelBlob(url: string): Promise<void> {
  const { del } = await import('@vercel/blob');
  await del(url);
}

async function deleteFromLocal(key: string): Promise<void> {
  const { unlink } = await import('fs/promises');
  const uploadDir = process.env.STORAGE_LOCAL_PATH || './public/uploads';
  const filePath = path.join(process.cwd(), uploadDir, key);

  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}
