const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');
const authenticateToken = require('../middleware/authenticateToken');
const { normalizeQuery } = require("../helper/queryNormalizer");
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');
const CompanyFollow = require('../models/FollowedCompany');  // Đảm bảo đường dẫn đúng với vị trí của file CompanyFollow.js


// CREATE - Tạo công việc mới
// Trong API server
router.post('/', async (req, res) => {
  try {
    console.log("data insert", req.body);

    const { employer_id, company_id, title, description, requirements, skills, qualifications, salary, job_type, vacancy, location, interview_location, note, application_deadline, benefits, status, test } = req.body;

    // Kiểm tra xem công ty có tồn tại không
    const company = await Company.findById(company_id);
    console.log("company id: ", company_id);

    if (!company) {
      return res.status(400).json({ message: 'ID công ty không hợp lệ' });
    }

    // Tạo công việc mới
    const job = new Job({
      employer_id,
      company_id,
      title,
      description,
      requirements,
      skills,
      qualifications,
      salary,
      job_type,
      vacancy,
      location,
      interview_location,
      note,
      status: status || 'open',
      application_deadline,
      benefits,
      test,
    });

    console.log("job: ", job);

    // Lưu công việc vào cơ sở dữ liệu
    await job.save();
    const followers = await CompanyFollow.find({ company_id });

    for (const follower of followers) {
      const user_id = follower.user_id;

      const companyName = company.company_name;

      const notification = new Notification({
        user_id,
        message: `Công ty "${companyName}" đã đăng 1 bài tuyển dụng mới`,
        read_status: false,
        created_at: new Date(),
      });

      await notification.save();
    }
    res.status(201).json({ message: 'Tạo công việc thành công', job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
});


// READ - Lấy tất cả công việc
router.get('/', async (req, res) => {
  try {
    const { keyword, job_type, location, status } = req.query;

    let filter = {};
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };
    if (job_type) filter.job_type = job_type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;

    const jobs = await Job.find(filter).populate('company_id');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

router.get('/filter', async (req, res) => {
  try {
    const { keyword, job_type, location, company_name, min_salary, max_salary, industry, skills } = req.query;

    let filter = {};

    // Filter by keyword
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };

    // Filter by job type
    if (job_type) filter.job_type = job_type;

    // Filter by location
    if (location) filter.location = { $regex: location, $options: 'i' };

    // Filter by salary range
    if (min_salary && max_salary) {
      filter.salary = { $gte: parseInt(min_salary), $lte: parseInt(max_salary) };
    } else if (min_salary) {
      filter.salary = { $gte: parseInt(min_salary) };
    } else if (max_salary) {
      filter.salary = { $lte: parseInt(max_salary) };
    }

    // Filter by industry and company name
    const companyFilter = {};
    if (industry) companyFilter.industry = { $regex: industry, $options: 'i' };
    if (company_name) companyFilter.name = { $regex: company_name, $options: 'i' };

    // Filter by skills (matching at least one skill)
    if (skills) {
      const skillsArray = skills.split(',');  // Assuming skills are provided as a comma-separated string
      filter.skills = { $in: skillsArray };
    }

    // Fetch jobs based on filters
    const jobs = await Job.find(filter).populate({
      path: 'company_id',
      match: companyFilter,
    }).exec();

    const filteredJobs = jobs.filter((job) => job.company_id);

    res.json(filteredJobs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});



//load danh sách công việc
// READ - Lấy tất cả công việc (chỉ danh sách, không filter, không phân trang)
router.get('/all', async (req, res) => {
  try {
    const jobs = await Job.find().populate('company_id'); // Lấy tất cả công việc và thông tin công ty
    res.json(jobs); // Trả về danh sách công việc
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
});


// READ - Lấy thông tin chi tiết công việc theo ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'company_id',
        select: 'company_name quymo industry location logo', // Chỉ lấy tên và logo của công ty
      })
      .populate('feedbacks'); // Lấy danh sách phản hồi nếu cần

    if (!job) return res.status(404).json({ message: 'Công việc không tồn tại' });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});


//lay danh sach cong viẹc của 1 cong ty và số lượng người ứng tuyển từng công việc
router.get('/jobs-by-company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params; // Lấy companyId từ params
    console.log("id company: ", companyId);

    // Tìm tất cả các công việc có company_id khớp với companyId
    const jobs = await Job.find({ company_id: companyId });

    // Đếm số lượng ứng tuyển cho mỗi công việc
    const jobsWithApplicationCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job_id: job._id });
        return {
          ...job.toObject(), // Chuyển job thành đối tượng thường để dễ thao tác
          applicationCount, // Thêm số lượng ứng tuyển vào mỗi công việc
        };
      })
    );

    // Trả về danh sách công việc với số lượng ứng tuyển
    res.status(200).json(jobsWithApplicationCount);
  } catch (error) {
    console.error('Error fetching jobs by company:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách công việc.' });
  }
});


