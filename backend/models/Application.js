const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cover_letter: { type: String },
  status: { type: String, enum: ['đã nộp', 'đang xem xét', 'đã phỏng vấn', 'bị từ chối', 'được tuyển dụng'], required: true },
  applied_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
