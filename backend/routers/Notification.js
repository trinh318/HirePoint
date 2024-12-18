const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const authenticateToken = require('../middleware/authenticateToken');

// CREATE - Tạo một thông báo mới và phát qua Socket.IO
router.post('/applications', async (req, res) => {
  try {
    const { job_id } = req.body;
    const applicantId = req.user.id; // Lấy ID ứng viên từ token

    // Tìm công việc theo ID
    const job = await Job.findById(job_id).populate('employer_id', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Công việc không tồn tại.' });
    }

    // Tạo nội dung thông báo
    const employerId = job.employer_id._id; // Lấy ID nhà tuyển dụng
    const notificationMessage = `Ứng viên ${req.user.name} đã ứng tuyển vào công việc "${job.title}"`;

    // Tạo và lưu thông báo
    const notification = new Notification({
      user_id: employerId, // Gửi đến nhà tuyển dụng
      message: notificationMessage,
      created_at: new Date(),
      read_status: false,
    });
    await notification.save();

    // Gửi thông báo qua Socket.IO (real-time)
    req.io.to(employerId.toString()).emit('notification', {
      message: notificationMessage,
      jobTitle: job.title,
      applicantName: req.user.name,
    });

    res.status(201).json({ message: 'Đã ứng tuyển thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi ứng tuyển.', error: err.message });
  }
});

/// API route để lấy thông báo của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.params.userId });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông báo', error });
  }
});


// READ - Lấy thông báo theo ID
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

/// UPDATE - Đánh dấu thông báo là đã đọc
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read_status: true }, // Đánh dấu là đã đọc
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Gửi cập nhật thông báo tới user qua Socket.IO
    req.io.to(notification.user_id).emit('notification-read', notification);

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE - Xóa thông báo theo ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Gửi thông báo xóa tới user qua Socket.IO
    req.io.to(deletedNotification.user_id).emit('notification-deleted', deletedNotification);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// applyJob - Xử lý ứng tuyển công việc và gửi thông báo
const applyJob = async (req, res) => {
  try {
    const { job_id } = req.body; // Lấy job_id từ body request
    const applicantId = req.user.id; // Lấy ID ứng viên từ token (người dùng đã đăng nhập)

    const job = await Job.findById(job_id).populate('employer_id', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Công việc không tồn tại.' });
    }

    const employerId = job.employer_id._id; // Lấy ID nhà tuyển dụng
    const notificationMessage = `Ứng viên ${req.user.name} đã ứng tuyển vào công việc "${job.title}"`;

    const notification = new Notification({
      user_id: employerId, // Gửi thông báo cho nhà tuyển dụng
      message: notificationMessage,
      created_at: new Date(),
      read_status: false,
    });

    await notification.save();

    // Gửi thông báo theo thời gian thực qua socket
    req.io.to(employerId.toString()).emit('notification', {
      message: notificationMessage,
      jobTitle: job.title,
      applicantName: req.user.name,
    });

    res.status(201).json({ message: 'Ứng tuyển thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi ứng tuyển.', error: err.message });
  }
};

// Đảm bảo applyJob được thêm vào router
router.post('/apply', applyJob);

module.exports = router;
