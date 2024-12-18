import React, { useState, useRef, useEffect } from 'react';
import SearchBar from '../../UI/SearchBar';
import BestJob from '../../UI/BestJob';
import Dropdown from '../../UI/DropDown';
import '../../../styles/bestjobboard.css';


//////////////////////////////////////////////////////
const industryData = [
    { id: 1, name: 'Bán Lẻ/Tiêu Dùng', count: 83 },
    { id: 2, name: 'Bảo Hiểm', count: 26 },
    { id: 3, name: 'Bất Động Sản', count: 92 },
    { id: 4, name: 'CEO & General Management', count: 73 },
    { id: 5, name: 'Chính Phủ/Phi Lợi Nhuận', count: 19 },
    { id: 6, name: 'Công Nghệ Thông Tin/Viễn Thông', count: 648 },
];

const fieldData = [
    { id: 1, name: 'Kinh doanh', count: 120 },
    { id: 2, name: 'Marketing', count: 85 },
    { id: 3, name: 'Giáo dục', count: 60 },
    { id: 4, name: 'Y tế', count: 45 },
    { id: 5, name: 'Công nghệ', count: 100 },
    { id: 6, name: 'Nông nghiệp', count: 30 },
];
////////////////////////////////////////////////////////

const industries = [
    "Kinh doanh/Bán hàng", "Marketing/PR/Quảng cáo", "Dịch vụ khách hàng/Vận hành",
    "Nhân sự/Hành chính/Pháp chế", "Tài chính/Ngân hàng/Bảo hiểm", "Công nghệ Thông tin",
    "Y tế/Chăm sóc sức khỏe", "Sản xuất/Vận hành sản xuất", "Giáo dục/Đào tạo",
    "Du lịch/Nhà hàng/Khách sạn", "Xây dựng/Bất động sản", "Thời trang/Mỹ phẩm",
    "Logistics/Xuất nhập khẩu", "Thiết kế/Đồ họa", "Công nghệ sinh học/Môi trường",
    "Quản lý chất lượng", "Kỹ thuật cơ khí/Điện tử", "Truyền thông/Quảng bá thương hiệu"
];

