import React, { useEffect, useState } from 'react';
import { FaBuilding, FaClock, FaDollarSign, FaMapMarkerAlt } from "react-icons/fa";
import "../../../styles/applicantprofile.css";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useParams } from "react-router-dom";  // Import useParams
import axios from 'axios';
import { FaEnvelope, FaPhone, FaGraduationCap, FaEdit, FaMedal, FaUniversity, FaBook, FaAward, FaBriefcase, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { getId } from '../../../libs/isAuth';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

const ApplicantProfile = () => {
    const fileUrl = '';
    const { applicantId } = useParams();
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [files, setFiles] = useState([]);
    const [isConfirm, setIsConfirm] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const jobId = queryParams.get('jobId'); // Lấy jobId từ query string
    const [userId, setUserId] = useState(null);
    console.log("Job ID:", jobId);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/profiles/applicant/profile/${applicantId}`);
                setProfile(response.data);
                setUserId(response.data.profile.user_id._id);
                setLoading(false);
            } catch (error) {
                setError('Error fetching company data');
                setLoading(false);
            }
        };
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/cvfile/files/by-profile/${applicantId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                setFiles(response.data.files);
            } catch (error) {
                setError('Failed to fetch files');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
        fetchProfile();
    }, [applicantId]);


    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Called when the document is loaded successfully
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setCurrentPage(1); // Reset to the first page
    };

    // Handle navigation to the previous page
    const goToPrevPage = () =>
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

    // Handle navigation to the next page
    const goToNextPage = () =>
        setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));

    const click = () => {
        console.log(isConfirm);

    }
    const renderFileViewer = (file) => {
        if (!file || !file.fileName) return <p>No file available</p>;

        if (file.mimeType === 'application/pdf') {
            return (
                <div className="pdf-viewer-container">
                    <div className="pdf-controls">
                        <button onClick={goToPrevPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {numPages}
                        </span>
                        <button onClick={goToNextPage} disabled={currentPage === numPages}>
                            Next
                        </button>
                    </div>
                    <div className="pdf-document">
                        <Document
                            file={file.fileName} // Đảm bảo URL của file PDF hợp lệ
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="pdf-document-container"
                        >
                            <Page pageNumber={currentPage} />
                        </Document>
                    </div>
                </div>
            );
        } else if (file.mimeType === 'application/msword' || file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return (
                <div className="word-viewer-container">
                    <span style={{ fontWeight: 'bold', color: '#333', marginRight: '10px', display: 'block' }}>
                        {file.originalName}
                    </span>                    <a
                        href={`https://docs.google.com/gview?url=${file.fileName}&embedded=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Xem file Word
                    </a>
                </div>
            );
        } else {
            return (
                <div className="generic-file-container">
                    <a href={file.fileName} target="_blank" rel="noopener noreferrer">
                        Xem file
                    </a>
                </div>
            );
        }
    };

    ///////////tạo lịch hẹn
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [timeSlots, setTimeSlots] = useState([]);
    const [startTime, setStartTime] = useState("");

    const handleAddTimeSlot = () => {
        if (startTime) {
            setTimeSlots([
                ...timeSlots,
                { startTime, status: "available" },
            ]);
            setStartTime("");
        }
    };

    const handleOpenForm = () => {
        setIsOpenForm(true);
    }

    const handleConfirm = async () => {
        setIsConfirm(true);
        console.log(jobId, userId, timeSlots)

        for (const timeSlot of timeSlots) {
            try {
                const response = await axios.post('http://localhost:5000/api/interviewschedule', {
                    job_id: jobId,
                    candidate_id: userId,
                    start_time: timeSlot.startTime,
                    status: timeSlot.status,
                });
                console.log(`Success:`, response.data);

            } catch (error) {
                console.error(`Error posting time ${timeSlot.startTime}:`, error.response?.data || error.message);
                alert('Có lỗi xảy ra khi thêm lịch hẹn. Vui lòng thử lại!');
                return;
            }
        }

        alert('Lịch hẹn đã được thêm thành công!');
        setIsOpenForm(false);
    }

    const handleCancle = () => {
        setIsConfirm(false);
        setIsOpenForm(false);
    }
    /////end tạo lịch hẹn

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className='applicant-detail-info-wrapper'>
            <div className="applicants-profile-card">
                <div className="applicants-profile-header">
                    <div className="applicants-profile-info">
                        <img
                            src={profile?.profile?.user_id?.avatar || "https://via.placeholder.com/50"}
                            alt="Profile Avatar"
                            className="applicants-profile-avatar"
                        />
                        <div>
                            <h3 className="applicants-profile-name">{profile?.profile?.first_name} {profile?.profile?.last_name}</h3>
                            <p className="applicants-profile-title">{profile?.profile?.current_industry}</p>
                        </div>
                    </div>
                </div>
                <div className="applicants-profile-details">
                    <p>
                        <FaClock /> {profile?.profile?.years_of_experience} năm
                    </p>
                    <p>
                        <FaDollarSign /> {profile?.profile?.current_salary}
                    </p>
                    <p>
                        <FaMapMarkerAlt /> {profile?.profile?.location}
                    </p>
                </div>
                <div className="applicants-profile-footer">
                    <button className="applicants-profile-view-btn" onClick={click}>
                        Từ chối
                    </button>
                    {isConfirm ? (
                        <button className="applicants-profile-invite-btn">
                            Đã hẹn ứng viên
                        </button>
                    ) : (
                        <button className="applicants-profile-invite-btn" onClick={handleOpenForm}>
                            Hẹn phỏng vấn
                        </button>
                    )}
                    <div className="applicants-profile-actions">
                        <button className="action-btn share-btn">⟲</button>
                        <button className="action-btn save-btn">★</button>
                    </div>
                </div>
                <div className="profile-details-container">
                    <h2>Thông tin chung</h2>
                    <div className="profile-details-table">
                        <div className="profile-detail">
                            <span className="label">Vị trí hiện tại:</span>
                            <span className="value">{profile?.profile?.job_title}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Cấp bậc hiện tại:</span>
                            <span className="value">{profile?.profile?.job_level}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Ngành nghề:</span>
                            <span className="value">{profile?.profile?.current_industry}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Lĩnh Vực:</span>
                            <span className="value">{profile?.profile?.current_field}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Cấp bậc mong muốn:</span>
                            <span className="value">{profile?.profile?.job_level}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Mức lương mong muốn:</span>
                            <span className="value">{profile?.profile?.desired_salary} USD</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Ngày sinh:</span>
                            <span className="value">{new Date(profile?.profile?.date_of_birth).toLocaleDateString()}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Giới tính:</span>
                            <span className="value">{profile?.profile?.gender}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Địa chỉ:</span>
                            <span className="value">{profile?.profile?.specific_address}</span>
                        </div>
                        <div className="profile-detail">
                            <span className="label">Nơi làm việc mong muốn:</span>
                            <span className="value">{profile?.profile?.desired_work_location}</span>
                        </div>
                    </div>
                </div>
                <div className="file-viewer-section">
                    <h3>Uploaded Files:</h3>
                    {files.length > 0 ? (
                        files.map((file, index) => (
                            <div key={index}>
                                {renderFileViewer(file)} {/* Gọi renderFileViewer để hiển thị file */}
                            </div>
                        ))
                    ) : (
                        <p>No files available</p>
                    )}
                </div>
            </div>
            <div className="applicants-profile-card-right">
                <div className="applicant-info-card">
                    <div className="user-info-details">
                        <div className='edu-info'>
                            <div className="edu-card-header">
                                <h3 className="user-basic-info-header">Thông tin học vấn</h3>
                            </div>
                            {profile?.academic?.length > 0 ? (
                                profile?.academic?.map((academic, academic_id) => (
                                    <div key={academic_id} className="edu-card-body">
                                        <h3 className="edu-title">{academic?.school_name}</h3>
                                        <p className="edu-subtitle">{academic?.industry}</p>
                                        <ul className="edu-achievements">
                                            <li>
                                                <FaMedal className="edu-icon" />
                                                <span>{academic?.start_date} - {academic?.end_date}</span>
                                            </li>
                                            <li>
                                                <FaBook className="edu-icon" />
                                                <span>{academic?.achievements}</span>
                                            </li>
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <p>Không có thông tin học vấn.</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Form kinh nghiệm làm việc *********************************************/}
                <div className="applicant-info-card">
                    <div className="user-info-3">
                        <h3 className='user-basic-info-header'>Kinh nghiệm làm việc</h3>
                        {profile?.experience?.length > 0 ? (
                            profile?.experience?.map((exp) => (
                                <div key={exp._id} className="user-info-4">
                                    {/* Tiêu đề công việc và công ty */}
                                    <div className="card-header">
                                        <div>
                                            <h3 className="card-title">{exp.position}</h3>
                                            <p className="card-company"><FaBuilding className="company-icon" /> {exp.company}</p>
                                        </div>
                                    </div>

                                    {/* Thời gian làm việc */}
                                    <div className="card-period">
                                        <FaCalendarAlt className="calendar-icon" />
                                        <span className="card-company">Từ Tháng {exp.startMonth} đến Tháng {exp.endMonth}</span>
                                    </div>

                                    {/* Mô tả công việc */}
                                    <div className="card-description wrap-text">
                                        {exp.describe}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Chưa có kinh nghiệm làm việc nào.</p>
                        )}
                    </div>
                </div>
                {/* Form kỹ năng *********************************************/}
                <div className="applicant-info-card">
                    <div className="user-info-3">
                        <h3 className='user-basic-info-header'>Kỹ năng</h3>
                        <div>
                            <ul className="skills-list">
                                {profile?.profile?.skills.length > 0 ? (
                                    profile?.profile?.skills.map((skill, index) => (
                                        <li key={index} className="skill-item">
                                            <FaCheckCircle className="skill-icon" />
                                            {skill}
                                        </li>
                                    ))
                                ) : (
                                    <li>Không có kỹ năng nào được thêm vào.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                {isOpenForm && (
                    <>
                        <div className='create-appointment-overlay'>
                            <div className="create-appointment-container">
                                <h2 className="create-appointment-title">Tạo Lịch Hẹn Phỏng Vấn</h2>
                                <div className="create-appointment-form">
                                    <div className="create-appointment-field">
                                        <label>Thời gian bắt đầu</label>
                                        <input
                                            type="datetime-local"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="create-appointment-input"
                                        />
                                        <button
                                            onClick={handleAddTimeSlot}
                                            className="create-appointment-button"
                                        >
                                            Thêm lịch
                                        </button>
                                    </div>
                                </div>
                                <div className="create-appointment-list">
                                    <h3>Các lịch hẹn đã thêm</h3>
                                    {timeSlots.map((slot, index) => (
                                        <div key={index} className="create-appointment-slot">
                                            <p>Công việc: {"slot.jobId"}</p>
                                            <p>Người phỏng vấn: {"slot.interviewerId"}</p>
                                            <p>Thời gian: {new Date(slot.startTime).toLocaleString()}</p>
                                            <p>Trạng thái: {slot.status}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    className="create-appointment-button-save"
                                >
                                    Xác nhận
                                </button>
                                <button
                                    onClick={handleCancle}
                                    className="create-appointment-button-save"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};

export default ApplicantProfile;