// UPDATE - Cập nhật công việc
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Công việc không tồn tại' });

    const oldJobData = { ...job.toObject() }; // Store the current job data for comparison
    console.log("oldJobData: ", oldJobData);
    console.log("req.body: ", req.body);
    console.log("job: ", job);

    // Cập nhật các trường công việc
    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;
    job.skills = req.body.skills || job.skills;
    job.qualifications = req.body.qualifications || job.qualifications;
    job.salary = req.body.salary || job.salary;
    job.job_type = req.body.job_type || job.job_type;
    job.vacancy = req.body.vacancy || job.vacancy;
    job.location = req.body.location || job.location;
    job.interview_location = req.body.interview_location || job.interview_location;
    job.note = req.body.note || job.note;
    job.status = req.body.status || job.status;
    job.application_deadline = req.body.application_deadline || job.application_deadline;
    job.benefits = req.body.benefits || job.benefits; // Assume benefits is a new field
    job.test = req.body.test || job.test;

    const isJobUpdated = JSON.stringify(oldJobData) !== JSON.stringify(job.toObject());
    if (isJobUpdated) {
      // Lấy danh sách người dùng đã lưu công việc này
      const savedUsers = await SavedJob.find({ job_id: job._id });

      for (const savedUser of savedUsers) {
        // Tạo thông báo cho người dùng
        const notification = new Notification({
          user_id: savedUser.user_id,  // ID người dùng đã lưu công việc
          message: `Công việc '${job.title}' bạn đang lưu đã có thay đổi mới!`,
          read_status: false,
          created_at: new Date(),
        });

        // Lưu thông báo vào bảng notifications
        await notification.save();
      }
    }
    await job.save();
    res.json({ message: 'Cập nhật công việc thành công', job });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

// DELETE - Xóa công việc
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Xóa công việc
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

