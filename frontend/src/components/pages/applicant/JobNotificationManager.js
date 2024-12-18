import React, { useState, useEffect } from "react";
import { FaRegEnvelope, FaEnvelopeOpenText, FaTrashAlt, FaFilter, FaSearch, FaMoon, FaSun } from "react-icons/fa";
import "../../../styles/jobnotificationmanager.css";
import { getId } from '../../../libs/isAuth';
import axios from 'axios';

const JobNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const userId = getId();

  // Số lượng thông báo hiển thị trên mỗi trang
  const notificationsPerPage = 3;

  // Gọi API lấy thông báo khi component được tải
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
        console.log("Notifications data:", response.data);  // Kiểm tra dữ liệu
        setNotifications(response.data);  // Lưu trữ thông báo vào state
      } catch (error) {
        console.error("Lỗi khi lấy thông báo: ", error);
      }
    };
    
    fetchNotifications();
  }, [userId]);  // Lắng nghe khi userId thay đổi

  // Lọc thông báo theo bộ lọc và tìm kiếm
  const filteredNotifications = notifications.filter((notification) => {
    console.log("Filtering notification:", notification);  // Kiểm tra từng thông báo
    const matchesFilter =
      filter === "all" || (filter === "read" && notification.read_status) || (filter === "unread" && !notification.read_status);
    const matchesSearch =
      (notification.message && notification.message.toLowerCase().includes(search.toLowerCase()) || '') ||
      (notification.created_at && notification.created_at.toLowerCase().includes(search.toLowerCase()) || '');
    return matchesFilter && matchesSearch;
  });

  console.log("Filtered Notifications:", filteredNotifications);  // Kiểm tra kết quả lọc

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const displayedNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const toggleReadStatus = async (id) => {
    try {
      // Call API to update the notification as read
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      
      alert('Đánh dấu đã đọc thành công!');   
      // Update the local state to reflect the status change
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id ? { ...notification, read_status: true } : notification
        )
      );
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo là đã đọc: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Call API to delete the notification
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
  
      // Remove the notification from the local state
      setNotifications((prev) => prev.filter((notification) => notification._id !== id));
      alert('Xóa thông báo thành công!');   
    } catch (error) {
      console.error("Lỗi khi xóa thông báo: ", error);
    }
  };
  
  return (
    <div className={`modern-inbox-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="modern-inbox-header">
        <h2>Hộp Thư Thông Báo</h2>
        <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? "Light" : "Dark"} Mode
        </button>
      </div>

      <div className="modern-inbox-controls">
        <div className="modern-inbox-filters">
          <button className={`modern-inbox-filter ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            <FaFilter /> Tất cả
          </button>
          <button className={`modern-inbox-filter ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
            <FaRegEnvelope /> Chưa đọc
          </button>
          <button className={`modern-inbox-filter ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>
            <FaEnvelopeOpenText /> Đã đọc
          </button>
        </div>

        <div className="modern-inbox-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="modern-inbox-list">
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map((notification) => (
            <div key={notification._id} className={`modern-inbox-item ${notification.read_status ? "read" : "unread"}`}>
              <div className="modern-inbox-item-header">
                <h3 className="modern-inbox-title">Thông Báo </h3>
                <span className="modern-inbox-timestamp">{new Date(notification.created_at).toLocaleString()}</span>
              </div>
              <p className="modern-inbox-content">{notification.message}</p>
              <div className="modern-inbox-actions">
                <button className="modern-inbox-action-button toggle-read" onClick={() => toggleReadStatus(notification._id)}>
                  {notification.read_status ? <FaRegEnvelope /> : <FaEnvelopeOpenText />}{" "}
                  {notification.read_status ? "Đã đọc" : "Chưa đọc"}
                </button>
                <button className="modern-inbox-action-button delete" onClick={() => handleDelete(notification._id)}>
                  <FaTrashAlt /> Xóa
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="modern-inbox-empty">Không tìm thấy thông báo nào.</p>
        )}
      </div>

      <div className="modern-inbox-pagination">
        <button onClick={() => handlePageChange("prev")} disabled={currentPage === 1}>
          Trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button onClick={() => handlePageChange("next")} disabled={currentPage === totalPages}>
          Sau
        </button>
      </div>
    </div>
  );
};

export default JobNotificationManager;
