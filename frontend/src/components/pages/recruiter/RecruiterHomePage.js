import "../../../styles/recruiterhomepage.css";
import { Link } from "react-router-dom";

export default function RecruiterHomePage() {
    return (
        <div className="recruiter-gradient-container">
            <h1 className="recruiter-title">Chào mừng nhà tuyển dụng!</h1>
            <p className="recruiter-subtitle">
                Tìm kiếm tài năng, xây dựng đội ngũ và nâng tầm doanh nghiệp của bạn.
            </p>
            <div className="recruiter-button-container">
                <Link to="/recruiter-sign-in" className="recruiter-btn recruiter-login-btn">Đăng nhập</Link>
                <Link to="/recruiter-sign-up" className="recruiter-btn recruiter-register-btn">Đăng ký ngay</Link>
            </div>
        </div>
    );
}
