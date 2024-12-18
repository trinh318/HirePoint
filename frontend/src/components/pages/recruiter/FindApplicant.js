import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { FaBuilding, FaEye, FaUsers, FaTimes, FaBriefcase, FaMoneyCheckAlt, FaPeriscope, FaBookmark, FaMapMarkerAlt, FaPaperPlane, FaUserTie } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import '../../../styles/companyprofile.css'
import { getId } from '../../../libs/isAuth';
import axios from 'axios';
import Dropdown from '../../UI/DropDown';

const industryData = [
    {
        id: 1,
        name: 'Bán Lẻ/Tiêu Dùng',
        keywords: ['bán lẻ', 'tiêu dùng', 'retail', 'consumer goods']
    },
    {
        id: 2,
        name: 'Công nghiệp',
        keywords: ['công nghiệp', 'manufacturing', 'industrial', 'production']
    },
    {
        id: 3,
        name: 'Nông Nghiệp',
        keywords: ['nông nghiệp', 'agriculture', 'farming', 'farm']
    },
    {
        id: 4,
        name: 'Giáo Dục',
        keywords: ['giáo dục', 'education', 'teaching', 'training']
    },
    {
        id: 5,
        name: 'Y tế',
        keywords: ['y tế', 'healthcare', 'medical', 'health']
    },
    {
        id: 6,
        name: 'Công Nghệ Thông Tin',
        keywords: ['công nghệ thông tin', 'IT', 'information technology', 'software', 'tech']
    }
];

const salaryData = [
    { id: 1, name: 'Dưới 1000$' },
    { id: 2, name: '1000$ - 3000$' },
    { id: 3, name: '3000$ - 5000$' },
    { id: 4, name: '5000$ - 8000$' },
    { id: 5, name: '8000$ - 10000$' },
    { id: 6, name: '10000$ - 12000$' },
    { id: 7, name: 'Trên 12000$' },
];

const experienceData = [
    { id: 1, name: 'Mới tốt nghiệp' },
    { id: 2, name: '1-3 năm' },
    { id: 3, name: '3-5 năm' },
    { id: 4, name: 'Trên 5 năm' },
];

