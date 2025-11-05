import mongoose from 'mongoose'

// Cache the connection
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDB = async () => {
    // If already connected, return existing connection
    if (cached.conn) {
        return cached.conn
    }

    // If connection is in progress, wait for it
    if (!cached.promise) {
        // Get MongoDB URI from environment variable
        // For development: Set in .env.local
        // For production: Set in hosting platform environment variables
        let mongoUri = process.env.MONGODB_URI
        
        if (!mongoUri) {
            throw new Error(
                'MONGODB_URI is not defined. ' +
                'Please set it in .env.local (development) or environment variables (production).'
            )
        }
        
        const targetDb = process.env.MONGODB_DB_NAME || 'japanese-story'
        
        if (targetDb) {
            const uriMatch = mongoUri.match(/^([^?]+)\/([^/?]+)(\?.*)?$/)
            if (uriMatch) {
                mongoUri = uriMatch[1] + '/' + targetDb + (uriMatch[3] || '')
            } else if (!mongoUri.includes('/')) {
                mongoUri = mongoUri + '/' + targetDb
            }
        }
        
        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }
        
        cached.promise = mongoose.connect(mongoUri, options).then((mongoose) => {
            console.log('Connected to MongoDB:', mongoose.connection.db.databaseName || process.env.NODE_ENV || 'development')
            return mongoose
        }).catch((error) => {
            console.error('MongoDB connection error:', error.message)
            throw error
        })
    }

    cached.conn = await cached.promise
    return cached.conn
}

export default connectDB
