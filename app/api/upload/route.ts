import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sizeOf from 'image-size'

// Cloudflare R2 configuration - using environment variables
// For development: Set in .env.local
// For production: Set in hosting platform environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || (process.env.NODE_ENV === 'production' ? 'uploads-prod' : 'uploads-dev')

// Validate required R2 environment variables
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing required R2 environment variables. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.')
}

// Create S3 client for Cloudflare R2
// Note: forcePathStyle: true is important for R2 compatibility
// Only create client if credentials are available (lazy initialization)
const getS3Client = () => {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials are not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in environment variables.')
  }
  
  // After the check above, we know these are defined, but TypeScript needs assertion
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true // Important for R2 compatibility
  })
}

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

    // Generate unique filename - following the pattern from working project
    const timestamp = Date.now()
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedOriginalName}` // Using underscore like working project

    // Upload to R2
    const s3Client = getS3Client()
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // Return the URL - using R2_PUBLIC_BASE_URL environment variable
    // Development: Set to R2.dev subdomain URL in .env.local
    // Production: Set to custom domain (e.g., https://cdn.yourdomain.com) in hosting platform
    const imageUrl = process.env.R2_PUBLIC_BASE_URL 
      ? `${process.env.R2_PUBLIC_BASE_URL}/${filename}`
      : (() => {
          // Fallback: This should not happen in production
          if (!R2_ACCOUNT_ID) {
            throw new Error('R2_PUBLIC_BASE_URL is not set and R2_ACCOUNT_ID is missing')
          }
          console.warn('R2_PUBLIC_BASE_URL not set, using fallback URL. This may not work for public access.')
          return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${filename}`
        })()

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

