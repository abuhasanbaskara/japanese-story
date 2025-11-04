import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sizeOf from 'image-size'

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = '7f72e5725723b730914022716eb32164'
const R2_ACCESS_KEY_ID = 'a55991d22607ca9348c4f9cd3abb96bb'
const R2_SECRET_ACCESS_KEY = '86935babb3c92c4d91cd280f5c4b9d7b38a184815f95d50c8441a5e2dcbfb228'
const R2_BUCKET_NAME = 'uploads'

// Create S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const fileType = file.type.toLowerCase()
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return NextResponse.json(
        { error: `File size too large (${sizeMB}MB). Maximum size is 2MB.` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate dimensions
    try {
      const dimensions = sizeOf(buffer)
      if (!dimensions.width || !dimensions.height) {
        return NextResponse.json(
          { error: 'Unable to read image dimensions. Please use a valid image file.' },
          { status: 400 }
        )
      }

      // Minimum dimension validation (800x600)
      if (dimensions.width < 800 || dimensions.height < 600) {
        return NextResponse.json(
          { 
            error: `Image too small (${dimensions.width}x${dimensions.height}px). Minimum size is 800x600px.` 
          },
          { status: 400 }
        )
      }
    } catch (dimensionError) {
      return NextResponse.json(
        { error: 'Invalid image file. Please use a valid JPG, PNG, or WebP image.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // Return the URL - using the R2 public endpoint format
    // Note: You need to enable public access on your R2 bucket and configure a custom domain
    // For now, using the bucket endpoint format
    const imageUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${filename}`
    
    // Alternative: If you have a custom domain configured, use:
    // const imageUrl = `https://your-custom-domain.com/${filename}`

    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        imageUrl 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

