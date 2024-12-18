import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { FaBuilding, FaEye, FaUsers, FaTimes } from 'react-icons/fa';
import '../../../styles/companyprofile.css'
import { getId } from '../../../libs/isAuth';

import axios from 'axios';



const countryList = [
    { name: "Việt Nam", flag: "🇻🇳" },
    { name: "United States", flag: "🇺🇸" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "France", flag: "🇫🇷" },
    { name: "India", flag: "🇮🇳" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "Australia", flag: "🇦🇺" },
    { name: "South Korea", flag: "🇰🇷" },
    { name: "Brazil", flag: "🇧🇷" },
];

const countryData = [
    {
        name: "Việt Nam",
        code: "+84",
        flag: "https://flagcdn.com/w40/vn.png"
    },
    {
        name: "United States",
        code: "+1",
        flag: "https://flagcdn.com/w40/us.png"
    },
    {
        name: "United Kingdom",
        code: "+44",
        flag: "https://flagcdn.com/w40/gb.png"
    },
    {
        name: "France",
        code: "+33",
        flag: "https://flagcdn.com/w40/fr.png"
    },
    {
        name: "Germany",
        code: "+49",
        flag: "https://flagcdn.com/w40/de.png"
    },
    {
        name: "Japan",
        code: "+81",
        flag: "https://flagcdn.com/w40/jp.png"
    },
    {
        name: "Australia",
        code: "+61",
        flag: "https://flagcdn.com/w40/au.png"
    },
    {
        name: "India",
        code: "+91",
        flag: "https://flagcdn.com/w40/in.png"
    },
    {
        name: "Canada",
        code: "+1",
        flag: "https://flagcdn.com/w40/ca.png"
    },
    {
        name: "Brazil",
        code: "+55",
        flag: "https://flagcdn.com/w40/br.png"
    }
];

const locations = {
    "Việt Nam": {
        "Hà Nội": ["Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Đống Đa", "Quận Cầu Giấy", "Quận Tây Hồ"],
        "Hồ Chí Minh": [
            "Huyện Bình Chánh",
            "Huyện Cần Giờ",
            "Huyện Củ Chi",
            "Huyện Hóc Môn",
            "Huyện Nhà Bè",
            "Quận 1",
            "Quận 2",
            "Quận 3",
            "Quận 7",
            "Quận 9"
        ],
        "Đà Nẵng": ["Quận Hải Châu", "Quận Cẩm Lệ", "Quận Liên Chiểu", "Quận Ngũ Hành Sơn", "Quận Sơn Trà"],
        "Cần Thơ": ["Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Huyện Phong Điền"]
    },
    "Afghanistan": {
        "Kabul": ["District 1", "District 2", "District 3", "District 4"],
        "Herat": ["Guzara", "Kohsan", "Obeh"],
        "Kandahar": ["Daman", "Panjwai", "Spin Boldak"]
    },
    "Albania": {
        "Tirana": ["Kashar", "Farkë", "Peza", "Zall-Herr"],
        "Durrës": ["Ishëm", "Rrashbull", "Sukth"]
    },
    "Algeria": {
        "Algiers": ["Bab El Oued", "El Madania", "Hussein Dey"],
        "Oran": ["El Kerma", "Es Senia", "Bir El Djir"],
        "Constantine": ["Beni Hamidane", "Didouche Mourad", "Hamma Bouziane"]
    },
    "American Samoa": {
        "Tutuila": ["Pago Pago", "Tafuna", "Nu'uuli"],
        "Manu'a Islands": ["Ta'u", "Ofu", "Olosega"]
    }
};

const options = [
    { value: "", label: "Vui lòng chọn" },
    { value: "less-than-10", label: "Ít hơn 10" },
    { value: "10-24", label: "10-24" },
    { value: "25-99", label: "25-99" },
    { value: "100-499", label: "100-499" },
];

