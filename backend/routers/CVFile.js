const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const CvFile = require('../models/CvFile'); // Adjust path to CvFile model
const Profile = require('../models/Profile');
const User = require('../models/User');
router.post('/upload', async (req, res) => {
    try {
      const { originalName, fileName, uploadedBy, mimeType } = req.body;
  
      // Kiểm tra dữ liệu từ frontend
      if (!originalName || !fileName || !uploadedBy) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Tạo đối tượng file mới
      const newFile = new CvFile({
        originalName,
        fileName,
        uploadedBy,
        mimeType,
        is_active: true, // Nếu bạn muốn đánh dấu file là active khi mới upload
      });
  
      // Lưu file vào database
      const savedFile = await newFile.save();
  
      res.status(200).json(savedFile); // Trả lại thông tin file đã lưu
    } catch (error) {
      console.error('Error saving file info:', error);
      res.status(500).json({ error: 'Server error', details: error });
    }
  });

  
// Route lấy danh sách file theo userId
router.get('/files/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const files = await CvFile.find({ uploadedBy: userId, is_active: true });
        if (!files.length) {
            return res.status(200).json({ message: 'No files found for this user', files: null });
        }

        res.status(200).json({ files });
    } catch (error) {
        console.error('Error retrieving files:', error);
        res.status(500).json({ message: 'Error retrieving files', error });
    }
});

router.put('/files/:id', async (req, res) => {
    const fileId = req.params.id;

    try {
        await cloudinary.uploader.destroy(fileId, { resource_type: 'raw' });
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

router.delete('/files/:id', async (req, res) => {
    const fileId = req.params.id;
  
    try {
      // Tìm file trong MongoDB
      const file = await CvFile.findById(fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }  
  
      // Xóa file khỏi MongoDB
      await CvFile.findByIdAndDelete(fileId);
  
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file', details: error.message });
    }
  });
  
  router.get('/files/by-profile/:applicantId', async (req, res) => {
    try {
        const { applicantId } = req.params;

        // Bước 1: Tìm profile theo applicantId
        const profile = await Profile.findById(applicantId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Bước 2: Lấy user_id từ profile
        const userId = profile.user_id;  // Sử dụng trường user_id trong Profile

        // Bước 3: Tìm tất cả các file được tải lên bởi userId
        const files = await CvFile.find({ uploadedBy: userId, is_active: true });

        if (!files.length) {
            return res.status(404).json({ message: 'No files found for this user' });
        }

        // Bước 4: Trả về các file
        res.status(200).json({ files });
    } catch (error) {
        console.error('Error retrieving files by profile:', error);  // Ghi lại lỗi chi tiết
        res.status(500).json({ message: 'Error retrieving files', error: error.message });  // Trả lại thông báo lỗi chi tiết
    }
});


module.exports = router;
