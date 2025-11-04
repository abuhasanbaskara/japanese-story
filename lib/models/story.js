import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  japaneseLevel: {
    type: String,
    required: true
  },
  access: {
    type: String,
    required: true,
    enum: ['free', 'premium']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
})

// Delete the model if it exists to avoid schema conflicts
if (mongoose.models.Story) {
  delete mongoose.models.Story
}

// Export the model
const Story = mongoose.model('Story', storySchema)

export default Story

