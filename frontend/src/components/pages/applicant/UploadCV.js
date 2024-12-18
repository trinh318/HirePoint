import React, { useState, useEffect } from 'react';
import { FaPlus, FaEllipsisV, FaPaperclip, FaArrowAltCircleDown } from 'react-icons/fa';
import { MdDeleteForever } from "react-icons/md";
import '../../../styles/uploadcv.css';
import { getId } from '../../../libs/isAuth';
import axios from 'axios';

const UploadCV = () => {
  const [showForm, setShowForm] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [check, setCheck] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);  // Khai báo useState cho uploadedFiles

  const userId = getId(); // Lấy ID người dùng

  // Toggle menu visibility
  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // Hàm xử lý khi tải file
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'raw_file_upload'); // Đảm bảo bạn đã tạo upload preset trên Cloudinary
    formData.append('resource_type', 'raw'); // Đảm bảo là 'raw' cho tệp PDF
    formData.append('folder', 'raw/upload');
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxwoaywlz/upload`, // Đường dẫn đúng
        formData
      );

      console.log('Cloudinary response:', response.data);
      return response.data.secure_url; // URL của file được upload
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; // Lấy file từ input
    if (file) {
      try {
        // Upload file lên Cloudinary
        const uploadedUrl = await uploadToCloudinary(file);

        if (uploadedUrl) {
          console.log('Uploaded file URL:', uploadedUrl);
          const fileType = file.type;
          console.log('File MIME Type:', fileType);
          setCheck(!check);
          alert('Thêm CV thành công!'); // Lưu thông tin file vào backend (nếu cần)
          const response = await axios.post(
            'http://localhost:5000/api/cvfile/upload',
            {
              originalName: file.name,
              fileName: uploadedUrl,
              uploadedBy: userId,
              mimeType: fileType,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Gửi token xác thực
              },
            }
          );
          console.log('File info saved to backend:', response.data);
          setCheck(!check); // Cập nhật trạng thái để fetch lại danh sách
        } else {
          console.error('Failed to upload file to Cloudinary');
        }
      } catch (error) {
        console.error('Error handling file upload:', error);
      }
    }
  };

  const handleDeleteFile = async (file) => {
    try {
      // Gửi yêu cầu DELETE để xóa file
      const response = await axios.delete(`http://localhost:5000/api/cvfile/files/${file._id}`);
      alert('Xóa CV thành công!');
      setCheck(!check);
      if (response.status === 200) {
        console.log('File deleted successfully:', response.data);
        setUploadedFiles(prevFiles => prevFiles.filter(f => f._id !== file._id));
      } else {
        console.error('Failed to delete file:', response.data.error);
      }
    } catch (error) {
      console.error('Error deleting file:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cvfile/files/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.files.length === 0) {
          throw new Error('Không có CV');
        } else {
          setFiles(response.data.files);
        }

      } catch (error) {
        setError('Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [userId, check]);

  // Hàm mở/đóng form
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleDownloadFile = async (file) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(file.fileName);
      const blob = await response.blob();

      // Create a temporary link to trigger the download
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      // Set the download attribute with the original file name
      a.href = url;
      a.download = file.originalName; // Suggest the original file name

      // Trigger the download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the object URL after download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  return (
    <div className="upload-card">
      {/* Tiêu đề và nút mở form */}
      <div className="upload-header">
        <h3>Hồ sơ đã tải lên</h3>
        <FaPlus className="upload-toggle" onClick={toggleForm} />
      </div>

      {/* Form tải file */}
      {showForm && (
        <div className="upload-form">
          <label htmlFor="file-upload" className="custom-file-upload">
            <FaPlus className="upload-plus" />
            Chọn Hồ Sơ
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            accept=".doc,.docx,.pdf"
          />
          <p>Hỗ trợ định dạng .doc, .docx, .pdf có kích thước dưới 5120KB</p>
        </div>
      )}

      {/* Danh sách hồ sơ đã tải */}
      <div className="uploaded-files">
        {files.map((file, index) => (
          <div key={index} className="uploaded-file-item">
            <FaPaperclip className="file-icon" />
            <div className="file-info">
              <span className="file-name">{file.originalName}</span>
              <span className="file-date">
                Cập nhật lần cuối: {
                  (() => {
                    const date = new Date(file.createdAt);
                    const day = date.getDate();
                    const month = date.getMonth() + 1; // Tháng bắt đầu từ 0
                    const year = date.getFullYear();
                    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
                  })()
                }
              </span>
              {file.mimeType === 'application/pdf' || file.mimeType === 'application/msword' || file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                <a
                  href={file.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem File
                </a>
              ) : (
                <a href={file.fileName} target="_blank" rel="noopener noreferrer">
                  Xem file
                </a>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaArrowAltCircleDown
                style={{
                  marginRight: '10px',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
                onClick={() => handleDownloadFile(file)}
              />
              <MdDeleteForever
                style={{
                  marginRight: '0',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
                onClick={() => handleDeleteFile(file)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadCV;
