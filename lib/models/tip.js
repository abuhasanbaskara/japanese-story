import mongoose from 'mongoose'

const tipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['grammar', 'vocabulary', 'idiom', 'culture', 'pronunciation', 'other']
  },
  japaneseLevel: {
    type: String,
    required: true,
    enum: ['N6', 'N5', 'N4', 'N3', 'N2', 'N1', 'all']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
})

if (mongoose.models && mongoose.models.Tip) {
  delete mongoose.models.Tip
}

const Tip = mongoose.model('Tip', tipSchema)

export default Tip

