const InterviewSchedule = require('../models/InterviewSchedule');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
    try {
        const { job_id, candidate_id, start_time, status } = req.body;

        // Đảm bảo start_time là đối tượng Date hợp lệ
        const startTime = new Date(start_time);
        if (isNaN(startTime)) {
            return res.status(400).json({ error: 'Thời gian không hợp lệ' });
        }

        // Kiểm tra và ép kiểu ObjectId nếu cần
        if (!mongoose.Types.ObjectId.isValid(job_id)) {
            return res.status(400).json({ message: 'Invalid jobId' });
        }

        if (!mongoose.Types.ObjectId.isValid(candidate_id)) {
            return res.status(400).json({ message: 'Invalid jobId' });
        }

        const populatedJob = await Job.findOne({ _id: new mongoose.Types.ObjectId(job_id) }).populate('company_id');

        // Tạo và lưu lịch hẹn
        const newAppointment = new InterviewSchedule({
            job_id: job_id,
            candidate_id: candidate_id,
            interviewer_id: populatedJob.company_id.user_id,
            start_time: startTime,
            status
        });

        const notification = new Notification({
            user_id: candidate_id,
            title: `Kết quả ứng tuyển công việc ${populatedJob.title}`,
            message: `Công ty ${populatedJob.company_id.company_name} đã phê duyệt CV của bạn cho công việc ${populatedJob.title} mà chúng tôi đang tuyển dụng, vui lòng chọn khung giờ phỏng vấn phù hợp với bạn.`,
            read_status: false,
            created_at: new Date(),
        });

        await notification.save();
        await newAppointment.save();
        res.status(201).json(newAppointment); // Trả về lịch hẹn mới
    } catch (error) {
        console.error('Lỗi khi tạo lịch hẹn:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi tạo lịch hẹn' });
    }
});

router.get('/available-times', async (req, res) => {
    try {
        const { userId } = req.query; // Lấy userId từ query parameters

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Aggregate dữ liệu từ AvailableTime
        const availableTimes = await InterviewSchedule.aggregate([
            {
                $match: {
                    candidate_id: new mongoose.Types.ObjectId(userId),
                    status: { $nin: ['cancle'] } // Lọc tất cả trạng thái trừ "cancle"
                }
            },
            {
                $lookup: {
                    from: 'jobs', // Liên kết với collection jobs
                    localField: 'job_id',
                    foreignField: '_id',
                    as: 'jobDetails',
                },
            },
            {
                $unwind: '$jobDetails', // Phân rã mảng jobDetails
            },
            {
                $lookup: {
                    from: 'companies', // Liên kết với collection companies
                    localField: 'jobDetails.company_id',
                    foreignField: '_id',
                    as: 'companyDetails',
                },
            },
            {
                $unwind: '$companyDetails', // Phân rã mảng companyDetails
            },
            {
                $group: {
                    _id: '$job_id', // Nhóm theo job_id
                    jobName: { $first: '$jobDetails.title' }, // Lấy tên công việc từ jobDetails
                    companyName: { $first: '$companyDetails.company_name' }, // Lấy tên công ty từ companyDetails
                    location: { $first: '$location' }, // Lấy địa điểm từ InterviewSchedule
                    availableTimes: {
                        $push: {
                            idTime: '$_id',
                            time: '$start_time', // Đẩy thời gian phỏng vấn vào mảng
                            status: '$status', // Trạng thái lấy từ InterviewSchedule
                        },
                    },
                },
            },
        ]);

        res.json(availableTimes); // Trả về kết quả
    } catch (err) {
        console.error('Error fetching available times:', err);
        res.status(500).json({ error: 'Failed to fetch available times', details: err.message });
    }
});

