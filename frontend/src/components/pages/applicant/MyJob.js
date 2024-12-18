import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import '../../../styles/myjob.css';
import { FaClipboardCheck, FaBookmark, FaEye, FaTimes, FaEnvelopeOpenText } from 'react-icons/fa';
import ApplyJob from './ApplyJob';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';


const jobInvitationsData = [
    {
        id: 1,
        title: "Nhân Viên Kế Toán Tổng Hợp",
        company: "Công ty TNHH ABC",
        location: "Hà Nội",
        salary: "12 - 15 triệu",
        invitationDate: "15/11/2024",
        message: "Chúng tôi rất ấn tượng với hồ sơ của bạn. Hãy liên hệ để sắp xếp buổi phỏng vấn.",
    },
    {
        id: 2,
        title: "Chuyên Viên Marketing",
        company: "Công ty Cổ phần XYZ",
        location: "Hồ Chí Minh",
        salary: "20 - 25 triệu",
        invitationDate: "12/11/2024",
        message: "Công ty đang tìm kiếm chuyên viên có kinh nghiệm. Chúng tôi mong được hợp tác với bạn.",
    },
];

const jobData = [
    {
        id: 1,
        logo: 'logo1.png',
        title: 'Giáo Viên Văn Từ 1 Năm Kinh Nghi...',
        company: 'Công ty TNHH Tư vấn giải pháp Giáo dục Minh Hoàng',
        salary: 'Trên 10 triệu',
        location: 'Hà Nội',
        updateTime: '2 giờ',
        remainingDays: 10
    },
    {
        id: 2,
        logo: 'logo2.png',
        title: 'Chuyên Viên Đào Tạo Ngành F&B',
        company: 'Công ty Cổ phần Tầm Nhìn Quốc Tế Aladdin',
        salary: '15 - 20 triệu',
        location: 'Hà Nội',
        updateTime: '1 ngày',
        remainingDays: 5
    },
    {
        id: 3,
        logo: 'logo3.png',
        title: 'Trưởng Phòng QA Làm Việc Tại Hà Nội',
        company: 'Công ty CP Xây dựng Kết cấu thép IPC',
        salary: 'Tới 35 triệu',
        location: 'Hà Nội & 2 nơi khác',
        updateTime: '3 ngày',
        remainingDays: 7
    },
    {
        id: 4,
        logo: 'logo4.png',
        title: 'Nhân Viên Kinh Doanh Bất Động Sản',
        company: 'Công ty Bất Động Sản ABC',
        salary: '10 - 15 triệu',
        location: 'Hà Nội',
        updateTime: '5 ngày',
        remainingDays: 12
    },
    {
        id: 5,
        logo: 'logo5.png',
        title: 'Chuyên Viên Marketing Online',
        company: 'Công ty TNHH Digital Marketing',
        salary: '12 - 18 triệu',
        location: 'Hồ Chí Minh',
        updateTime: '1 tuần',
        remainingDays: 8
    },
    {
        id: 6,
        logo: 'logo6.png',
        title: 'Kỹ Sư Xây Dựng Dân Dụng',
        company: 'Công ty Xây Dựng XYZ',
        salary: '15 - 25 triệu',
        location: 'Đà Nẵng',
        updateTime: '2 tuần',
        remainingDays: 15
    }
]

