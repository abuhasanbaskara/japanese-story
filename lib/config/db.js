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
        // Use environment variable if available, otherwise fallback to your current connection string
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://baskara:hkozrCS58NKTjlPh@cluster0.smyvkun.mongodb.net/japanese-story'
        
        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }
        
        cached.promise = mongoose.connect(mongoUri, options).then((mongoose) => {
            console.log('Connected to MongoDB')
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
