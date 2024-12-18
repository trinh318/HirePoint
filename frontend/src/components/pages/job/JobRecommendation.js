import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SearchBar from '../../UI/SearchBar';
import ApplyJob from '../applicant/ApplyJob';
import '../../../styles/jobrecommendation.css';
import { isAuth, getId } from '../../../libs/isAuth';
import axios from 'axios';

export default function JobRecommendation() {
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [jobToApply, setJobToApply] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const jobsPerPage = 8;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = getId();

    const currentJobs = recommendedJobs.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);
    const totalPages = Math.ceil(recommendedJobs.length / jobsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const toggleFavorite = (jobTitle) => {
        setFavorites((prevFavorites) => {
            if (prevFavorites.includes(jobTitle)) {
                return prevFavorites.filter((title) => title !== jobTitle);
            } else {
                return [...prevFavorites, jobTitle];
            }
        });
    };

    const openApplyForm = (job) => {
        if (isAuth()) {
            setJobToApply(job);
        } else {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        }
    };

    const closeApplyForm = () => {
        setJobToApply(null);
    };

    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/jobrecomend/recommend-jobs', { userId });
                setRecommendedJobs(response.data.recommendedJobs);
            } catch (err) {
                setError('Failed to fetch recommended jobs');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedJobs();
    }, [userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }
    const calculateRemainingDays = (deadline) => {
        const today = new Date();  // Get the current date
        const deadlineDate = new Date(deadline);  // Convert application_deadline to a Date object
    
        // Calculate the difference in milliseconds
        const diffInMs = deadlineDate - today;
    
        // Convert the difference to days
        const diffInDays = Math.ceil(diffInMs / (1000 * 3600 * 24));  // 1000ms * 3600s * 24h
    
        return diffInDays >= 0 ? diffInDays : 0;  // Ensure non-negative number of days
    };
    return (
        <div className='job-recommend-board'>
            <div className="job-recommend-header">
                <SearchBar />
                <h1>Việc làm phù hợp</h1>
                <p>Khám phá cơ hội việc làm được gợi ý dựa trên mong muốn, kinh nghiệm và kỹ năng của bạn. Đón lấy sự nghiệp thành công với công việc phù hợp nhất dành cho bạn!</p>
            </div>
            <div className="job-recommend-banner">
                <p className="job-recommend-result">Tìm thấy <span className="job-recommend-result-count">{recommendedJobs.length}</span> việc làm phù hợp với bạn.</p>
            </div>
            <div className='job-recommend-board-list'>
                <div className='job-recommend-board-list-left'>
                    <div className='job-list'>
                        <div className="job-recommend-board-list-container">
                            {currentJobs.map((job, index) => (
                                <div key={index} className="job-recommend-info-item-card">
                                    <div className="job-recommend-board-company-logo">
                                        <img src={job.companyLogo} alt="Company Logo" />
                                    </div>
                                    <div className="job-recommend-info-sections">
                                        <Link to={`/jobs/jobdetail/${job.jobId}`} className="job-recommend-info-position-title">
                                            <h2>{job.jobTitle}</h2>
                                        </Link>
                                        <p className="job-recommend-info-company-name">{job.companyName}</p>
                                        <span className="job-recommend-salary-job-info">{job.salary}</span>
                                        <div className="job-recommend-info-details">
                                            <span className="job-recommend-location-job-info">📍 {job.location}</span>
                                            <span className="job-recommend-remaining-days">⏳Còn {calculateRemainingDays(job.application_deadline)} ngày để ứng tuyển</span>
                                        </div>
                                    </div>
                                    <div className="job-recommend-salary-apply">
                                        <button className="job-recommend-apply-button" onClick={() => openApplyForm(job)}>Ứng tuyển</button>
                                        <div className="job-recommend-info-favorite-icon" onClick={() => toggleFavorite(job.jobTitle)}>
                                            <span>{favorites.includes(job.jobTitle) ? '❤️' : '🤍'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pagination-indicator">
                            <div className="nav-buttons">
                                <button className="nav-button" onClick={prevPage} disabled={currentPage === 0}>&#8249;</button>
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        className={`pagination-dot ${index === currentPage ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(index)}
                                    />
                                ))}
                                <button className="nav-button" onClick={nextPage} disabled={currentPage === totalPages - 1}>&#8250;</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Additional content */}
            </div>

            {jobToApply && (
                <ApplyJob job={jobToApply} onClose={closeApplyForm} />
            )}
        </div>
    );
}
