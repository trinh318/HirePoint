import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faTachometerAlt,
    faFileAlt,
    faBuilding,
    faBriefcase,
    faBell,
    faCog,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import { FaBuilding, FaEye, FaUsers, FaTimes } from 'react-icons/fa';
import '../../../styles/recruiterdashboard.css';
import CompanyProfile from './CompanyProfile';
import JobNotificationManager from './JobNotificationManager';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import JobRecruitment from './JobRecruitment';
import FindApplicant from './FindApplicant';
import CreateTest from './CreateTest';
import TestList from "./TestList";
import ProfilePage from "./ProfilePage";


const RecruiterDashboard = () => {
    const [user, setUser] = useState(null); // Lưu trữ dữ liệu người dùng
    const [profile, setProfile] = useState(null); // Lưu trữ dữ liệu người dùng
    const [error, setError] = useState(null); // Lưu trữ lỗi (nếu có)
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard'); // Trạng thái theo dõi menu đang chọn

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const userId = getId();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token từ localStorage

                // Kiểm tra nếu không có token
                if (!token) {
                    setError('Token is missing, please login again.');
                    setLoading(false);
                    return;
                }

                const responseUser = await axios.get('http://localhost:5000/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                });

                const responseProfile = await axios.get(`http://localhost:5000/api/profiles/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                });

                setUser(responseUser.data); // Lưu dữ liệu người dùng

                // Kiểm tra nếu profile không tồn tại
                if (responseProfile.data.profile === null) {
                    setProfile({ first_name: 'Chưa cập nhật', last_name: '' });
                } else {
                    setProfile(responseProfile.data);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to fetch user data.');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const renderContent = () => {
        switch (activeMenu) {
            case 'company_profile':
                return <CompanyProfile />;
            case 'jobs':
                return <JobRecruitment />;
            case 'alerts':
                return <JobNotificationManager />
            case 'find-applicant':
                return <FindApplicant />
            case 'settings':
                return <ProfilePage/>;
            case 'testlist':
                return <TestList />;
            case 'test':
                return <CreateTest />;
            default:
                return <CompanyProfile />;
        }
    };

    return (
        <div className="recruiter-dashboard-container">
            <aside className={`recruiter-dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className='recruiter-dashboard-profile-toggle'>
                    {!isCollapsed && (
                        <div className="recruiter-dashboard-profile">
                            <div className="recruiter-dashboard-user-info">
                                <img src={user?.avatar} className="recruiter-dashboard-avatar-icon" />
                                <h3 className="recruiter-dashboard-name">{profile?.first_name} {profile?.last_name}</h3>
                                <p className="recruiter-dashboard-role">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        className="recruiter-dashboard-toggle"
                        onClick={toggleSidebar}
                        style={{ width: isCollapsed ? '100%' : '20%' }}
                    >
                        {isCollapsed ? '>' : '<'}
                    </button>
                </div>
                <nav className="recruiter-dashboard-menu">
{/**                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        {!isCollapsed && <span>Tổng Quan</span>}
                    </a> */}
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'company_profile' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('company_profile')}
                    >
                        <FontAwesomeIcon icon={faFileAlt} />
                        {!isCollapsed && <span>Hồ Sơ Công ty</span>}
                    </a>
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'jobs' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('jobs')}
                    >
                        <FontAwesomeIcon icon={faBriefcase} />
                        {!isCollapsed && <span>Tuyển dụng</span>}
                    </a>
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'find-applicant' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('find-applicant')}
                    >
                        <FaUsers />
                        {!isCollapsed && <span>Tìm kiếm ứng viên</span>}
                    </a>
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'alerts' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('alerts')}
                    >
                        <FontAwesomeIcon icon={faBell} />
                        {!isCollapsed && <span>Thông Báo </span>}
                    </a>
                 <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('settings')}
                    >
                        <FontAwesomeIcon icon={faCog} />
                        {!isCollapsed && <span>Quản Lý Tài Khoản</span>}
                    </a> 
                    <a
                        href="#"
                        className={`recruiter-dashboard-menu-item ${activeMenu === 'testlist' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('testlist')}
                    >
                        <FontAwesomeIcon icon={faCog} />
                        {!isCollapsed && <span>Quản Lý Bài Test</span>}
                    </a>
                </nav>
                <a href="#"
                    className={`recruiter-dashboard-create-job-alert ${activeMenu === 'test' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('test')}>
                    <FontAwesomeIcon icon={faPlus} />
                    {!isCollapsed && <span>Tạo Bài Test</span>}
                </a>
            </aside>
            <main className="recruiter-dashboard-content">
                {renderContent()} {/* Hiển thị nội dung dựa trên menu */}
            </main>
        </div>
    );
};

export default RecruiterDashboard;
