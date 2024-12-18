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
import '../../../styles/applicantdashboard.css';
import Profile from './Profile';
import MyCompany from './MyCompany';
import MyJob from './MyJob';
import MyAppointment from './MyAppointment';
import JobNotificationManager from './JobNotificationManager';
import ProfilePage from './ProfilePage';

import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { getId } from '../../../libs/isAuth';

const ApplicantDashboard = () => {
    const [user, setUser] = useState(null); // Lưu trữ dữ liệu người dùng
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null); // Lưu trữ lỗi (nếu có)
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchParams] = useSearchParams();
    const menu = searchParams.get('menu') || 'dashboard'; // Lấy menu từ query params
    const [activeMenu, setActiveMenu] = useState(menu);

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
            case 'dashboard':
                return <h2>Tổng Quan</h2>;
            case 'profile':
                return <Profile />;
            case 'company':
                return <MyCompany />;
            case 'jobs':
                return <MyJob />;
            case 'alerts':
                return <JobNotificationManager />
            case 'settings':
                return <ProfilePage/>;
            case 'appointment':
                return <MyAppointment />;
            default:
                return <Profile />;
        }
    };

    return (
        <div className="applicant-dashboard-container">
            <aside className={`applicant-dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className='applicant-dashboard-profile-toggle'>
                    {!isCollapsed && (
                        <div className="applicant-dashboard-profile">
                            <div className="applicant-dashboard-user-info">
                                <img src={user?.avatar} className="applicant-dashboard-avatar-icon" />
                                <h3 className="applicant-dashboard-name">{profile?.first_name} {profile?.last_name}</h3>
                                <p className="applicant-dashboard-role">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        className="applicant-dashboard-toggle"
                        onClick={toggleSidebar}
                        style={{ width: isCollapsed ? '100%' : '20%' }}
                    >
                        {isCollapsed ? '>' : '<'}
                    </button>
                </div>
                <nav className="applicant-dashboard-menu">
{/**                    <Link
                        to="?menu=dashboard"
                        className={`applicant-dashboard-menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('dashboard')}
                    >
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        {!isCollapsed && <span>Tổng Quan</span>}
                    </Link> */}
                    <Link
                        to="?menu=profile"
                        className={`applicant-dashboard-menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('profile')}
                    >
                        <FontAwesomeIcon icon={faFileAlt} />
                        {!isCollapsed && <span>Hồ Sơ Của Tôi</span>}
                    </Link>
                    <Link
                        to="?menu=company"
                        className={`applicant-dashboard-menu-item ${activeMenu === 'company' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('company')}
                    >
                        <FontAwesomeIcon icon={faBuilding} />
                        {!isCollapsed && <span>Công Ty Của Tôi</span>}
                    </Link>
                    <Link
                        to="?menu=jobs"
                        className={`applicant-dashboard-menu-item ${activeMenu === 'jobs' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('jobs')}
                    >
                        <FontAwesomeIcon icon={faBriefcase} />
                        {!isCollapsed && <span>Việc Làm Của Tôi</span>}
                    </Link>
                    <Link
                        to="?menu=alerts"
                        className={`applicant-dashboard-menu-item ${activeMenu === 'alerts' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('alerts')}
                    >
                        <FontAwesomeIcon icon={faBell} />
                        {!isCollapsed && <span>Thông Báo Việc Làm</span>}
                    </Link>
                  <Link
                        to="?menu=settings"
                        className={`applicant-dashboard-menu-item ${activeMenu === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveMenu('settings')}
                    >
                        <FontAwesomeIcon icon={faCog} />
                        {!isCollapsed && <span>Quản Lý Tài Khoản</span>}
                    </Link> 
                </nav>
                <Link to="?menu=my-appointment"
                    className={`applicant-dashboard-create-job-alert ${activeMenu === 'settings' ? 'appointment' : ''}`}
                    onClick={() => setActiveMenu('appointment')}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {!isCollapsed && <span>Lịch hẹn phỏng vấn</span>}
                </Link>
            </aside>
            <main className="applicant-dashboard-content">
                {renderContent()} {/* Hiển thị nội dung dựa trên menu */}
            </main>
        </div>
    );
};

export default ApplicantDashboard;