// Route cập nhật nhiều InterviewSchedules
router.put('/update-schedules', async (req, res) => {
    try {
        const {user_id, job_id, schedules} = req.body;

        // Kiểm tra nếu không có dữ liệu hoặc không phải là mảng
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return res.status(400).json({ error: 'Schedules array is required and cannot be empty.' });
        }

        const validStatuses = ['available', 'cancle', 'Chờ phê duyệt', 'Đang đợi phỏng vấn', 'Đã phỏng vấn', 'Hủy'];
        const updateResults = []; // Lưu kết quả từng update

        // Xử lý từng phần tử trong mảng
        for (const schedule of schedules) {
            const { candidateId, idTime, jobId, status } = schedule;

            // Kiểm tra thông tin đầu vào
            if (!candidateId || !idTime || !jobId || !status) {
                return res.status(400).json({ error: 'Each schedule must include candidateId, idTime, jobId, and status.' });
            }

            // Kiểm tra trạng thái hợp lệ
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: `Invalid status for schedule with idTime ${idTime}. Valid statuses are: ${validStatuses.join(', ')}` });
            }

            // Tìm và cập nhật lịch phỏng vấn
            const updatedSchedule = await InterviewSchedule.findOneAndUpdate(
                { _id: idTime, candidate_id: candidateId, job_id: jobId }, // Điều kiện tìm kiếm
                { status: status, updated_at: Date.now() },               // Cập nhật trạng thái và thời gian cập nhật
                { new: true }                                            // Trả về document đã được cập nhật
            );

            // Lưu kết quả
            if (updatedSchedule) {
                updateResults.push({ idTime, success: true, data: updatedSchedule });
            } else {
                updateResults.push({ idTime, success: false, error: 'Schedule not found or invalid input.' });
            }
        }

        const populatedJob = await Job.findOne({ _id: new mongoose.Types.ObjectId(job_id) }).populate('company_id');
        const candidateProfile = await Profile.findOne({ user_id: user_id });

        const notification = new Notification({
            user_id: populatedJob.company_id.user_id,
            title: `Xác nhận thời gian phỏng vấn ${populatedJob.title}`,
            message: `Ứng viên ${candidateProfile.first_name} ${candidateProfile.last_name} đã xác nhận chọn lịch phỏng vấn cho công việc ${populatedJob.title}`,
            read_status: false,
            created_at: new Date(),
        });

        await notification.save();

        // Trả về kết quả tổng hợp
        res.status(200).json({ message: 'Schedules update processed.', results: updateResults });
    } catch (err) {
        console.error('Error updating schedules:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Cập nhật thông tin lịch phỏng vấn
router.put('/update-schedule/:id', async (req, res) => {
    const { id } = req.params; // Lấy ID của lịch phỏng vấn
    const { start_time, location, status, notes, jobId } = req.body; // Lấy thông tin từ body

    // Kiểm tra và ép kiểu ObjectId nếu cần
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid schedule ID' });
    }

    try {
        // Tìm và cập nhật lịch phỏng vấn
        const updatedSchedule = await InterviewSchedule.findByIdAndUpdate(
            id,
            {
                $set: {
                    start_time: start_time ? new Date(start_time) : undefined, // Cập nhật thời gian phỏng vấn
                    location: location || undefined, // Cập nhật địa điểm
                    status: status || undefined, // Cập nhật trạng thái
                    notes: notes || undefined, // Cập nhật ghi chú
                },
            },
            { new: true, runValidators: true } // Trả về tài liệu mới nhất và kiểm tra validation
        );

        const populatedJob = await Job.findOne({ _id: new mongoose.Types.ObjectId(jobId) }).populate('company_id');

        const notification = new Notification({
            user_id: updatedSchedule.candidate_id,
            title: `Thông báo phỏng vấn cho công việc ${populatedJob.title}`,
            message: `Nhà tuyển dụng đã xác nhận lịch phỏng vấn của bạn cho công việc ${populatedJob.title}`,
            read_status: false,
            created_at: new Date(),
        });

        await notification.save();

        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.status(200).json({ success: true, message: 'Schedule updated successfully', data: updatedSchedule });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ success: false, message: 'Error updating schedule', error: error.message });
    }
});

module.exports = router;