const FindApplicant = () => {
    const [allProfiles, setAllProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');



    //dropdown tìm kiếm
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [keyword, setKeyword] = useState('');

    const toggleAdvancedFilters = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    ////bộ lọc
    const [filters, setFilters] = useState({
        industry: [],        // Ngành nghề
        salary: [],          // Mức lương
        experience: [],      // Kinh nghiệm
    });
    // Map các lựa chọn từ tên hiển thị sang giá trị chuẩn cho backend
    const salaryMapping = {
        'Dưới 1000$': '0-1000',
        '1000$ - 3000$': '1000-3000',
        '3000$ - 5000$': '3000-5000',
        '5000$ - 8000$': '5000-8000',
        '8000$ - 10000$': '8000-10000',
        '10000$ - 12000$': '10000-12000',
        'Trên 12000$': '12000'
    };

    // Cập nhật các lựa chọn kinh nghiệm
    // Map các lựa chọn từ tên hiển thị sang tên chuẩn cho backend
    const experienceMapping = {
        'Mới tốt nghiệp': '0',
        '1-3 năm': '1-3',
        '3-5 năm': '3-5',
        'Trên 5 năm': '5'
    };

    // Cập nhật các lựa chọn ngành nghề
    // Hàm loại bỏ dấu tiếng Việt và chuyển thành chữ thường
    const removeVietnameseTones = (str) => {
        const from = "áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ";
        const to = "aaaaaaaaaaaaaaaaadeeeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuuuuyyyyy";
        return str
            .split('')
            .map((char) => {
                const index = from.indexOf(char);
                return index !== -1 ? to[index] : char;
            })
            .join('')
            .toLowerCase(); // Chuyển sang chữ thường
    };

    // Lọc các ngành nghề đã chọn và lấy từ khóa
    const handleIndustrySelect = (selectedIndustries) => {
        console.log("Selected Industries: ", selectedIndustries);  // Kiểm tra giá trị ngành nghề được chọn

        // Chuẩn hóa các ngành nghề đã chọn và lấy từ khóa liên quan
        const normalizedIndustries = selectedIndustries.map(industry => {
            const normalizedIndustry = removeVietnameseTones(industry).trim();

            // Tìm ngành nghề trong danh sách ngành nghề và lấy các từ khóa liên quan
            const industryInfo = industryData.find(industryItem =>
                removeVietnameseTones(industryItem.name).toLowerCase() === normalizedIndustry.toLowerCase()
            );

            return {
                name: normalizedIndustry,
                keywords: industryInfo ? industryInfo.keywords : []
            };
        });

        // Cập nhật lại filter với ngành nghề đã chọn và từ khóa liên quan
        setFilters((prevFilters) => ({
            ...prevFilters,
            industry: normalizedIndustries,
        }));

        console.log("Updated Filters: ", normalizedIndustries);
    };


    // Cập nhật các lựa chọn mức lương
    const handleSalarySelect = (selectedSalaries) => {
        // Kiểm tra xem giá trị nhận được có phải là đối tượng không
        const normalizedSalaries = selectedSalaries.map((salary) => {
            if (salary && typeof salary === 'object') {
                console.log("Chọn mức lương:", salary.name);  // Kiểm tra giá trị của 'name' trong đối tượng
                return salaryMapping[salary.name] || salary.name;  // Lấy giá trị từ đối tượng
            }
            console.log("Giá trị không hợp lệ:", salary);
            return salaryMapping[salary] || salary;  // Lấy giá trị chuẩn hóa từ salaryMapping hoặc trả về gốc nếu không tìm thấy
        });

        console.log("Normalized Salaries: ", normalizedSalaries);  // Kiểm tra giá trị mức lương chuẩn hóa
        setFilters((prevFilters) => ({
            ...prevFilters,
            salary: normalizedSalaries,
        }));
    };

    // Cập nhật các lựa chọn kinh nghiệm
    const handleExperienceSelect = (selectedExperiences) => {
        // Kiểm tra dữ liệu đầu vào
        console.log("Selected Experiences: ", selectedExperiences);  // Kiểm tra giá trị kinh nghiệm

        // Chuyển đổi các lựa chọn kinh nghiệm sang tên chuẩn cho backend
        const normalizedExperiences = selectedExperiences.map((experience) => {
            // Nếu experience là đối tượng, lấy tên từ thuộc tính `name`
            const experienceName = experience.name || experience; // Nếu không có `name`, sử dụng trực tiếp giá trị

            const normalized = experienceMapping[experienceName];
            if (!normalized) {
                console.warn(`Không tìm thấy kinh nghiệm cho: ${experienceName}`);
            }
            return normalized;
        });

        // Kiểm tra kết quả chuẩn hóa
        console.log("Normalized Experiences: ", normalizedExperiences);  // Kiểm tra giá trị kinh nghiệm chuẩn hóa

        // Cập nhật filter với các giá trị chuẩn hóa
        setFilters((prevFilters) => ({
            ...prevFilters,
            experience: normalizedExperiences,
        }));
    };

    const handleSearch = async () => {
        const fetchAllProfiles = async () => {
            try {
                const queryParams = new URLSearchParams(filters).toString();  // Chuyển đổi đối tượng thành chuỗi query string
                console.log("Query params:", queryParams);  // Kiểm tra query string

                const response = await axios.get(`http://localhost:5000/api/profiles/search-profile/filter-profile/applicant?${queryParams}`);
                setAllProfiles(response.data);
                console.log("data",response.data )
                setLoading(false);
            } catch (error) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllProfiles();
        console.log("data", allProfiles);
    };


    // Chuyển đổi tab
    const [activeTab, setActiveTab] = useState('profileView');
    const handleTabClick = (tab) => setActiveTab(tab);

    //phân trang 
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const jobsPerPage = 3; // Số lượng job mỗi trang

    // Tính toán các job hiển thị
    //  const indexOfLastJob = currentPage * jobsPerPage;
    //  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    //   const currentJobs = allProfiles.slice(indexOfFirstJob, indexOfLastJob); // Các job hiện tại
    const totalPages = Math.ceil(allProfiles.length / jobsPerPage); // Tổng số trang

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

    // thu mơi 
    const [showModal, setShowModal] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [candidateId, setCandidateId] = useState(""); // Nhập ID ứng viên từ giao diện
    const [message, setMessage] = useState("");
    const recruiterId = getId();
    const [selectedUserId, setSelectedUserId] = useState(null);

    const handleInvite = (userId) => {
        console.log("Inviting user with ID:", userId);
        setSelectedUserId(userId);
        setShowModal(true);
    };
    
    // Fetch jobs when modal opens
    useEffect(() => {
        // Kiểm tra xem recruiterId có tồn tại và modal có hiển thị không
        if (showModal && recruiterId) {
            setLoading(true);  // Đặt trạng thái loading là true khi bắt đầu gọi API
        
            // Gọi API lấy công việc của người tuyển dụng
            axios
                .get(`http://localhost:5000/api/invitation/by-recruiter/${recruiterId}`)
                .then((response) => {
                    setJobs(response.data.jobs);  // Lưu các công việc vào state jobs
                })
                .catch((error) => {
                    console.error("Error fetching jobs", error);
                })
                .finally(() => {
                    setLoading(false);  // Set lại trạng thái loading sau khi nhận kết quả
                });
        }
    }, [showModal, recruiterId]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          // Gửi yêu cầu tạo thư mời
          const response = await axios.post(`http://localhost:5000/api/invitation`, {
            jobId: selectedJob,
            recruiterId: recruiterId,
            candidateId: selectedUserId,
            message,
          });
      
          // Kiểm tra phản hồi và hiển thị thông báo thành công
          if (response.status === 201) {
            alert("Gửi lời mời thành công!");
            setShowModal(false); // Đóng modal sau khi gửi mời
          } else {
            alert("Lỗi khi gửi lời mời. Vui lòng thử lại.");
          }
        } catch (error) {
          // Kiểm tra lỗi và hiển thị thông báo lỗi chi tiết
          if (error.response && error.response.data && error.response.data.message) {
            alert(`Lỗi: ${error.response.data.message}`);
          } else {
            alert("Đã xảy ra lỗi khi gửi lời mời. Vui lòng thử lại sau.");
          }
        }
      };
      

    return (
        <div className='company-profile'>
            {/* Phần tiêu đề "Công ty của tôi" */}
            <div className="company-profile-header">
                <h2>Tìm kiếm ứng viên phù hợp với yêu cầu của công ty</h2>
                <button
                    className="user-info-edit-btn"
                    onClick={toggleAdvancedFilters}
                >
                    {showAdvancedFilters ? <FaBookmark /> : <FaBookmark />}
                </button>
                {showAdvancedFilters && (
                    <div className="search-profile-advanced-filters">
                        <Dropdown label="Lương mong muốn" options={salaryData} onSelect={handleSalarySelect} />
                        <Dropdown label="Kinh nghiệm" options={experienceData} onSelect={handleExperienceSelect} />
                        <button className='asd' onClick={handleSearch}> Lọc</button>
                    </div>
                )}
            </div>
            <div className="company-profile-container">
                {/* Thanh điều hướng tab */}
                <div className="company-profile-tabs">
                    <button
                        className={`company-profile-tab ${activeTab === 'profileView' ? 'active' : ''}`}
                        onClick={() => handleTabClick('profileView')}
                    >
                        <FaEye /> Ứng viên
                    </button>
                </div>

                {/* Nội dung tab "Nhà tuyển dụng xem hồ sơ" */}
                {activeTab === 'profileView' && (
                    <div className="company-profile-content followed-companies">
                        {allProfiles.length > 0 ? (
                            <>
                            {allProfiles.map((follower_profile) => (
                            <div key={follower_profile._id} className="company-profile-item">
                                <div className='company-profile-info-left'>
                                    <img
                                        src={follower_profile.logo || 'https://via.placeholder.com/150'}
                                        className="company-profile-logo"
                                    />
                                    <div className="company-profile-info">
                                        <Link to={`/applicants/applicant-profile/viewed/${follower_profile._id}`} target="_blank" rel="noopener noreferrer">
                                            <h4>{`${follower_profile.first_name} ${follower_profile.last_name}`}</h4>
                                        </Link>
                                        <span>{`${follower_profile.current_industry} - ${follower_profile.current_field}`}</span>
                                        <span><FaPaperPlane style={{ margin: "0 10px 0 0" }} /> {follower_profile.email}</span>
                                        <span>
                                            <FaUserTie style={{ margin: "0 10px 0 0" }} /> {follower_profile.job_level}
                                        </span>
                                        <span className='find-applicant-row'>
                                            <div><FaBriefcase style={{ margin: "0 10px 0 0" }} /> {`${follower_profile.years_of_experience} năm`} </div>
                                            <div><FaMoneyCheckAlt style={{ margin: "0 10px 0 0" }} /> {`$${follower_profile.desired_salary}`} </div>
                                            <div><FaMapMarkerAlt style={{ margin: "0 10px 0 0" }} /> {follower_profile.desired_work_location} </div>
                                        </span>
                                    </div>
                                </div>
                                <button className="company-profile-unfollow"  onClick={() => {
                                        handleInvite(follower_profile.user_id); // Gọi hàm handleInvite với user_id
                                        setShowModal(true); // Hiển thị modal
                                    }}>
                                    <FaTimes /> Mời ứng tuyển
                                </button>
                            </div>
                        ))}
                        </>
                        ) : (
                            <p>Hãy chọn tiêu chí lọc tìm hồ sơ ứng viên</p>
                        )}
                        {/* Pagination 
                        
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
                        </div>*/}

                    </div>
                )}

                {/* Nội dung tab "Theo dõi công ty" */}
                {activeTab === 'followCompany' && (
                    <div className="company-profile-content profile-view">

                    </div>
                )}
            </div>
            {/* Modal */}
      {showModal && (
        <div className="invite-modal">
          <div className="invite-modal-content">
            <h2>Thêm Thư Mời Ứng Tuyển</h2>
            <form onSubmit={handleSubmit}>
              {/* Select job */}
              <label>Chọn công việc:</label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                required
              >
                <option value="">-- Chọn công việc --</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>             

              {/* Message */}
              <label>Lời nhắn:</label>
              <textarea 
                className="message-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập lời nhắn"
              />

              {/* Submit */}
              <button type="submit" className="invite-submit-button">
                Gửi Thư Mời
              </button>
              <button
                type="button"
                className="invite-cancel-button"
                onClick={() => {
                    setShowModal(false);  
                    setSelectedJob('');    
                    setMessage('');     
                  }}
              >
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}
        </div >
    )
}

export default FindApplicant;