const MyJob = () => {
    ////////Apply job/////////
    const [jobList, setJobList] = useState(jobData); // Dữ liệu danh sách công việc
    const [favoriteJobs, setFavoriteJobs] = useState([]); // Danh sách công việc yêu thích
    const [jobToApply, setJobToApply] = useState(null); // Công việc được chọn để ứng tuyển
    const [noJobsMessage, setNoJobsMessage] = useState(''); // Thêm state cho thông báo khi không có job

    const handleFavoriteToggle = (jobTitle) => {
        setFavoriteJobs((prevFavorites) =>
            prevFavorites.includes(jobTitle)
                ? prevFavorites.filter((title) => title !== jobTitle)
                : [...prevFavorites, jobTitle]
        );
    };

    const openApplyForm = (job) => {
        setJobToApply(job); // Gán công việc được chọn
    };

    const closeApplyForm = () => {
        setJobToApply(null); // Đóng form ứng tuyển
    };

    //phân trang 
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const jobsPerPage = 3; // Số lượng job mỗi trang

    // Tính toán các job hiển thị
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobData.slice(indexOfFirstJob, indexOfLastJob); // Các job hiện tại


    const totalPages = Math.ceil(jobData.length / jobsPerPage); // Tổng số trang

    // Điều hướng tới trang trước
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Điều hướng tới trang tiếp theo
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const [activeTab, setActiveTab] = useState('appliedJobs');

    // Chuyển đổi tab
    const handleTabClick = (tab) => setActiveTab(tab);

    const [favorites, setFavorites] = useState([]);

    const toggleFavorite = (jobTitle) => {
        setFavorites((prevFavorites) => {
            if (prevFavorites.includes(jobTitle)) {
                return prevFavorites.filter((title) => title !== jobTitle);
            } else {
                return [...prevFavorites, jobTitle];
            }
        });
    };

    /// menu xóa của dấu ba chấm
    const [menuIndex, setMenuIndex] = useState(null); // Track which menu is open

    const toggleMenu = (index) => {
        if (menuIndex === index) {
            setMenuIndex(null); // Close menu if already open
        } else {
            setMenuIndex(index); // Open menu for the clicked card
        }
    };

    // Fetching job data when component mounts
    const [applications, setApplications] = useState([]); // State lưu danh sách đơn ứng tuyển
    const [error, setError] = useState(null); // State lưu lỗi nếu có
    const [loading, setLoading] = useState(true); // State lưu trạng thái tải dữ liệu
    const [savedJobs, setSavedJobs] = useState([]);
    const [allViewedJobs, setAllViewedJobs] = useState([]);

    useEffect(() => {
        const userId = getId(); // Gọi hàm getId() để lấy userId từ frontend

        const fetchApplications = async () => {
            try {
                setLoading(true); // Bắt đầu tải dữ liệu
                const response = await axios.get(`http://localhost:5000/api/applications/myapplicantion/${userId}`);
                setApplications(response.data); // Lưu danh sách ứng tuyển
            } catch (err) {
                setError('Có lỗi xảy ra khi tải danh sách ứng tuyển.');
                console.error(err);
            } finally {
                setLoading(false); // Kết thúc trạng thái tải
            }
        };

        const fetchSavedJobs = async () => {
            try {
                setLoading(true); // Bắt đầu tải dữ liệu
                const response = await axios.get(`http://localhost:5000/api/savedjobs/mysavedjobs/${userId}`);
                setSavedJobs(response.data); // Lưu danh sách công việc đã lưu
            } catch (err) {
                setError('Có lỗi xảy ra khi tải danh sách công việc đã lưu.');
                console.error(err);
            } finally {
                setLoading(false); // Kết thúc trạng thái tải
            }
        };

        const fetchViewedJob = async () => {
            try {
                setLoading(true); // Bắt đầu tải dữ liệu
                const response = await axios.get(`http://localhost:5000/api/viewedjobs/viewed-jobs/${userId}`);
                // Kiểm tra dữ liệu nhận về và chuyển thành mảng nếu không phải mảng
                setAllViewedJobs(response.data.viewedJobs); // Lưu danh sách job đã xem
            } catch (err) {
                setError('Có lỗi xảy ra khi tải danh sách các công việc đã xem.');
                console.error(err);
            } finally {
                setLoading(false); // Kết thúc trạng thái tải
            }
        };

        if (userId) {
            fetchApplications(); // Gọi hàm lấy danh sách ứng tuyển
            fetchSavedJobs();    // Gọi hàm lấy danh sách công việc đã lưu
            fetchViewedJob();
        }
    }, []);

    const handleDelete = (jobId) => {
        handleUnsaveJob(jobId);
        console.log("job id", jobId);
    };
    // cong việc đang ứng tuyển 
    // Change based on tab selection
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
            }
        } catch (err) {
            console.error('Error unsaving job:', err.message);
            alert('Có lỗi xảy ra khi xóa công việc đã lưu.');
        }
    };
    // thư mời ứng tuyển
    const [jobInvitationsData, setJobInvitationsData] = useState([]);
    const userId = getId(); // Hàm lấy ID người dùng từ đâu đó
    const fetchInvitations = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/invitation/invitations-by-candidate/${userId}`);
            if (response.data.invitations) {
                setJobInvitationsData(response.data.invitations);
                console.log("Thông tin việc làm: ", response.data.invitations);
            } else {
                console.log("Không có thư mời nào được trả về");
            }
        } catch (error) {
            console.error("Lỗi khi tải thư mời:", error);
        }
    };
    useEffect(() => {
        if (userId) {
            console.log("thu moi", userId)
            setLoading(true);
            // Gọi API để lấy thư mời của ứng viên
            axios.get(`http://localhost:5000/api/invitation/invitations-by-candidate/${userId}`)
                .then(response => {
                    if (response.data.invitations) {
                        setJobInvitationsData(response.data.invitations); // Lưu dữ liệu thư mời vào state
                        console.log("thong tin viec ", response.data.invitations);
                    } else {
                        console.log("Không có thư mời nào được trả về");
                    }
                })
                .catch(error => {
                    console.error("Lỗi khi tải thư mời:", error);
                })
                .finally(() => {
                    setLoading(false); // Đảm bảo loading tắt sau khi dữ liệu được tải
                });
        }
    }, [userId]);

    const handleAccept = (invitationId) => {
        setLoading(true); // Bắt đầu quá trình tải
    
        if (!invitationId) {
            console.error('Invitation ID is undefined!');
            setLoading(false); // Tắt loading ngay nếu không có invitationId
            return;
        }
    
        axios.post(`http://localhost:5000/api/invitation/accept/${invitationId}`)
            .then(response => {
                console.log(response.data.message);
                alert('Bạn đã chấp nhận lời mời và đang chờ nhà tuyển dụng xác nhận lịch phỏng vấn!');
            })
            .catch(error => {
                console.error('Lỗi khi chấp nhận lời mời:', error.response?.data?.message || error.message);
                alert('Đã xảy ra lỗi khi chấp nhận lời mời. Vui lòng thử lại!');
            })
            .finally(() => {
                fetchInvitations(userId); // Đảm bảo loading tắt sau khi dữ liệu được tải
            });
    };
    
    const handleReject = (invitationId) => {
        setLoading(true);
        if (!invitationId) {
            console.error('Invitation ID is undefined!');
            return;
        }
    
        axios.post(`http://localhost:5000/api/invitation/reject/${invitationId}`)
            .then(response => {
                console.log(response.data.message);
                alert('Bạn đã từ chối thư mời và nhà tuyển dụng đã được thông báo!');
                // Cập nhật lại dữ liệu nếu cần (ví dụ, xóa thư mời đã từ chối)
            })
            .catch(error => {
                console.error('Lỗi khi từ chối thư mời:', error.response?.data?.message || error.message);
                alert('Đã xảy ra lỗi khi từ chối thư mời. Vui lòng thử lại!');
            })
            .finally(() => {
                fetchInvitations(userId); // Tắt trạng thái loading sau khi thực thi
            });
    };
    return (
        <div className='my-job'>
            {/* Phần tiêu đề "Công ty của tôi" */}
            <div className="my-job-header">
                <h2>Việc Làm Của Tôi</h2>
            </div>
            <div className="my-job-container">
                {/* Thanh điều hướng tab */}
                <div className="my-job-tabs">
                    <button
                        className={`my-job-tab ${activeTab === 'appliedJobs' ? 'active' : ''}`}
                        onClick={() => handleTabClick('appliedJobs')}
                    >
                        <FaClipboardCheck /> Việc làm đã ứng tuyển
                    </button>
                    <button
                        className={`my-job-tab ${activeTab === 'savedJobs' ? 'active' : ''}`}
                        onClick={() => handleTabClick('savedJobs')}
                    >
                        <FaBookmark /> Việc làm đã lưu
                    </button>
                    <button
                        className={`my-job-tab ${activeTab === 'viewedJobs' ? 'active' : ''}`}
                        onClick={() => handleTabClick('viewedJobs')}
                    >
                        <FaEye /> Việc làm đã xem
                    </button>
                    <button
                        className={`my-job-tab ${activeTab === 'jobInvitations' ? 'active' : ''}`}
                        onClick={() => handleTabClick('jobInvitations')}
                    >
                        <FaEnvelopeOpenText /> Thư mời ứng tuyển
                    </button>
                </div>

                {/* Nội dung tab "Việc làm đã ứng tuyển" */}
                {activeTab === 'appliedJobs' && (

                    <div className="my-job-list">
                        {applications.length > 0 ? (
                            applications.map((application, index) => (
                                <div key={index} className="my-job-info-item-card">
                                    <div className="my-job-board-company-logo">
                                        <img
                                            src={application.job_id?.company_id?.logo || 'default-logo.png'} // Display company logo, with a fallback to a default image
                                            // Display company logo, with a fallback to a default image
                                            alt="Company Logo" style={{ width: '70px', height: '70px' }}
                                        />
                                    </div>
                                    <div className="my-job-info-sections">
                                        <Link to={`/jobs/jobdetail/${application.job_id?._id}`} className="my-job-info-position-title">
                                            <h2>{application.job_id?.title}</h2> {/* Display the job title */}
                                        </Link>
                                        <p className="my-job-info-company-name">{application.job_id?.company_id?.company_name}</p> {/* Display the company name */}
                                        <div className="my-job-info-details">
                                            <span className="my-salary-job-info">
                                                {application.job_id?.salary ? application.job_id?.salary : 'Chưa có mức lương'}
                                            </span> {/* Display the job salary, with a fallback if not available */}
                                            <span className="my-location-job-info">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} /> {application.job_id?.company_id?.location || 'Chưa có địa chỉ'} {/* Display location */}
                                            </span>
                                            <span className="my-remaining-days">
                                                <FontAwesomeIcon icon={faClock} /> Còn{' '}
                                                {isNaN(
                                                    Math.max(
                                                        Math.ceil(
                                                            (new Date(application.job_id?.application_deadline) - new Date()) /
                                                            (1000 * 60 * 60 * 24)
                                                        ),
                                                        0
                                                    )
                                                )
                                                    ? 0 // Nếu NaN, hiển thị 0
                                                    : Math.max(
                                                        Math.ceil(
                                                            (new Date(application.job_id?.application_deadline) - new Date()) /
                                                            (1000 * 60 * 60 * 24)
                                                        ),
                                                        0
                                                    )}{' '}
                                                ngày để ứng tuyển{/* Display remaining days */}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>Chưa có đơn ứng tuyển nào.</div> // Display a message if no applications
                        )}
                    </div>
                )}

                {/* Nội dung tab "Việc làm đã lưu" */}
                {activeTab === 'savedJobs' && (
                    <div className="my-job-list">
                        {savedJobs.length > 0 ? (
                            savedJobs.map((job, job_id) => (
                                <div key={job_id} className="my-job-info-item-card">
                                    <div className="my-job-board-company-logo" style={{ width: '70px', height: '70px' }}>
                                        <img src={job.job_id?.company_id?.logo} alt="Company Logo" />
                                    </div>
                                    <div className="my-job-info-sections">
                                        <Link to={`/jobs/jobdetail/${job.job_id?._id}`} className="my-job-info-position-title">
                                            <h2>{job.job_id?.title}</h2>
                                        </Link>
                                        <p className="my-job-info-company-name">{job.job_id?.company_id?.industry}</p>
                                        <div className="my-job-info-details">
                                            <span className="my-salary-job-info">{job.job_id?.salary}</span>

                                            <span className="my-location-job-info">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} /> {job.job_id?.location}
                                            </span>
                                            <span className="my-remaining-days">
                                                <FontAwesomeIcon icon={faClock} /> Còn{' '}
                                                {isNaN(
                                                    Math.max(
                                                        Math.ceil(
                                                            (new Date(job.job_id?.application_deadline) - new Date()) /
                                                            (1000 * 60 * 60 * 24)
                                                        ),
                                                        0
                                                    )
                                                )
                                                    ? 0 // Nếu NaN, hiển thị 0
                                                    : Math.max(
                                                        Math.ceil(
                                                            (new Date(job.job_id?.application_deadline) - new Date()) /
                                                            (1000 * 60 * 60 * 24)
                                                        ),
                                                        0
                                                    )}{' '}
                                                ngày để ứng tuyển
                                            </span>
                                        </div>
                                    </div>
                                    <div className="my-job-salary-apply">
                                        <button className="my-apply-button" onClick={() => openApplyForm(job.job_id)}>Ứng tuyển</button>
                                        <div className="my-job-info-menu">
                                            <FontAwesomeIcon
                                                icon={faEllipsisV}
                                                className="my-ellipsis-icon"
                                                onClick={() => toggleMenu(job.job_id?._id)}
                                            />
                                            {menuIndex === job_id && (
                                                <div className="my-menu-dropdown">
                                                    <button onClick={() => handleDelete(job.job_id?._id)}>Xóa</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Chưa có công việc nào được lưu.</p>
                        )}
                        {/* Pagination */}
                        <div className="custom-pagination">
                            <button
                                className="pagination-button"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <span className="pagination-info">
                                {currentPage}/{totalPages}
                            </span>
                            <button
                                className="pagination-button"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Nội dung tab "Việc làm đã xem" */}
                {activeTab === 'viewedJobs' && (
                    <div className="my-job-list">
                        {allViewedJobs.length > 0 ? (
                            allViewedJobs.map((job, job_id) => (
                                <div key={job_id} className="my-job-info-item-card">
                                    <div className="my-job-board-company-logo" style={{ width: '70px', height: '70px' }}>
                                        <img src={job.job_id?.company_id?.logo} alt="Company Logo" />
                                    </div>
                                    <div className="my-job-info-sections">
                                        <Link to={`/jobs/jobdetail/${job.job_id?._id}`} className="my-job-info-position-title">
                                            <h2>{job.job_id?.title}</h2>
                                        </Link>
                                        <p className="my-job-info-company-name">{job.job_id?.company_id?.industry}</p>
                                        <div className="my-job-info-details">
                                            <span className="my-salary-job-info">{job.job_id?.salary}</span>

                                            <span className="my-location-job-info">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} /> {job.job_id?.location}
                                            </span>
                                            <span className="my-remaining-days">
                                                <FontAwesomeIcon icon={faClock} /> Còn{' '}
                                                {isNaN(
                                                    Math.max(
                                                        Math.ceil(
                                                            (new Date(job.job_id?.application_deadline) - new Date()) /
                                                            (1000 * 60 * 60 * 24)
                                                        ),
                                                        0
                                                    )
                                                )
                                                    ? 0 // Nếu NaN, hiển thị 0
                                                    : Math.max(
                                                        Math.ceil(
                                                            (new Date(job.job_id?.application_deadline) - new Date()) /
                                                            (1000 * 60 * 60 * 24)
                                                        ),
                                                        0
                                                    )}{' '}
                                                ngày để ứng tuyển
                                            </span>
                                        </div>
                                    </div>
                                    <div className="my-job-salary-apply">
                                        <button className="my-apply-button" onClick={() => openApplyForm(job.job_id)}>Ứng tuyển</button>
                                        <div className="my-job-info-menu">
                                            <FontAwesomeIcon
                                                icon={faEllipsisV}
                                                className="my-ellipsis-icon"
                                                onClick={() => toggleMenu(job.job_id?._id)}
                                            />
                                            {menuIndex === job_id && (
                                                <div className="my-menu-dropdown">
                                                    <button onClick={() => handleDelete(job.job_id?._id)}>Xóa</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Chưa có công việc nào được lưu.</p>
                        )}
                        {/* Pagination */}
                        <div className="custom-pagination">
                            <button
                                className="pagination-button"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <span className="pagination-info">
                                {currentPage}/{totalPages}
                            </span>
                            <button
                                className="pagination-button"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Nội dung tab "Thư mời ứng tuyển" */}
                {activeTab === 'jobInvitations' && (

                    <div className="my-job-list">
                        {jobInvitationsData.length > 0 ? (
                            jobInvitationsData.map((invitation) => (
                                <div className="my-job-info-item-card">
                                    <div className="my-job-board-company-logo">
                                        <img
                                            src={invitation.job.company_id?.logo}
                                            alt="Company Logo"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    </div>
                                    <div className="my-job-info-sections">
                                        <Link to={`/jobs/jobdetail/${invitation.job._id}`} className="my-job-info-position-title">
                                            <h2>{invitation.job.title}</h2>
                                        </Link>
                                        <p className="my-job-info-company-name">{invitation.job.company_id?.company_name}</p>
                                        <div className="my-job-info-details">
                                            <span className="my-salary-job-info">{invitation.job.salary}</span>
                                            <span className="my-location-job-info">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} /> {invitation.job.location}
                                            </span>
                                            <span className="my-invitation-date">
                                                <FontAwesomeIcon icon={faClock} /> Thư mời ngày: {invitation.createdAt}
                                            </span>
                                        </div>
                                        <div className="my-job-recruiter-message">
                                            <p><strong>Lời nhắn:</strong></p>
                                            <div className="message-content">{invitation.message}</div>
                                        </div>
                                        {/* Container for buttons */}
                                        <div className="my-job-action-buttons">
                                            <button onClick={() => handleAccept(invitation.invitationId)} className="company-profile-unfollow accept">
                                                <FaTimes /> Chấp nhận
                                            </button>
                                            <button onClick={() => handleReject(invitation.invitationId)} className="company-profile-unfollow reject">
                                                <FaTimes /> Từ chối
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            ))

                        ) : (
                            <div className="my-job-empty-state">
                                <p>Bạn chưa nhận được thư mời ứng tuyển nào.</p>
                            </div>
                        )}

                    </div>

                )}


                {jobToApply && (
                    <ApplyJob job={jobToApply} onClose={closeApplyForm} />

                )}

            </div>
        </div>
    );
};

export default MyJob;