// Dữ liệu mẫu cho các công ty
const companies = [
    {
        id: 1,
        name: 'CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ CỬU LONG MEKO',
        industry: 'Bán lẻ/Bán sỉ',
        followers: 10,
        jobs: 2,
        logo: 'https://via.placeholder.com/50',
    },
    {
        id: 2,
        name: 'Daikin Air Conditioning (Vietnam) Joint Stock Company',
        industry: 'Sản xuất',
        followers: 588,
        jobs: 6,
        logo: 'https://via.placeholder.com/50',
    },
];


const CompanyProfile = () => {

    const [loading, setLoading] = useState(true); // State để kiểm tra trạng thái loading
    const [error, setError] = useState(null); // State để lưu lỗi (nếu có)  
    const [companyId, setCompanyId] = useState(null); // Lưu companyId trong state
    const [follwerIds, setFollwerIds] = useState([]);  // State để lưu danh sách userId
    const idnd = getId();

    const [companyData, setCompanyData] = useState({
        user_id: "", // Mặc định rỗng hoặc lấy từ thông tin người dùng đã đăng nhập
        company_name: "",
        description: "",
        industry: "",
        location: "",
        specific_address: "",
        website: "",
        logo: null, // Base64 hoặc URL hình ảnh logo
        banner: null, // Base64 hoặc URL hình ảnh banner
        quymo: "",
    });

    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        email: '',
        phone: '',
        nationality: '',
        date_of_birth: '',
        location: '',
        specific_address: '',
        job_title: '',
        job_level: '',
        current_industry: '',
        current_field: '',
        years_of_experience: '',
        current_salary: '',
        desired_work_location: '',
        desired_salary: '',
        education: '',
        experience: [],
        skills: [],
        cv_files: []
    });
    const handleLogoChange = (e) => {
        setCompanyData({ ...companyData, logo: e.target.files[0] });
    };
    const handleBannerChange = (e) => {
        setCompanyData({ ...companyData, banner: e.target.files[0] });
    };
    const handleUploadToCloudinary = async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', 'unsigned_upload_preset'); // Đảm bảo rằng preset này đã được thiết lập trong Cloudinary

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dxwoaywlz/image/upload`,
                uploadData
            );
            console.log('Cloudinary response:', response.data); // In ra toàn bộ dữ liệu trả về từ Cloudinary

            const logoUrl = response.data.secure_url;  // Lấy URL của logo từ phản hồi

            if (logoUrl) {
                console.log('Logo URL:', logoUrl); // In ra URL của logo
                return logoUrl;
            } else {
                console.error('Error: No secure_url found in the response');
                return null;
            }
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            return null;
        }
    };

    const [followerProfile, setFollowerProfile] = useState([]);


    const handleInputCompanyChange = (e) => {
        const { name, value } = e.target;
        setCompanyData({ ...companyData, [name]: value });
    };
    const handleInputProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    //////////////////////////////////////////////////////////
    // Trạng thái cho ô địa chỉ 1
    const [currentLevel1, setCurrentLevel1] = useState(locations); // Cấp hiện tại
    const [breadcrumbs1, setBreadcrumbs1] = useState([]); // Lưu đường dẫn đã chọn
    const [selectedValue1, setSelectedValue1] = useState(""); // Giá trị đã chọn
    const [isMenuOpen1, setIsMenuOpen1] = useState(false); // Trạng thái mở menu

    const handleSelect1 = (key) => {
        if (typeof currentLevel1[key] === "object") {
            setBreadcrumbs1([...breadcrumbs1, key]); // Cập nhật breadcrumbs
            setCurrentLevel1(currentLevel1[key]); // Chuyển xuống cấp tiếp theo
        } else {
            const locationValue = [...breadcrumbs1, key].join(", "); // Tính giá trị trực tiếp
            setSelectedValue1(locationValue); // Cập nhật giá trị vào state
            setIsMenuOpen1(false); // Đóng menu
            setCompanyData((prevData) => ({
                ...prevData,
                location: locationValue, // Cập nhật vào companyData
            }));
        }
    };

    const handleBack1 = () => {
        if (breadcrumbs1.length > 0) {
            const newBreadcrumbs = breadcrumbs1.slice(0, -1); // Loại bỏ cấp cuối
            const newLevel = newBreadcrumbs.reduce((acc, key) => acc[key], locations); // Lấy lại dữ liệu cấp trước
            setBreadcrumbs1(newBreadcrumbs);
            setCurrentLevel1(newLevel);
        }
    };

    const toggleMenu1 = () => {
        setIsMenuOpen1(!isMenuOpen1);
    };

    const [selectedCountry, setSelectedCountry] = useState(countryData[0]); // Quốc gia mặc định
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái dropdown

    // Xử lý khi chọn quốc gia
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false); // Đóng dropdown sau khi chọn
    };


    //////////////////////////////////////////////////////////////////////////////

    const [activeTab, setActiveTab] = useState('profileView');

    // Chuyển đổi tab
    const handleTabClick = (tab) => setActiveTab(tab);

    const [imageLogo, setImageLogo] = useState(null);
    const [imageBanner, setImageBanner] = useState(null);

    const handleImageLogoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleImageBannerChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageBanner(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFileLogoChange = (e) => {
        handleLogoChange(e);
        handleImageLogoChange(e);
    }

    const handleFileBannerChange = (e) => {
        handleBannerChange(e);
        handleImageBannerChange(e);
    }

    const handleDeleteLogoImage = () => {
        setImageLogo(null);
    };

    const handleDeleteBannerImage = () => {
        setImageBanner(null);
    };

    const handleDropLogo = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageLogo(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDropBanner = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => setImageBanner(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const validateCompanyData = () => {
        const requiredFields = [
            { name: 'company_name', label: 'Tên công ty' },
            { name: 'industry', label: 'Lĩnh vực' },
            { name: 'quymo', label: 'Quy mô công ty' },
            { name: 'location', label: 'Địa chỉ' },
            { name: 'specific_address', label: 'Địa chỉ cụ thể' },
            { name: 'website', label: 'Website' },
        ];
    
        // Check for missing required fields
        for (const field of requiredFields) {
            if (!companyData[field.name]) {
                alert(`Vui lòng điền ${field.label}`);
                return false;
            }
        }
    
        // Validate phone number (10-15 digits)
        if (!isValidPhone(profile.phone)) {
            alert('Vui lòng điền số điện thoại hợp lệ!');
            return false;
        }
    
        // Validate website URL
        if (companyData.website && !isValidWebsite(companyData.website)) {
            alert('Vui lòng cung cấp một URL website hợp lệ.');
            return false;
        }
    
        return true;
    };
    
    // Helper function to validate phone
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);
        
    // Helper function to validate website
    const isValidWebsite = (website) => {
        const websitePattern = /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6})|localhost)(:\d+)?(\/.*)?$/;
        return websitePattern.test(website);
    };
    
    
    const handleSave = async () => {
        const logoUrl = await handleUploadToCloudinary(companyData.logo);
        const bannerUrl = await handleUploadToCloudinary(companyData.banner);

        console.log('Data before sending to backend:', {
            ...companyData,
            logo: logoUrl, 
            banner :bannerUrl,
        });
        const updatedCompanyData = {
            ...companyData,  // Lấy tất cả dữ liệu cũ
            logo: logoUrl,   // Cập nhật logo mới
            banner: bannerUrl,
        };

        if (!validateCompanyData()) {
            return; // Nếu dữ liệu không hợp lệ, dừng việc lưu
        }
        console.log('Logo URL trước khi gửi lên server:', companyData.logo);
        try {
            const response = await axios.put(`http://localhost:5000/api/companies/${companyId}`,
                updatedCompanyData,
                {
                });
            // Kiểm tra phản hồi từ server
            if (response.data && response.data.message) {
                // Nếu có message trong response, hiển thị thông báo
                alert(response.data.message);
            } else {
                alert('Failed to save profile: Unknown error');
            }
        } catch (error) {
            if (error.response) {
                // Lỗi từ server
                console.error('Error response from server:', error.response.data);
                alert(`An error occurred: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // Không có phản hồi từ server
                console.error('Error request:', error.request);
                alert('No response from server. Please check your connection or server status.');
            } else {
                // Lỗi khác
                console.error('Error message:', error.message);
                alert(`An error occurred: ${error.message}`);
            }
        }
    }

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                console.log('Fetching data for user_id:', idnd);  // Kiểm tra giá trị của idnd

                const responseCompany = await axios.get(`http://localhost:5000/api/companies/${idnd}`);

                setCompanyData(responseCompany.data); // Gán dữ liệu công ty vào state
                setCompanyId(responseCompany.data._id);
                setImageLogo(responseCompany.data.logo);
                setImageBanner(responseCompany.data.banner);
            } catch (error) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/profiles/${idnd}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
                    },
                });
                setProfile(response.data); // Gán dữ liệu profile vào state
            } catch (error) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false); // Dừng trạng thái loading
            }
        };

        if (idnd) {
            fetchCompany();
            fetchProfile();
        } else {
            console.log('idnd is not valid:', idnd); // Khi idnd không hợp lệ
        }
    }, [idnd]);

    useEffect(() => {
        const fetchFollowerIds = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/followedcompanies/company/${companyId}/followers`);
                setFollwerIds(response.data.userIds);  // Cập nhật state với danh sách userId
                setLoading(false);  // Đổi trạng thái loading khi nhận được dữ liệu
                console.log(response.data.userIds);
            } catch (err) {
                setError("Error fetching followers");
                setLoading(false);
            }
        };

        fetchFollowerIds();
    }, [companyId]);  // Chạy lại khi companyId thay đổi

    const handleFollowerList = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/profiles/follower-profiles',
                { userIds: follwerIds }
            );

            setFollowerProfile(response.data); // Gán danh sách profile vào state
        } catch (err) {
            console.error('Error fetching profiles:', err);
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (follwerIds.length > 0) {
            handleFollowerList();
            console.log("followers", followerProfile);
        }
    }, [follwerIds]);

    const fullName = [profile.first_name || 'User', profile.last_name || 'Profile'].join(' ').trim();

    return (

        <div className='company-profile'>
            {/* Phần tiêu đề "Công ty của tôi" */}
            <div className="company-profile-header">
                <h2>Thông Tin Công Ty</h2>
            </div>
            <div className="company-profile-container">
                {/* Thanh điều hướng tab */}
                <div className="company-profile-tabs">
                    <button
                        className={`company-profile-tab ${activeTab === 'profileView' ? 'active' : ''}`}
                        onClick={() => handleTabClick('profileView')}
                    >
                        <FaEye /> Thông tin chung
                    </button>
                    <button
                        className={`company-profile-tab ${activeTab === 'followCompany' ? 'active' : ''}`}
                        onClick={() => handleTabClick('followCompany')}
                    >
                        <FaUsers /> Theo dõi công ty
                    </button>
                </div>

                {/* Nội dung tab "Nhà tuyển dụng xem hồ sơ" */}
                {activeTab === 'profileView' && (
                    <div className="company-profile-content profile-view">
                        <div className="company-profile-empty-state">
                            <div className="company-profile-edit-basic-info">

                                <div className="company-profile-edit-col">
                                    <div className="company-profile-edit-row">
                                        <label htmlFor="companyName" className="company-profile-edit-label">
                                            Tên công ty <span className="company-profile-edit-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            name='company_name'
                                            value={companyData?.company_name}
                                            onChange={handleInputCompanyChange}
                                            className="company-profile-edit-input"
                                            placeholder="Nhập tên công ty"
                                        />
                                    </div>
                                    <div className="company-profile-edit-row">
                                        <label htmlFor="firstName" className="company-profile-edit-label">
                                            Lĩnh vực <span className="company-profile-edit-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name='industry'
                                            value={companyData?.industry}
                                            onChange={handleInputCompanyChange}
                                            className="company-profile-edit-input"
                                            placeholder="Nhập lĩnh vực"
                                        />
                                    </div>
                                </div>

                                <div className="company-profile-edit-col">
                                    <div className="company-profile-edit-row">
                                        <label htmlFor="firstName" className="company-profile-edit-label">
                                            Quy mô <span className="company-profile-edit-required">*</span>
                                        </label>
                                        <select
                                            id="company-size"
                                            className="company-profile-select"
                                            name="quymo"
                                            value={companyData.quymo || ''}
                                            onChange={handleInputCompanyChange}
                                        >
                                            {options.map((option) => (
                                                <option key={option.value} value={option.label}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="company-profile-edit-selectbox">
                                        <label htmlFor="address-selected" className="company-profile-edit-label">
                                            Địa chỉ <span className="company-profile-edit-required">*</span>
                                        </label>
                                        <div
                                            className="company-profile-edit-select-display"
                                            onClick={toggleMenu1}
                                        >
                                            {companyData.location || "Chọn địa điểm"}
                                        </div>
                                        {isMenuOpen1 && (
                                            <div className="company-profile-edit-menu">
                                                <div className="company-profile-edit-breadcrumbs">
                                                    {breadcrumbs1.length > 0 && (
                                                        <button onClick={handleBack1}>&lt;</button>
                                                    )}
                                                    <span>{breadcrumbs1.join(", ") || "Chọn địa điểm"}</span>
                                                </div>
                                                <ul className="company-profile-edit-options">
                                                    {Object.keys(currentLevel1).map((key) => (
                                                        <li
                                                            key={key}
                                                            onClick={() => handleSelect1(key)}
                                                            className="company-profile-edit-option"
                                                        >
                                                            {key}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="company-profile-edit-row">
                                    <label htmlFor="firstName" className="company-profile-edit-label">
                                        Địa chỉ cụ thể <span className="company-profile-edit-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name='specific_address'
                                        value={companyData?.specific_address}
                                        onChange={handleInputCompanyChange}
                                        className="company-profile-edit-input"
                                        placeholder="Nhập địa chỉ cụ thể"
                                    />
                                </div>
                                <div className="company-profile-edit-col">

                                    <div className="company-profile-edit-phone-input-container">
                                        <label htmlFor="phone" className="company-profile-edit-label">
                                            Điện thoại <span className="company-profile-edit-required">*</span>
                                        </label>
                                        <div className="company-profile-edit-phone-input">
                                            <div
                                                className="company-profile-edit-country-select"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            >
                                                <img src={selectedCountry.flag} alt={selectedCountry.name} />
                                                <span>{selectedCountry.code}</span>
                                                <span className="dropdown-arrow">&#9662;</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Nhập số điện thoại"
                                                value={profile.phone}
                                                name="phone"
                                                onChange={handleInputProfileChange}
                                            />
                                        </div>
                                        {isDropdownOpen && (
                                            <ul className="company-profile-edit-country-dropdown">
                                                {countryData.map((country) => (
                                                    <li
                                                        key={country.code}
                                                        onClick={() => handleCountrySelect(country)}
                                                        className="company-profile-edit-country-item"
                                                    >
                                                        <img src={country.flag} alt={country.name} />
                                                        <span>{country.name}</span>
                                                        <span>{country.code}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="company-profile-edit-row">
                                        <label htmlFor="firstName" className="company-profile-edit-label">
                                            Website <span className="company-profile-edit-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            value={companyData.website}
                                            name="website"
                                            onChange={handleInputCompanyChange}
                                            className="company-profile-edit-input"
                                            placeholder="Nhập website"
                                        />
                                    </div>
                                </div>
                                <div className="company-profile-edit-row">
                                    <label htmlFor="description" className="company-profile-edit-label">
                                        Sơ lược về công ty <span className="company-profile-edit-required"></span>
                                    </label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        value={companyData.description}
                                        onChange={handleInputCompanyChange}
                                        className="company-profile-des-textarea"
                                        placeholder="Nhập mô tả"
                                    ></textarea>
                                </div>
                                <div className="company-profile-edit-row">
                                    <label htmlFor="company-logo" className="company-profile-edit-label">
                                        Logo công ty <span className="company-profile-edit-required"></span>
                                    </label>
                                    <div
                                        className={`company-profile-dropzone ${imageLogo ? "has-image" : ""}`}
                                        onDrop={handleDropLogo}
                                        onDragOver={handleDragOver}
                                    >
                                        {!imageLogo ? (
                                            <>
                                                <p className="company-profile-instructions">
                                                    <i className="upload-icon">📤</i> Kéo Và Thả Hình Ảnh Ở Đây{" "}
                                                    <span className="company-profile-upload-link">Hoặc Chọn File</span>
                                                </p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="company-profile-file-input"
                                                    onChange={handleFileLogoChange}
                                                />
                                            </>
                                        ) : (
                                            <div className="company-profile-image-container">
                                                <img src={imageLogo} alt="Uploaded" className="company-profile-image" />
                                                <div className="company-profile-image-actions">
                                                    <button
                                                        className="company-profile-action-button"
                                                        onClick={handleDeleteLogoImage}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="company-profile-hint">
                                        (Tập tin với phần mở rộng .jpg, .jpeg, .png, .gif và kích thước &lt;1MB)
                                    </p>
                                </div>
                                <div className="company-profile-edit-row">
                                    <label htmlFor="company-banner" className="company-profile-edit-label">
                                        Banner công ty <span className="company-profile-edit-required"></span>
                                    </label>
                                    <div
                                        className={`company-profile-dropzone ${imageBanner ? "has-image" : ""}`}
                                        onDrop={handleDropBanner}
                                        onDragOver={handleDragOver}
                                    >
                                        {!imageBanner ? (
                                            <>
                                                <p className="company-profile-instructions">
                                                    <i className="upload-icon">📤</i> Kéo Và Thả Hình Ảnh Ở Đây{" "}
                                                    <span className="company-profile-upload-link">Hoặc Chọn File</span>
                                                </p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="company-profile-file-input"
                                                    onChange={handleFileBannerChange}
                                                />
                                            </>
                                        ) : (
                                            <div className="company-profile-image-container">
                                                <img src={imageBanner} alt="Uploaded" className="company-profile-image" />
                                                <div className="company-profile-image-actions">
                                                    <button
                                                        className="company-profile-action-button"
                                                        onClick={handleDeleteBannerImage}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="company-profile-hint">
                                        (Tập tin với phần mở rộng .jpg, .jpeg, .png, .gif và kích thước &lt;1MB)
                                    </p>
                                </div>



                            </div>

                            <button onClick={handleSave} className="user-info-edit-save-btn" type="submit">
                                Lưu
                            </button>

                        </div>
                    </div>
                )}

                {/* Nội dung tab "Theo dõi công ty" */}
                {activeTab === 'followCompany' && (
                    <div className="company-profile-content followed-companies">
                        {followerProfile.map((follower_profile) => (
                            <div key={follower_profile._id} className="company-profile-item">
                                <div className='company-profile-info-left'>

                                    <img
                                        src={follower_profile.logo || 'https://via.placeholder.com/150'}
                                        className="company-profile-logo"
                                    />
                                    <div className="company-profile-info">
                                        <Link to={`/companies/companydetail/${follower_profile.id}`}>
                                            <h4>{`${follower_profile.first_name} ${follower_profile.last_name}`}</h4>
                                        </Link>
                                        <span><FaUsers /> {follower_profile.email}</span>
                                        <span>
                                            <FaBuilding /> {`${follower_profile.current_industry} - ${follower_profile.current_field}`}
                                        </span>
                                        <span>
                                            <FaBuilding /> {follower_profile.job_level}
                                        </span>
                                    </div>
                                </div>
                                <button className="company-profile-unfollow">
                                    <FaTimes /> Huỷ theo dõi
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >

    )
}

export default CompanyProfile;