const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const mongoose = require('mongoose');


// CREATE - Tạo một báo cáo mới
router.post('/', async (req, res) => {
  try {
    const { total_jobs, total_applications, total_users } = req.body;
    const newReport = new Report({ total_jobs, total_applications, total_users });
    await newReport.save();
    res.status(201).json({ message: 'Report created successfully', newReport });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy tất cả báo cáo
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// READ - Lấy báo cáo theo ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// UPDATE - Cập nhật một báo cáo
router.put('/:id', async (req, res) => {
  try {
    const { total_jobs, total_applications, total_users } = req.body;
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { total_jobs, total_applications, total_users },
      { new: true }
    );
    if (!updatedReport) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report updated successfully', updatedReport });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE - Xóa một báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/report-statistics/alls', async (req, res) => {
  try {
    // Thống kê người dùng
    const applicantCount = await User.countDocuments({ role: 'applicant' });
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Thống kê công việc
    const fullTimeCount = await Job.countDocuments({ job_type: 'full_time' });
    const partTimeCount = await Job.countDocuments({ job_type: 'part_time' });
    const internshipCount = await Job.countDocuments({ job_type: 'internship' });

    const { year } = req.query; // Lấy năm từ query params

    const matchStage = {};
    if (year) {
      matchStage.created_at = {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`),
      };
    }

    const companyStats = await Company.aggregate([
      {
        $match: matchStage, // Áp dụng bộ lọc theo năm
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' }, // Nhóm theo năm
            month: { $month: '$created_at' }, // Nhóm theo tháng
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, // Sắp xếp theo năm và tháng
    ]);

    // Format dữ liệu trả về
    const companyStatsFormatted = companyStats.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count,
    }));

    // Tạo danh sách hiển thị
    const months = companyStatsFormatted.map(
      (item) => `Tháng ${item.month}/${item.year}`
    );
    const companyCount = companyStatsFormatted.map((item) => item.count);

    res.json({
      users: { applicant: applicantCount, recruiter: recruiterCount, admin: adminCount },
      jobs: { full_time: fullTimeCount, part_time: partTimeCount, internship: internshipCount },
      companies: { months, count: companyCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/report-statistics/application/all', async (req, res) => {
  try {
    const { year, companyId } = req.query;
    console.log("id nè", companyId);

    const filter = {};

    // Bộ lọc theo năm
    if (year && year !== 'all') {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
      filter.dateRange = { startDate, endDate };
    }

    // Bộ lọc theo công ty
    const companyJobs = companyId
      ? await Job.find({ company_id: companyId }, '_id')
      : [];
    console.log("id nè", companyJobs);


    // Dữ liệu thống kê
    const [jobsPosted, jobsApplied, totalApplicants] = await Promise.all([
      // Số công việc đã đăng
      Job.aggregate([
        {
          $match: {
            ...(filter.dateRange && {
              created_at: { $gte: filter.dateRange.startDate, $lt: filter.dateRange.endDate },
            }),
            ...(companyId && { company_id: new mongoose.Types.ObjectId(companyId) }), // Sử dụng 'new' với ObjectId

          },
        },
        {
          $project: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
          },
        },
        // Nhóm theo năm-tháng
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
        // Nhóm tổng số theo năm
        {
          $group: {
            _id: "$_id.year",
            months: { $push: { month: "$_id.month", count: "$count" } },
            yearTotal: { $sum: "$count" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Số công việc được ứng tuyển
      Application.aggregate([
        {
          $match: {
            ...(filter.dateRange && {
              applied_at: { $gte: filter.dateRange.startDate, $lt: filter.dateRange.endDate },
            }),
            ...(companyId && { job_id: { $in: companyJobs.map((job) => job._id) } }),
          },
        },
        {
          $project: {
            year: { $year: "$applied_at" },
            month: { $month: "$applied_at" },
          },
        },
        // Nhóm theo năm-tháng
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
        // Nhóm tổng số theo năm
        {
          $group: {
            _id: "$_id.year",
            months: { $push: { month: "$_id.month", count: "$count" } },
            yearTotal: { $sum: "$count" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),

      // Tổng số người dùng (không quan tâm vai trò)
      User.countDocuments({
        ...(filter.dateRange && {
          created_at: { $gte: filter.dateRange.startDate, $lt: filter.dateRange.endDate },
        }),
      }),
    ]);

    // Trả về kết quả
    res.json({
      jobsPosted,
      jobsApplied,
      totalApplicants,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