const subCategoriesData = {
    "Kinh doanh/Bán hàng": [
        "Kinh doanh kênh MT", "Kinh doanh kênh GT", "Bán hàng siêu thị",
        "Bán hàng điện thoại", "Bán hàng điện máy", "Bán hàng thời trang",
        "Bán hàng mỹ phẩm", "Kinh doanh thực phẩm", "Kinh doanh bao bì",
        "Sales thẻ tập", "Sales Bán lẻ/Dịch vụ tiêu dùng khác"
    ],
    "Marketing/PR/Quảng cáo": [
        "Quản lý quảng cáo", "Chuyên viên truyền thông", "SEO/SEM",
        "Digital Marketing", "Content Marketing", "Chuyên viên PR",
        "Sự kiện/Activation", "Quản lý thương hiệu", "Nghiên cứu thị trường"
    ],
    "Dịch vụ khách hàng/Vận hành": [
        "Chăm sóc khách hàng", "Giải quyết khiếu nại", "Quản lý vận hành",
        "Trợ lý dịch vụ", "Tư vấn viên", "Hỗ trợ khách hàng qua tổng đài",
        "Quản lý dịch vụ khách hàng", "Dịch vụ hậu mãi", "Giao hàng"
    ],
    "Nhân sự/Hành chính/Pháp chế": [
        "Tuyển dụng", "Quản lý nhân sự", "C&B", "Đào tạo & Phát triển",
        "Pháp lý lao động", "Quan hệ lao động", "Chính sách phúc lợi",
        "Hành chính văn phòng", "Hỗ trợ nhân viên"
    ],
    "Tài chính/Ngân hàng/Bảo hiểm": [
        "Kế toán", "Kiểm toán", "Phân tích tài chính", "Ngân hàng bán lẻ",
        "Ngân hàng doanh nghiệp", "Bảo hiểm nhân thọ", "Đầu tư", "Quản lý rủi ro",
        "Tài chính doanh nghiệp"
    ],
    "Công nghệ Thông tin": [
        "Phát triển phần mềm", "Quản trị hệ thống", "Phát triển web",
        "Lập trình di động", "An ninh mạng", "Data Science", "AI/ML",
        "Hỗ trợ kỹ thuật", "UI/UX Design"
    ],
    "Y tế/Chăm sóc sức khỏe": [
        "Bác sĩ", "Y tá", "Dược sĩ", "Chăm sóc bệnh nhân", "Kỹ thuật y học",
        "Phục hồi chức năng", "Tâm lý học", "Dịch vụ tư vấn sức khỏe",
        "Nghiên cứu y tế"
    ],
    "Sản xuất/Vận hành sản xuất": [
        "Quản lý sản xuất", "Kiểm soát chất lượng", "Vận hành máy móc",
        "Bảo trì bảo dưỡng", "Sản xuất hàng hóa", "Lập kế hoạch sản xuất",
        "Đảm bảo chất lượng", "Quản lý kho", "Phân phối"
    ],
    "Giáo dục/Đào tạo": [
        "Giáo viên", "Giảng viên", "Đào tạo doanh nghiệp", "Gia sư",
        "Hỗ trợ học tập", "Phát triển chương trình", "Quản lý giáo dục",
        "Tư vấn giáo dục", "Nghiên cứu giáo dục"
    ],
    "Du lịch/Nhà hàng/Khách sạn": [
        "Hướng dẫn viên du lịch", "Quản lý khách sạn", "Nhân viên lễ tân",
        "Đầu bếp", "Nhân viên phục vụ", "Quản lý nhà hàng", "Tổ chức sự kiện",
        "Dịch vụ lữ hành", "Đặt phòng khách sạn"
    ],
    "Xây dựng/Bất động sản": [
        "Kỹ sư xây dựng", "Kiến trúc sư", "Giám sát công trình",
        "Tư vấn bất động sản", "Môi giới nhà đất", "Quản lý dự án xây dựng",
        "Quản lý tài sản", "Định giá bất động sản", "Thiết kế nội thất"
    ],
    "Thời trang/Mỹ phẩm": [
        "Thiết kế thời trang", "Quản lý sản phẩm", "Tư vấn phong cách",
        "Tiếp thị thời trang", "Phát triển sản phẩm mỹ phẩm", "Makeup artist",
        "Stylist", "Quản lý cửa hàng thời trang", "Nghiên cứu xu hướng"
    ],
    "Logistics/Xuất nhập khẩu": [
        "Vận tải", "Xuất nhập khẩu", "Hải quan", "Logistics nội địa",
        "Chuỗi cung ứng", "Kho vận", "Quản lý tồn kho", "Thủ tục vận chuyển",
        "Vận hành kho"
    ],
    "Thiết kế/Đồ họa": [
        "Thiết kế đồ họa", "Thiết kế web", "Thiết kế sản phẩm",
        "Thiết kế thương hiệu", "Thiết kế nội thất", "Thiết kế bao bì",
        "Thiết kế kỹ thuật số", "Thiết kế quảng cáo", "Nhiếp ảnh"
    ],
    "Công nghệ sinh học/Môi trường": [
        "Nghiên cứu công nghệ sinh học", "Bảo vệ môi trường",
        "Xử lý nước thải", "Quản lý tài nguyên thiên nhiên",
        "Sinh học phân tử", "Công nghệ nông nghiệp", "Công nghệ thực phẩm",
        "Phân tích môi trường", "Đánh giá tác động môi trường"
    ],
    "Quản lý chất lượng": [
        "Đảm bảo chất lượng", "Kiểm soát chất lượng", "ISO",
        "An toàn sản phẩm", "Kiểm tra chất lượng", "Phân tích chất lượng",
        "Đánh giá chất lượng", "Tiêu chuẩn hóa", "Giám sát chất lượng"
    ],
    "Kỹ thuật cơ khí/Điện tử": [
        "Kỹ sư cơ khí", "Kỹ sư điện", "Tự động hóa", "Cơ điện tử",
        "Chế tạo máy", "Sản xuất linh kiện", "Bảo trì hệ thống",
        "Thiết kế kỹ thuật", "Lập trình PLC"
    ],
    "Truyền thông/Quảng bá thương hiệu": [
        "Truyền thông nội bộ", "Truyền thông kỹ thuật số", "Quan hệ công chúng",
        "Quảng bá thương hiệu", "Content creator", "Quản lý cộng đồng",
        "Phát triển nội dung", "Sự kiện", "Đối tác truyền thông"
    ]
};

