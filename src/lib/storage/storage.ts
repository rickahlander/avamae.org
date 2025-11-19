import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export type StorageType = 'local' | 's3';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to either local storage or S3 based on environment configuration
 */
export async function uploadFile(
  file: File,
  folder: string = 'uploads'
): Promise<UploadResult> {
  const storageType = (process.env.STORAGE_TYPE || 'local') as StorageType;

  if (storageType === 's3') {
    return uploadToS3(file, folder);
  } else {
    return uploadToLocal(file, folder);
  }
}

/**
 * Upload file to local storage
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
 * Upload file to AWS S3
 */
async function uploadToS3(
  file: File,
  folder: string
): Promise<UploadResult> {
  // Import S3 client only when needed
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3Client = new S3Client({
    region: process.env.STORAGE_REGION || process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = path.extname(file.name);
  const filename = `${timestamp}-${randomString}${extension}`;
  const key = `${folder}/${filename}`;

  // Upload to S3
  const bucketName = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  // Return CloudFront URL if available, otherwise S3 URL
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN || process.env.AWS_CLOUDFRONT_DOMAIN;
  const region = process.env.STORAGE_REGION || process.env.AWS_REGION || 'us-east-1';
  const url = cloudFrontDomain
    ? `https://${cloudFrontDomain}/${key}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return {
    url,
    key,
  };
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const storageType = (process.env.STORAGE_TYPE || 'local') as StorageType;

  if (storageType === 's3') {
    await deleteFromS3(key);
  } else {
    await deleteFromLocal(key);
  }
}

async function deleteFromLocal(key: string): Promise<void> {
  const { unlink } = await import('fs/promises');
  const uploadDir = process.env.STORAGE_LOCAL_PATH || './public/uploads';
  const filePath = path.join(process.cwd(), uploadDir, key);

  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

async function deleteFromS3(key: string): Promise<void> {
  const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');

  const s3Client = new S3Client({
    region: process.env.STORAGE_REGION || process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET || process.env.AWS_S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