////tìm kiếm công việc
router.get("/search-job/search", async (req, res) => {
  try {
    const { query, location } = req.query;

    console.log("Query received:", query);
    console.log("Location received:", location);

    // Chuẩn hóa query
    const normalizedQuery = normalizeQuery(query);

    const searchCriteria = { $and: [] };

    // Tìm kiếm toàn văn
    if (normalizedQuery) {
      const companyIds = await Company.find({
        $or: [
          { company_name: { $regex: normalizedQuery, $options: "i" } },
          { industry: { $regex: normalizedQuery, $options: "i" } },
        ],
      }).select("_id");

      searchCriteria.$and.push({
        $or: [
          { title: { $regex: normalizedQuery, $options: "i" } },
          { description: { $regex: normalizedQuery, $options: "i" } },
          { requirements: { $regex: normalizedQuery, $options: "i" } },
          { skills: { $regex: normalizedQuery, $options: "i" } },
          { qualifications: { $regex: normalizedQuery, $options: "i" } },
          { benefits: { $regex: normalizedQuery, $options: "i" } },
          { job_type: { $regex: normalizedQuery, $options: "i" } },
          { company_id: { $in: companyIds.map((company) => company._id) } },
        ],
      });
    }

    // Tìm kiếm theo địa điểm
    if (location && location.trim() && location !== "Tất cả tỉnh/thành phố") {
      searchCriteria.$and.push({ location: { $regex: location.trim(), $options: "i" } });
    }

    // Nếu không có điều kiện tìm kiếm, bỏ mảng $and
    const queryCriteria = searchCriteria.$and.length > 0 ? searchCriteria : {};

    console.log("Final search criteria:", JSON.stringify(queryCriteria, null, 2));

    // Tìm kiếm và populate company_name và logo
    const jobs = await Job.find(queryCriteria).populate({
      path: "company_id",
      select: "company_name industry logo",
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm công việc.", error: error.message });
  }
});

// Router lọc công việc
router.get('/search-jobs/filter-jobs', async (req, res) => {
  console.log("Đây là request filter-jobs");

  try {
    const { industry, salary, experience, employmentType } = req.query;
    const filters = {};

    // Lọc theo ngành nghề
    if (industry) {
      console.log("Ngành nghề:", industry);

      // Tách các ngành nghề thành mảng (có thể có nhiều ngành nghề được gửi qua dấu phẩy)
      const industriesArray = industry.split(',').map(item => item.trim().toLowerCase());

      // Tìm công việc và lọc theo ngành nghề của công ty
      const jobs = await Job.find()
        .populate('company_id', 'industry')  // Populate ngành nghề của công ty

      // Dùng filter trực tiếp trên mảng công việc để lọc theo ngành nghề
      const filteredJobs = jobs.filter(job => {
        if (job.company_id && job.company_id.industry) {
          // Chuyển ngành nghề của công ty thành chữ thường để so sánh
          const companyIndustry = job.company_id.industry.toLowerCase();
          console.log("Ngành nghề company:", companyIndustry);

          // Duyệt qua tất cả các ngành nghề trong industriesArray và kiểm tra từ khóa
          return industriesArray.some(industryKey => companyIndustry.includes(industryKey));
        }
        return false;
      });

      console.log("Số lượng công việc sau khi lọc ngành nghề:", filteredJobs.length);

      // Trả về các công việc đã lọc
      return res.json(filteredJobs);  
    }

    // Lọc theo kinh nghiệm (năm)
    if (experience) {
      console.log("Kinh nghiệm:", experience);

      const experienceRanges = experience.split(',').map(range => range.trim());

      experienceRanges.forEach(range => {
        const experienceRange = range.split('-').map(Number); // Split cho trường hợp "1-2", "3-5", hoặc "3"
        if (experienceRange.length === 1) {
          // Trường hợp người dùng chọn một số năm cụ thể, ví dụ "3" thay vì "1-2"
          filters.requirements = { $regex: `${experienceRange[0]} năm`, $options: 'i' }; // Tìm "3 năm" trong yêu cầu
        } else if (experienceRange.length === 2) {
          // Trường hợp người dùng chọn một khoảng, ví dụ "1-2"
          const [minExp, maxExp] = experienceRange;
          filters.requirements = {
            $regex: `(?:${minExp}|${maxExp}|[${minExp}-${maxExp}])`,
            $options: 'i'
          };  // Tìm kinh nghiệm trong khoảng từ minExp đến maxExp
        }
      })

    }

    // Lọc theo loại công việc
    if (employmentType) {
      console.log("Loại hình công việc:", employmentType);
      filters.job_type = { $in: employmentType.split(',') };  // Lọc theo danh sách loại hình công việc
    }

    // Tìm kiếm công việc với các bộ lọc đã xác định
    const jobs = await Job.find(filters);

    // Nếu có lọc theo mức lương, lọc lại trong bộ dữ liệu đã tìm được
    if (salary) {
      console.log("Mức lương:", salary);
      const salaryRanges = salary.split(','); // Tách các khoảng lương từ query

      // Lọc các công việc có mức lương trong khoảng được chỉ định
      const filteredJobs = jobs.filter(job => {
        let jobSalary = job.salary;
        console.log("Lương DB:", jobSalary);

        // Tách mức lương từ dữ liệu của công việc (có thể là một chuỗi, ví dụ "1000-2000" hoặc "1000")
        if (jobSalary.includes('-')) {
          const [jobMinSalary, jobMaxSalary] = jobSalary.split('-').map(Number);

          // Kiểm tra mức lương có nằm trong khoảng salaryRanges không
          return salaryRanges.some(range => {
            if (range.includes('-')) {
              const [minSalary, maxSalary] = range.split('-').map(Number);

              // Xử lý TH1: Filter "1000-2000", job.salary "1500-2500"
              if (jobMinSalary > minSalary && jobMinSalary < maxSalary) {
                return true;
              }
              // Xử lý TH2: Filter "1000-2000", job.salary "800-1500"
              if (jobMaxSalary > minSalary && jobMaxSalary < maxSalary) {
                return true;
              }
              return false;
            } else {
              const exactSalary = Number(range);
              // Xử lý TH4: Filter "6000", job.salary "4500-6500"
              return jobMaxSalary > exactSalary;
            }
          });
        } else {
          // Nếu mức lương không phải là khoảng mà chỉ là một con số
          const jobSalaryNumber = Number(jobSalary);
          return salaryRanges.some(range => {
            // Trường hợp TH3: Filter "1000-2000", job.salary "1400"
            if (range.includes('-')) {
              const [minSalary, maxSalary] = range.split('-').map(Number);
              return jobSalaryNumber > minSalary && jobSalaryNumber < maxSalary;
            } else {
              const exactSalary = Number(range);
              // Trường hợp TH5: Filter "6000", job.salary "4500"
              return jobSalaryNumber > exactSalary;
            }
          });
        }
      });

      console.log("Số lượng công việc sau khi lọc lương:", filteredJobs.length);

      // Chỉ trả về một lần duy nhất
      return res.json(filteredJobs);  // Trả về danh sách công việc đã lọc
    }
    // Chỉ trả về một lần duy nhất
    return res.json(jobs);  // Trả về tất cả công việc tìm thấy



  } catch (error) {
    console.error('Lỗi khi tìm kiếm công việc:', error);

    // Nếu có lỗi, chỉ trả về một lần duy nhất
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi tìm kiếm công việc' });
    }
  }
});

// Từ khóa cho các loại công việc
const categories = {
  IT: ['IT', 'Software', 'Web', 'Developer', 'Programmer', 'Coding', 'JavaScript', 'React', 'Node.js'],
  Business: ['Kinh doanh', 'Business', 'Marketing', 'Sales', 'Manager', 'Business Development'],
  Construction: ['Xây dựng', 'Construction', 'Engineer', 'Building'],
  Education: ['Giáo dục', 'Teacher', 'Education', 'Trainer', 'Academic'],
  Photoshop: ['Photoshop', 'Designer', 'Graphic', 'Photoshop'],
  Others: ['Khác']
};

// Thống kê công việc theo các loại
router.get('/all-jobs/job-stats', async (req, res) => {
  try {
    const jobStats = {
      IT: 0,
      Business: 0,
      Construction: 0,
      Education: 0,
      Photoshop: 0,
      Others: 0
    };

    // Lấy tất cả công việc
    const jobs = await Job.find({}).select('title description requirements skills');

    // Nếu không có công việc nào
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'Không có công việc nào để thống kê' });
    }

    // Duyệt qua các công việc để phân loại
    jobs.forEach(job => {
      let categoryMatched = false;

      // Kiểm tra nếu công việc khớp với bất kỳ danh mục nào
      for (const [category, keywords] of Object.entries(categories)) {
        const match = keywords.some(keyword =>
          (job.title && job.title.includes(keyword)) ||
          (job.description && job.description.includes(keyword)) ||
          (job.requirements && job.requirements.includes(keyword)) ||
          (job.skills && job.skills.some(skill => skill.includes(keyword)))
        );

        if (match) {
          jobStats[category] += 1;
          categoryMatched = true;
          break;
        }
      }

      // Nếu không khớp với bất kỳ loại nào, cho vào loại "Khác"
      if (!categoryMatched) {
        jobStats.Others += 1;
      }
    });

    res.status(200).json(jobStats);
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ message: 'Lỗi khi thống kê công việc', error: error.message });
  }
});

// Lấy tất cả công việc cùng công ty với 1 jobId
router.get('/jobs/same-company/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Tìm công việc theo jobId
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Lấy tất cả công việc cùng công ty
    const jobs = await Job.find({
      company_id: job.company_id,
      _id: { $ne: jobId }, // Loại trừ công việc hiện tại
    }).populate('company_id');

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs from the same company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
