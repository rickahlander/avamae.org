import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage/storage';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Upload the file
    const result = await uploadFile(file, folder);

    return NextResponse.json({
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error('Error uploading file:', errorDetails);

    // Check for common Vercel Blob errors
    if (errorDetails.includes('token') || errorDetails.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Storage authentication failed. Please check BLOB_READ_WRITE_TOKEN.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file', details: errorDetails },
      { status: 500 }
    );
  }
}

