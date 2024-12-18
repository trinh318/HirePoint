import React, { useState, useEffect } from 'react';
import '../../../styles/ProfilePage.css';
import axios from 'axios';
import { getId } from '../../../libs/isAuth';
import { FaEdit } from 'react-icons/fa';  // Import icon chỉnh sửa

const ProfilePage = () => {
    const [user, setUser] = useState('');
    const userId = getId();
    const [applications, setApplications] = useState(3);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);  // Modal cho việc chỉnh sửa thông tin
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [error, setError] = useState(null);

    // Trạng thái lưu trữ thông tin chỉnh sửa
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const isValidPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra nếu mật khẩu mới và xác nhận mật khẩu không khớp
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới và mật khẩu xác nhận không khớp.');
            return;
        }

        // Kiểm tra mật khẩu mới có đúng chuẩn không
        if (!isValidPassword(newPassword)) {
            alert('Mật khẩu phải có ít nhất 8 ký tự, một chữ cái viết hoa, một chữ cái viết thường, một chữ số và một ký tự đặc biệt.');
            return;
        }

        try {
            setLoading(true);
            // Gửi yêu cầu PUT đến API để thay đổi mật khẩu
            const response = await axios.put(`http://localhost:5000/api/users/update-password/${userId}`, {
                oldPassword,
                newPassword,
                confirmPassword,
            });

            setMessage(response.data.message);  // Hiển thị thông báo thành công
            console.log("thong tin mk ", response.data.message)
            alert("Cập nhật mật khẩu thành công!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'Lỗi server');
        } finally {
            setLoading(false);
        }
    };

    const handleInfoChange = async () => {
        try {
            setLoading(true);
            const response = await axios.put(`http://localhost:5000/api/users/update-user/${userId}`, {
                username: newUsername,
                email: newEmail,
                phone: newPhone  // Cập nhật số điện thoại
            });
            setUser(response.data); // Cập nhật thông tin người dùng
            setShowInfoModal(false); // Đóng modal
            alert("Cập nhật thông tin thành công!");
            setNewUsername('');
            setNewEmail('');
            setNewPhone('');
            fetchUserProfile();
        } catch (error) {
            console.error('Lỗi khi thay đổi thông tin người dùng:', error);
        }
    };
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token is missing, please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5000/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to fetch user data.');
            setLoading(false);
        }
    };
    useEffect(() => {

        fetchUserProfile();
    }, []);

    return (
        <div className="profile-management-container">
            <div className="profile-management-header">
                <h1 className="profile-management-title">Quản lý tài khoản cá nhân</h1>
                <button className="profile-management-change-password-btn" onClick={() => setShowPasswordModal(true)}>
                    Thay đổi mật khẩu
                </button>
            </div>
            <div className="profile-management-content">
                <div className="profile-management-info">
                    <h2 className="profile-management-info-title">Thông tin cá nhân</h2>
                    <div className="profile-management-info-item">
                        <label className="profile-management-label">Tên người dùng:</label>
                        <span className="profile-management-span">{user.username}</span>
                    </div>
                    <div className="profile-management-info-item">
                        <label className="profile-management-label">Email:</label>
                        <span className="profile-management-span">{user.email}</span>
                    </div>
                    <div className="profile-management-info-item">
                        <label className="profile-management-label">Số điện thoại:</label>
                        <span className="profile-management-span">{user.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="profile-management-info-item">
                        <label className="profile-management-label">Trạng thái tài khoản:</label>
                        <span className="profile-management-span">{user.state}</span>
                    </div>
                    <div className="profile-management-info-item">
                        <label className="profile-management-label">Ngày tạo tài khoản:</label>
                        <span className="profile-management-span">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="profile-management-info-item">
                        <label className="profile-management-label">Ngày cập nhật:</label>
                        <span className="profile-management-span">{new Date(user.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="profile-management-info-item">
                        <label className="profile-management-label">Lần cuối đăng nhập:</label>
                        <span className="profile-management-span">{new Date(user.last_login).toLocaleDateString()}</span>
                    </div>
    
                    <FaEdit
                        onClick={() => {
                            setNewUsername(user.username);
                            setNewEmail(user.email);
                            setNewPhone(user.phone || '');
                            setShowInfoModal(true); // Mở modal chỉnh sửa
                        }}
                        className="profile-management-edit-icon" />
                </div>
            </div>
    
            {/* Modal để thay đổi mật khẩu */}
            {showPasswordModal && (
                <div className="profile-management-modal-overlay">
                    <div className="profile-management-modal-content">
                        <h2 className="profile-management-modal-title">Thay đổi mật khẩu</h2>
                        <input
                            className="profile-management-input"
                            type="password"
                            placeholder="Mật khẩu cũ"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            className="profile-management-input"
                            type="password"
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            className="profile-management-input"
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <div className="profile-management-modal-actions">
                            <button className="profile-management-btn" onClick={handleSubmit}>Lưu thay đổi</button>
                            <button className="profile-management-btn" onClick={() => {
                                setShowPasswordModal(false); // Đóng modal
                                // Reset các trường mật khẩu khi hủy
                                setOldPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                            }}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
    
            {/* Modal để thay đổi thông tin người dùng */}
            {showInfoModal && (
                <div className="profile-management-modal-overlay">
                    <div className="profile-management-modal-content">
                        <h2 className="profile-management-modal-title">Chỉnh sửa thông tin</h2>
                        <div>
                            <label className="profile-management-label">Tên người dùng</label>
                            <input
                                className="profile-management-input"
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="profile-management-label">Email</label>
                            <input
                                className="profile-management-input"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="profile-management-label">Số điện thoại</label>
                            <input
                                className="profile-management-input"
                                type="text"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                            />
                        </div>
                        <div className="profile-management-modal-actions">
                            <button className="profile-management-btn" onClick={handleInfoChange}>Lưu thay đổi</button>
                            <button className="profile-management-btn" onClick={() => {
                                setShowInfoModal(false); // Đóng modal
                                // Reset các trường nhập khi hủy
                                setNewUsername('');
                                setNewEmail('');
                                setNewPhone('');
                            }}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );    
};

export default ProfilePage;