const companies = [
    { logo: 'path/to/logo1.png', name: 'VAS', industry: 'Giáo dục', jobCount: 5 },
    { logo: 'path/to/logo2.png', name: 'WA PROJECTS LIMITED', industry: 'Xây dựng', jobCount: 3 },
    { logo: 'path/to/logo3.png', name: 'MONDELEZ KINH ĐÔ', industry: 'Thực phẩm & Đồ uống', jobCount: 8 },
    { logo: 'path/to/logo4.png', name: 'MUFG BANK', industry: 'Ngân hàng', jobCount: 2 },
    { logo: 'path/to/logo5.png', name: 'FOXCONN INDUSTRIAL', industry: 'Sản xuất', jobCount: 6 },
    { logo: 'path/to/logo6.png', name: 'UOB VIETNAM', industry: 'Ngân hàng', jobCount: 4 },
    { logo: 'path/to/logo7.png', name: 'VNG', industry: 'Công nghệ', jobCount: 10 },
    { logo: 'path/to/logo8.png', name: 'TH TRUE MILK', industry: 'Thực phẩm', jobCount: 7 },
    { logo: 'path/to/logo9.png', name: 'FPT SOFTWARE', industry: 'Công nghệ thông tin', jobCount: 15 },
    { logo: 'path/to/logo10.png', name: 'GREEK TRADING', industry: 'Thương mại', jobCount: 9 },
    { logo: 'path/to/logo11.png', name: 'BAC A BANK', industry: 'Ngân hàng', jobCount: 3 },
    { logo: 'path/to/logo12.png', name: 'BITEXCO', industry: 'Đầu tư', jobCount: 12 },
    { logo: 'path/to/logo13.png', name: 'Hòa Phát', industry: 'Sản xuất', jobCount: 8 },
    { logo: 'path/to/logo14.png', name: 'REX HOTEL', industry: 'Khách sạn', jobCount: 4 },
    { logo: 'path/to/logo15.png', name: 'UNILEVER', industry: 'Tiêu dùng', jobCount: 5 },
    { logo: 'path/to/logo16.png', name: 'VINAMILK', industry: 'Thực phẩm', jobCount: 10 },
    { logo: 'path/to/logo17.png', name: 'BIDV', industry: 'Ngân hàng', jobCount: 2 },
    { logo: 'path/to/logo18.png', name: 'Viettel', industry: 'Viễn thông', jobCount: 14 },
    { logo: 'path/to/logo19.png', name: 'Masan Group', industry: 'Thực phẩm', jobCount: 7 },
    { logo: 'path/to/logo20.png', name: 'Lotte Mart', industry: 'Bán lẻ', jobCount: 6 },
    { logo: 'path/to/logo21.png', name: 'Samsung', industry: 'Công nghệ', jobCount: 20 },
    { logo: 'path/to/logo22.png', name: 'Nokia', industry: 'Viễn thông', jobCount: 11 },
    { logo: 'path/to/logo23.png', name: 'Philips', industry: 'Đồ điện tử', jobCount: 3 },
    { logo: 'path/to/logo24.png', name: 'Nestlé', industry: 'Thực phẩm', jobCount: 8 },
    { logo: 'path/to/logo25.png', name: 'Coca-Cola', industry: 'Thực phẩm', jobCount: 10 },
    { logo: 'path/to/logo26.png', name: 'PepsiCo', industry: 'Thực phẩm', jobCount: 9 },
    { logo: 'path/to/logo27.png', name: 'Accenture', industry: 'Tư vấn', jobCount: 12 },
    { logo: 'path/to/logo28.png', name: 'DHL', industry: 'Vận chuyển', jobCount: 4 },
    { logo: 'path/to/logo29.png', name: 'FedEx', industry: 'Vận chuyển', jobCount: 5 },
    { logo: 'path/to/logo30.png', name: 'IBM', industry: 'Công nghệ', jobCount: 7 },
];

