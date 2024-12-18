const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cosineSimilarity = require('cosine-similarity'); // Đảm bảo import đúng
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const natural = require('natural'); // Thư viện xử lý văn bản trong Node.js
const TfIdf = natural.TfIdf;
const Academic = require('../models/Academic'); // Đường dẫn tới model Academic
const Experience = require('../models/Experience');
const Company = require('../models/Company');


// Định nghĩa router cho gợi ý công việc
router.post('/recommend-jobs', async (req, res) => {
  try {
    // Lấy thông tin hồ sơ của người dùng từ DB (dựa vào userId)
    const profile = await Profile.findOne({ user_id: req.body.userId });
    
    if (!profile) {
      return res.status(404).send('User profile not found');
    }

    // Tiền xử lý thông tin hồ sơ của người dùng
    const userSkills = profile.skills.join(' '); // Gộp tất cả kỹ năng của ứng viên thành 1 chuỗi
    const userJobTitle = profile.job_title;
    const userLocation = profile.desired_work_location;
    const userIndustry = profile.current_industry;
    const userJob_level = profile.job_level;
    const usercurrent_field = profile.current_field;
    const useryear = profile.years_of_experience;
    const usersalary = profile.desired_salary;
    const usereducation = profile.education;
    const userExperienceprofile= profile.experience.join(' ');
    const userLocations = profile.location;


    const academicRecords = await Academic.find({ user_id: req.body.userId });

    // Kết hợp tất cả các degree thành một chuỗi duy nhất
    const userDegrees = academicRecords.map(record => record.degree).join(' ');
    const experienceRecords = await Experience.find({ userId: req.body.userId });
    const userExperience = experienceRecords.map(record => `${record.position} at ${record.company} (${record.startMonth} to ${record.endMonth}) ${record.describe}`).join(' ');


    // Lấy tất cả công việc từ DB
    const jobs = await Job.find({ status: 'open' });

      // Tạo tập dữ liệu cho công việc
      // Tạo tập dữ liệu cho công việc
      const jobDescriptions = jobs.map(job =>
          job.description + ' ' +
          job.skills.join(' ') + ' ' +
          job.title + ' ' +
          job.requirements + ' ' +
          job.qualifications + ' ' +
          job.interview_location + ' ' +
          job.salary + ' ' +
          job.location + ' ' +
          job.note + ' ' +
          job.benefits

      );

    // Tiền xử lý mô tả công việc và kỹ năng công việc (Sử dụng TF-IDF)
    const tfidf = new TfIdf();
    jobDescriptions.forEach(description => tfidf.addDocument(description));

    const userVector = tfidf.tfidfs(userSkills + 
        ' ' + userJobTitle + 
        ' ' + userLocation + 
        ' ' + userIndustry +
        ' ' + userJob_level +
        ' ' + usercurrent_field + 
        ' ' + useryear +
        ' ' + usersalary +
        ' ' + usereducation + 
        ' ' + userExperienceprofile +
        ' ' + userDegrees +
        ' ' + userExperience +
        ' ' + userLocations
        
    );
    
    // Kiểm tra vector đầu vào
    const similarities = [];

    for (let i = 0; i < jobs.length; i++) {
      const jobVector = tfidf.tfidfs(jobDescriptions[i]);
      console.log('Job vector:', jobVector); // Kiểm tra vector công việc
      const similarity = cosineSimilarity(userVector, jobVector);
      similarities.push({ jobId: jobs[i]._id, similarity, job: jobs[i] });
    }

    // Sắp xếp các công việc theo độ tương đồng (giảm dần)
    similarities.sort((a, b) => b.similarity - a.similarity);
    const recommendedJobs = await Promise.all(similarities.slice(0, 10).map(async item => {
        // Truy vấn thông tin công ty từ company_id
        const company = await Company.findById(item.job.company_id); // Dùng company_id để tìm công ty
    
        return {
            jobId: item.jobId,
            jobTitle: item.job.title,
            companyId: item.job.company_id,
            companyName: company ? company.company_name : 'N/A',  // Thêm tên công ty
            companyLogo: company ? company.logo : 'N/A',  // Thêm mô tả công ty
            jobDescription: item.job.description,
            location: item.job.location,
            salary: item.job.salary,
            skills: item.job.skills,
            application_deadline: item.job.application_deadline,
            similarity: item.similarity,
        };
    }));
    

    res.json({ recommendedJobs });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching recommended jobs');
  }
});

module.exports = router;
