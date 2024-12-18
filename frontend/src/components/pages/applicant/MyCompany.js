import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import '../../../styles/mycompany.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';

import { FaBuilding, FaEye, FaUsers, FaTimes } from 'react-icons/fa';

const MyCompany = () => {
    const [activeTab, setActiveTab] = useState('followCompany');


    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = getId(); // Gọi getId() để lấy userId

        const fetchFollowedCompanies = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/followedcompanies/followed-companies/${userId}`);
                setCompanies(response.data); // Lưu dữ liệu công ty vào state
            } catch (err) {
                setError('There was an error fetching followed companies.');
                console.error(err);
            }
        };

        if (userId) {
            fetchFollowedCompanies();
        }
    }, []);
    // Chạy 1 lần khi component mount

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
            setCompanies(prevCompanies => prevCompanies.filter(company => company._id !== companyId));
            alert(response.data.message); // Hiển thị thông báo hủy theo dõi thành công
        } catch (err) {
            console.error(err);
            alert('Error unfollowing company.');
        }
    };

    // Chuyển đổi tab
    const handleTabClick = (tab) => setActiveTab(tab);

    return (
        <div className='my-company'>
            {/* Phần tiêu đề "Công ty của tôi" */}
            <div className="my-company-header">
                <h2>Công Ty Của Tôi</h2>
            </div>
            <div className="my-company-container">


                {/* Thanh điều hướng tab */}
                <div className="my-company-tabs">
                    {/**                    <button
                        className={`my-company-tab ${activeTab === 'profileView' ? 'active' : ''}`}
                        onClick={() => handleTabClick('profileView')}
                    >
                        <FaEye /> Nhà tuyển dụng xem hồ sơ
                    </button> */}
                    <button
                        className={`my-company-tab ${activeTab === 'followCompany' ? 'active' : ''}`}
                        onClick={() => handleTabClick('followCompany')}
                    >
                        <FaUsers /> Theo dõi công ty
                    </button>
                </div>

                {/* Nội dung tab "Nhà tuyển dụng xem hồ sơ" */}
                {activeTab === 'profileView' && (
                    <div className="my-company-content profile-view">
                        <div className="my-company-empty-state">
                            <p>Nhà tuyển dụng không thể xem hồ sơ của bạn</p>
                            <a href="#" className="my-company-enable-view">
                                Bật chế độ cho phép nhà tuyển dụng xem hồ sơ
                            </a>
                        </div>
                    </div>
                )}

                {/* Nội dung tab "Theo dõi công ty" */}
                {activeTab === 'followCompany' && (
                    <div className="my-company-content followed-companies">
                        {companies.length > 0 ? (
                            companies.map(company => (
                                <div key={company?._id} className="my-company-item">
                                    <div className='my-company-info-left'>
                                        <img src={company?.logo} alt={company?.company_name} className="my-company-logo" />
                                        <div className="my-company-info">
                                            <Link to={`/companies/companydetail/${company._id}`}>
                                                <h4>{company?.company_name}</h4>
                                            </Link>
                                            <span>
                                                <FaBuilding /> {company?.industry}
                                            </span>
                                            <span>
                                                <FaUsers /> {company?.quymo} Nhân viên | 📄 {company?.location}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="my-company-unfollow" onClick={() => handleUnfollow(company?._id)} >
                                        <FaTimes /> Huỷ theo dõi
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>You are not following any companies.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCompany;