function BestJobBoard() {
    const itemsPerPage = 6;
    const [hoveredIndustry, setHoveredIndustry] = useState(null);
    const [clickedIndustry, setClickedIndustry] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const hideTimeout = useRef(null);
    const jobBoardRef = useRef(null);
    const currentDate = new Date().toLocaleDateString('vi-VN');

    // Calculate total pages
    const totalPages = Math.ceil(industries.length / itemsPerPage);

    // Industries to show on the current page
    const industriesToShow = industries.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handleNextPage = () => {
        setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
    };

    // Handle mouse enter
    const handleMouseEnter = (industry) => {
        if (!clickedIndustry) {
            clearTimeout(hideTimeout.current);
            setHoveredIndustry(industry);
        }
    };

    // Handle mouse leave with delay
    const handleMouseLeave = () => {
        if (!clickedIndustry) {
            hideTimeout.current = setTimeout(() => {
                setHoveredIndustry(null);
            }, 200);
        }
    };

    // Toggle click to open/close menu
    const handleIndustryClick = (industry) => {
        setClickedIndustry((prev) => (prev === industry ? null : industry));
        setHoveredIndustry(null); // Clear hover state when clicking
    };

    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (jobBoardRef.current && !jobBoardRef.current.contains(event.target)) {
                setClickedIndustry(null);
                setHoveredIndustry(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /////////////////////////////////////////////////////
    const handleFieldSelect = (id) => {
        console.log(`Selected Field ID: ${id}`);
    };

    const handleIndustrySelect = (id) => {
        console.log(`Selected Industry ID: ${id}`);
    };
    ///////////////////////////////////////////////////

    return (
        <div className='job-board-body' ref={jobBoardRef}>
            <div className="job-board-banner-body">
                <SearchBar />
                <div className='sidebar-container'>
                    <div className='job-board-sidebar'>
                        {industriesToShow.map((industry, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => handleMouseEnter(industry)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleIndustryClick(industry)}
                                className={industry === hoveredIndustry || industry === clickedIndustry ? 'industry-item-sidebar active' : 'industry-item-sidebar'}
                            >
                                {industry}
                            </div>
                        ))}
                        <div className="pagination-controls">
                            <button onClick={handlePrevPage}>{"<"}</button>
                            <button onClick={handleNextPage}>{">"}</button>
                        </div>
                    </div>
                    <div className='job-board-banner'>
                        {/* Conditionally render job-board-content based on hoveredIndustry or clickedIndustry */}
                        {(hoveredIndustry || clickedIndustry) && (
                            <div
                                className='job-board-content'
                                onMouseEnter={() => clearTimeout(hideTimeout.current)} // Prevent hiding on hover
                                onMouseLeave={handleMouseLeave} // Hide on mouse leave if not clicked
                            >
                                <div className="subcategories">
                                    {(subCategoriesData[clickedIndustry || hoveredIndustry] || []).map((subcategory, idx) => (
                                        <div key={idx} className="subcategory-item">
                                            {subcategory}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="highlight-jobs-container-jb">
                            <div className="croll-high-job-card-jb">
                                <div className="scroll-content-jb">
                                    {[...companies, ...companies].map((company) => (
                                        <div key={company._id} className="top-company-card-jb">
                                            <div className="top-company-logo-jb">
                                                <img src={company.logo} alt={`${company.name} logo`} className="top-company-image-jb" />
                                            </div>
                                            <p className="top-company-title-jb">{company.name}</p>
                                            <p className="top-company-industry-jb">{company.industry}</p>
                                            <p className="top-company-job-count-jb">{company.jobCount} việc mới</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="job-market-container">
                            <div className="job-market-header">
                                <i className="job-market-icon"></i> {/* Placeholder for icon */}
                                <div className='job-market-date'>
                                    <span>Thị trường việc làm hôm nay</span>
                                    <span className="date">{currentDate}</span>
                                </div>
                            </div>
                            <div className="job-market-stats">
                                <div className="job-count">
                                    <span>Việc làm đang tuyển</span>
                                    <span className="count">41,244</span>
                                </div>
                                <div className="divider"></div>
                                <div className="job-count">
                                    <span>Việc làm mới hôm nay</span>
                                    <span className="count">247</span>
                                </div>
                            </div>
                            <div className="more-link">Xem thêm</div>
                        </div>

                    </div>
                </div>
            </div>
            <BestJob />
            <div className='top-company-body'>
                <div className='top-company-body-left'>
                    <div className="company-filter-bar">
                        <h2>Top công ty</h2>
                        <div className="top-company-container">
                            <Dropdown label="Ngành nghề" options={industryData} onSelect={handleIndustrySelect} />
                            <Dropdown label="Lĩnh vực" options={fieldData} onSelect={handleFieldSelect} />
                        </div>
                    </div>
                    <div className="top-companies-list-container">
                        <div className="top-companies-card">
                            <div className="top-companies-card-image">
                                <img src="" alt="Construction Worker" />
                            </div>
                            <div className="top-companies-card-content">
                                <h3>RENOVATION</h3>
                                <p>There are many variations of the passages of Lorem…</p>
                                <a href="#" className="read-more">READ MORE</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="advertisement">
                    <div className="advertisement-banner">
                        <div className="advertisement-banner-content">
                            <h1>Special Offer on Renovation Services</h1>
                            <p>Get the best quality renovation services at an affordable price. Limited time offer!</p>
                            <button className="advertisement-banner-button">Learn More</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default BestJobBoard;