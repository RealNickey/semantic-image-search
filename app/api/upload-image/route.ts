import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    
    // Get form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const sourceUrl = formData.get('sourceUrl') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const timestamp = formData.get('timestamp') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `image-pocket/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, imageFile, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Prepare response data
    const responseData = {
      url: blob.url,
      size: imageFile.size,
      type: imageFile.type,
      uploadedAt: new Date().toISOString(),
      sourceUrl,
      imageUrl,
      metadata: {
        filename: fileName,
        originalName: imageFile.name,
      }
    };

    // Log the upload (optional, for monitoring)
    console.log('Image uploaded:', {
      url: blob.url,
      size: imageFile.size,
      sourceUrl,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error uploading image:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle CORS for extension
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
