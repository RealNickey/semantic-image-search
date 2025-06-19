import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { images } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { del } from '@vercel/blob';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // First, get the image details to get the blob URL
    const [imageToDelete] = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    if (!imageToDelete) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete the image from the database
    await db.delete(images).where(eq(images.id, imageId));

    // Delete the image file from Vercel Blob storage
    try {
      await del(imageToDelete.path);
    } catch (blobError) {
      console.error('Error deleting blob:', blobError);
      // Continue even if blob deletion fails, as the DB record is already deleted
    }

    return NextResponse.json(
      { success: true, message: 'Image deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
