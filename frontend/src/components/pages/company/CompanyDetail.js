import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import '../../../styles/companydetail.css';
import ApplyJob from '../applicant/ApplyJob';
import axios from 'axios';
import { isAuth } from '../../../libs/isAuth';
import { getId } from '../../../libs/isAuth';

export default function CompanyDetail() {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);  // Declare loading state
    const [error, setError] = useState(null);
    const [allJobData, setAllJobData] = useState([]); // Lưu danh sách công việc
    const [allJobDataUnAuth, setAllJobDataUnAuth] = useState([]); // Lưu danh sách công việc
    const [successMessage, setSuccessMessage] = useState(null);
    const [savedJobs, setSavedJobs] = useState([]);
    const [isFollowed, setIsFolloweds] = useState(false);
    const { companyId } = useParams();

    const userId = getId();

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/companies/company/${companyId}`);
                setCompany(response.data);
                console.log('Company ID:', companyId);
                setLoading(false);
            } catch (error) {
                setError('Error fetching company data');
                setLoading(false);
            }
        };

        const fetchJob = async () => {
            if (!isAuth()) {
                try {
                    setLoading(true);

                    const response = await axios.get(`http://localhost:5000/api/jobs/jobs-by-company/${companyId}`);

                    setAllJobDataUnAuth(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('Lỗi khi tải dữ liệu.');
                } finally {
                    setLoading(false);
                }
            }
        };

        const checkFollowStatus = async () => {
            if (isAuth()) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('Bạn cần đăng nhập để kiểm tra trạng thái theo dõi');
                        return;
                    }
        
                    const response = await axios.get(`http://localhost:5000/api/followedcompanies/check-followed/${companyId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
        
                    setIsFolloweds(response.data.isFollowed);
                    if (isFollowed) {
                        console.log('Bạn đang theo dõi công ty này.');
                    } else {
                        console.log('Bạn chưa theo dõi công ty này.');
                    }
                } catch (err) {
                    console.error('Error checking follow status:', err);
                    alert('Có lỗi xảy ra khi kiểm tra theo dõi.');
                }
            }
        };

        fetchCompany();
        fetchJob();
        checkFollowStatus();
    }, [companyId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Tải đồng thời danh sách công việc đã lưu và tất cả công việc
                const [savedJobsResponse, allJobsResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`),
                    axios.get(`http://localhost:5000/api/jobs/jobs-by-company/${companyId}`)
                ]);

                const savedJobs = savedJobsResponse.data;
                const jobs = allJobsResponse.data;

                // Đánh dấu các công việc đã lưu
                const updatedJobs = jobs.map((job) => ({
                    ...job,
                    saved: savedJobs.some((savedJob) => savedJob.job_id._id === job._id),
                }));

                setSavedJobs(savedJobs);
                setAllJobData(updatedJobs);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Lỗi khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        if (companyId) {
            fetchData();
        }
    }, [companyId, userId]);

    const handleSaveJob = async (jobId) => {
        try {
            // Lấy token từ localStorage
            const token = localStorage.getItem('token');

            if (token == null) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }
            // Gửi yêu cầu POST để lưu công việc
            const response = await axios.post(
                'http://localhost:5000/api/savedjobs/save-job',
                { job_id: jobId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Kiểm tra nếu lưu thành công
            if (response.status === 201) {
                alert('Lưu tin ứng tuyển thành công!');
                setTimeout(() => setSuccessMessage(null), 3000); // Ẩn thông báo thành công sau 3 giây

                // Cập nhật danh sách công việc đã lưu
                setSavedJobs((prevSavedJobs) => [...prevSavedJobs, response.data.savedJob]);

                // Cập nhật trạng thái saved trong allJobData
                setAllJobData((prevJobs) =>
                    prevJobs.map((job) =>
                        job._id === jobId ? { ...job, saved: true } : job
                    )
                );
            }

        } catch (err) {
            if (err.response) {
                // Xử lý các mã trạng thái cụ thể
                if (err.response.status === 409) {
                    alert('Bạn đã lưu công việc này trước đó.');
                } else {
                    setError(err.response.data.message || 'Không thể lưu công việc. Vui lòng thử lại.');
                }
                if (err.response.status === 401) {
                    alert('Bạn cần đăng nhập để ứng tuyển');
                }
            } else {
                console.error('Error saving job:', err.message);
                setError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    const toggleFavorite = async (jobId) => {
        try {
            if (!isAuth()) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            // Kiểm tra nếu công việc đã được lưu
            const job = allJobData.find((job) => job._id === jobId);

            if (job.saved) {
                // Nếu đã lưu, xóa công việc
                await handleUnsaveJob(jobId);
            } else {
                // Nếu chưa lưu, lưu công việc
                await handleSaveJob(jobId);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError('Có lỗi xảy ra khi thay đổi trạng thái yêu thích.');
        }
    };

    const handleUnsaveJob = async (jobId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            // Tìm ID của công việc đã lưu trong `savedJobs`
            const savedJob = savedJobs.find((savedJob) => savedJob.job_id._id === jobId);
            if (!savedJob) {
                alert('Không tìm thấy công việc đã lưu để xóa.');
                return;
            }

            // Gửi yêu cầu DELETE để xóa công việc đã lưu
            const response = await axios.delete(`http://localhost:5000/api/savedjobs/${savedJob._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                alert('Công việc đã được xóa khỏi danh sách yêu thích.');

                // Cập nhật danh sách `savedJobs`
                setSavedJobs((prevSavedJobs) =>
                    prevSavedJobs.filter((job) => job._id !== savedJob._id)
                );

                // Cập nhật trạng thái `allJobData`
                setAllJobData((prevJobs) =>
                    prevJobs.map((job) =>
                        job._id === jobId ? { ...job, saved: false } : job
                    )
                );
            }
        } catch (err) {
            console.error('Error unsaving job:', err.message);
            alert('Có lỗi xảy ra khi xóa công việc đã lưu.');
        }
    };

    const [jobToApply, setJobToApply] = useState(null); // Công việc được chọn để ứng tuyển

    const openApplyForm = (job) => {
        if (isAuth()) {
            setJobToApply(job); // Gán công việc được chọn
        } else {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
            return;
        }
    };

    const closeApplyForm = () => {
        setJobToApply(null); // Đóng form ứng tuyển
    };

    const handleFollow = async (companyId) => {
        try {
            const token = localStorage.getItem('token');  // Lấy token từ localStorage

            if (!token) {
                alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/followedcompanies',
                { company_id: companyId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                alert('Công ty đã được theo dõi!');
                setIsFolloweds(true);
            }
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;

                if (status === 401) {
                    alert(data.message || 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
                }
                else {
                    alert(data.message || 'Không thể theo dõi công ty. Vui lòng thử lại.');
                }
            }
        }
    };

    const handleUnfollow = async (companyId) => {
        const userId = getId(); // Lấy userId từ getId()

        if (!companyId) {
            console.error('Company ID is missing');
            return;
        }

        try {
            // Gửi yêu cầu DELETE để hủy theo dõi công ty
            const response = await axios.delete(`http://localhost:5000/api/followedcompanies/${userId}/${companyId}`);
            const url = `http://localhost:5000/api/followedcompanies/${userId}/${companyId}`;
            console.log('Sending DELETE request to:', url);
            // Nếu thành công, cập nhật lại danh sách công ty đã theo dõi
            alert(response.data.message); // Hiển thị thông báo hủy theo dõi thành công
            setIsFolloweds(false);
        } catch (err) {
            console.error(err);
            alert('Error unfollowing company.');
        }
    };

    const calculateRemainingDays = (deadline) => {
        if (!deadline) return 'không xác định';
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 'đã hết hạn';
    };

    const formatUpdateTime = (updateTime) => {
        if (!updateTime) return 'không rõ';
        const now = new Date();
        const updatedDate = new Date(updateTime);
        const diffTime = now - updatedDate;
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        return diffDays > 0
            ? `${diffDays} ngày`
            : diffHours > 0
                ? `${diffHours} giờ`
                : '0 giây';
    };

    return (
        <div className='company-detail'>
            <div className="company-detail-info-container">
                {/* Banner của công ty */}
                <div className="company-detail-info-banner">
                    <img src={company?.banner} alt="Company Banner" />
                </div>

                {/* Phần thông tin chính */}
                <div className="company-detail-info-content">
                    {/* Logo công ty */}
                    <div className="company-detail-info-logo">
                        <img src={company?.logo} alt="Company Logo" />
                    </div>

                    {/* Chi tiết công ty */}
                    <div className="company-detail-info-details">
                        <h2 className="company-detail-info-name">{company?.company_name}</h2>
                        <div className="company-detail-info-meta">
                            <span className="company-detail-info-size">
                                🏢 {company?.quymo} người
                            </span>
                            <span className="company-detail-info-followers">
                                👥 {company?.industry} {/*người theo dõi*/}
                            </span>
                        </div>
                    </div>

                    {/* Nút theo dõi công ty */}
                    {isFollowed ? (
                        <button onClick={() => handleUnfollow(company?._id)} className="company-detail-info-follow-button">
                            + Bỏ theo dõi
                        </button>
                    ) : (
                        <button onClick={() => handleFollow(company?._id)} className="company-detail-info-follow-button">
                            + Theo dõi công ty
                        </button>
                    )}
                </div>
            </div>
            <div className="company-detail-info-wrapper">
                <div className="company-detail-info-main">
                    <div className="company-detail-info-intro">
                        <h2>Giới thiệu công ty</h2>
                        <p>{company?.description}</p>
                        <button className="company-detail-info-toggle">Thu gọn</button>
                    </div>

                    <div className="company-detail-info-jobs">
                        <h3 className='company-detail-info-jobs-header'>We Have Some Jobs For You</h3>
                        <div className='company-detail-info-list-left'>
                            <div className='company-detail-info-list'>
                                <div className="company-detail-info-board-list-container">
                                    {isAuth() ? (
                                        <>
                                            {allJobData.map((job, index) => (
                                                <div key={index} className="company-detail-info-item">
                                                    <div className="company-detail-info-company-logo">
                                                        <img src={company.logo} alt="Company Logo" />
                                                    </div>
                                                    <div className="company-detail-info-sections">
                                                        <Link to={`/jobs/jobdetail/${job._id}`} className="company-detail-info-position-title">
                                                            <h2>{job.title}</h2>
                                                        </Link>
                                                        <p className="company-detail-info-company-name">{job.company}</p>
                                                        <span className="company-detail-info-salary">{job.salary}</span>
                                                        <div className="company-detail-info-details">
                                                            <span className="company-detail-info-location">📍 {job.location}</span>
                                                        </div>
                                                        <div className='company-detail-info-update-style'>
                                                            <p className="company-detail-info-update">
                                                                Cập nhật {formatUpdateTime(job.updated_at)} trước
                                                            </p>
                                                            <span className="company-detail-info-remaining-days">
                                                                ⏳ Còn {calculateRemainingDays(job.application_deadline)} ngày để ứng tuyển
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="company-detail-info-apply-section">
                                                        <button className="company-detail-info-apply-job-button" onClick={() => openApplyForm(job)}>Ứng tuyển</button>
                                                        <div className="company-detail-info-favorite-icon" onClick={() => toggleFavorite(job._id)}>
                                                            <span>{job.saved ? '❤️' : '🤍'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {allJobDataUnAuth.map((job, index) => (
                                                <div key={index} className="company-detail-info-item">
                                                    <div className="company-detail-info-company-logo">
                                                        <img src={company.logo} alt="Company Logo" />
                                                    </div>
                                                    <div className="company-detail-info-sections">
                                                        <Link to={`/jobs/jobdetail/${job._id}`} className="company-detail-info-position-title">
                                                            <h2>{job.title}</h2>
                                                        </Link>
                                                        <p className="company-detail-info-company-name">{job.company}</p>
                                                        <span className="company-detail-info-salary">{job.salary}</span>
                                                        <div className="company-detail-info-details">
                                                            <span className="company-detail-info-location">📍 {job.location}</span>
                                                        </div>
                                                        <div className='company-detail-info-update-style'>
                                                            <p className="company-detail-info-update">
                                                                Cập nhật {formatUpdateTime(job.updated_at)} trước
                                                            </p>
                                                            <span className="company-detail-info-remaining-days">
                                                                ⏳ Còn {calculateRemainingDays(job.application_deadline)} ngày để ứng tuyển
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="company-detail-info-apply-section">
                                                        <button className="company-detail-info-apply-job-button" onClick={() => alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để ứng tuyển.")}>Ứng tuyển</button>
                                                        <div className="company-detail-info-favorite-icon" onClick={() => toggleFavorite(job._id)}>
                                                            <span>{job.saved ? '❤️' : '🤍'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {jobToApply && (
                    <ApplyJob job={jobToApply} onClose={closeApplyForm} />
                )}

                <div className="company-detail-info-sidebar">
                    <div className="company-detail-info-contact">
                        <h3>Thông tin liên hệ</h3>
                        <p>📍 Địa chỉ công ty</p>
                        <p>🏢 {company?.location}</p>
                        <a href={""} target="_blank" rel="noopener noreferrer">
                            📍 Xem bản đồ
                        </a>
                        <div className="map-container">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=..."
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Company Location"
                            ></iframe>
                        </div>
                    </div>
                    <div className="company-detail-info-share">
                        <h3>Chia sẻ công ty tới bạn bè</h3>
                        <p>Sao chép đường dẫn công ty</p>
                        <div className="share-link">
                            <input type="text" value={company?.website} readOnly />
                            <button>📋</button>
                        </div>
                        <p>Chia sẻ qua mạng xã hội</p>
                        <div className="company-detail-info-social-links">
                            <a href="#" className="facebook" aria-label="Facebook"></a>
                            <a href="#" className="twitter" aria-label="Twitter"></a>
                            <a href="#" className="linkedin" aria-label="LinkedIn"></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
