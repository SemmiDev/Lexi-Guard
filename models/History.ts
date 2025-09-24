import { Schema, model, models } from 'mongoose';

const HistorySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  correctedText: {
    type: String,
    required: true,
  },
  suggestions: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '30d' },
  },
});

const History = models.History || model('History', HistorySchema);

export default History;
