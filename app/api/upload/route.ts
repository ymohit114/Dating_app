import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { extractAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { image, folder = 'elance_profiles' } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: { message: 'Image data is required' } },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder,
        transformation: [
          { width: 1080, height: 1350, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });
    }

    // Fallback: Return the compressed image data directly
    return NextResponse.json({
      success: true,
      url: image,
      notice: 'Cloudinary credentials pending in .env.local',
    });
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Image upload failed' } },
      { status: 500 }
    );
  }
}
