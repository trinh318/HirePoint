import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getId } from '../../../libs/isAuth'; // Assuming this function gets the logged-in user ID
import '../../../styles/myappointment.css';

const MyAppointment = () => {
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const userId = getId(); // Ensure this function correctly retrieves a valid user ID
            console.log(userId)
            if (!userId) {
                console.error('User ID is missing');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/interviewschedule/available-times?userId=${userId}`);
            setAppointments(response.data); // Set fetched appointments into state
            console.log(response.data);
        } catch (error) {
            console.error('Failed to fetch appointments', error);
        }
    };

    // Fetch appointments when the component mounts
    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleConfirm = async (jobIndex, timeIndex) => {
        const appointment = appointments[jobIndex]; // Lấy appointment tương ứng
        const job_id = appointment._id;
        const user_id = getId();

        const newTimeStatuses = appointment.availableTimes.map((time, tIndex) => {
            return {
                jobId: appointment._id,
                candidateId: getId(),
                idTime: time.idTime,
                status: tIndex === timeIndex ? "Chờ phê duyệt" : "cancle", // Đặt "Chờ phê duyệt" cho thời gian đã chọn, còn lại là "cancle"
            };
        });

        try {
            const response = await axios.put('http://localhost:5000/api/interviewschedule/update-schedules', {
                user_id: user_id,
                job_id: job_id,
                schedules: newTimeStatuses
            });
            console.log('Update response:', response.data);
            alert('Xác nhận lịch phỏng vấn thành công. Hãy đợi nhà tuyển dụng phê duyệt!');
            await fetchAppointments();
        } catch (error) {
            console.error('Error updating schedules:', error);
            alert('Failed to update schedules. Please try again.');
        }
    };

    return (
        <div className='my-company'>
            <div className="my-company-header">
                <h2>Lịch Hẹn Phỏng Vấn Của Tôi</h2>
            </div>
            <div className="my-company-container">
                <div className="company-profile-content followed-companies">
                    <div className="my-appointment-table-container">
                        <table className="my-appointment-table">
                            <thead>
                                <tr>
                                    <th>Tên công việc</th>
                                    <th>Công ty</th>
                                    <th>Địa điểm phỏng vấn</th>
                                    <th>Thời gian</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? (
                                    appointments.map((appointment, index) => (
                                        <tr className="my-appointment-row" key={index}>
                                            <td>{appointment.jobName || ""}</td>
                                            <td>{appointment.companyName || ""}</td>
                                            <td>{appointment.location || ""}</td>
                                            <td style={{ width: '30%' }}>
                                                {appointment.availableTimes.length === 1 ? ( // Sử dụng "===" để so sánh
                                                    appointment.availableTimes.map((time, timeIndex) => ( // Không cần bọc map trong {}
                                                        <div key={timeIndex} className="my-appointment-row-calender">
                                                            {new Date(time.time).toLocaleString()}
                                                        </div>
                                                    ))
                                                ) : (
                                                    appointment.availableTimes.map((time, timeIndex) => (
                                                        <div key={timeIndex} className="my-appointment-row-calender">
                                                            {new Date(time.time).toLocaleString()}{" "}
                                                            <button onClick={() => handleConfirm(index, timeIndex)}>
                                                                Xác nhận
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </td>
                                            <td>
                                                {appointment.availableTimes.length > 1 ? (
                                                    <>Chưa xác nhận</>
                                                ) : (
                                                    <> {appointment.availableTimes[0]?.status} </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <>Không có lịch hẹn nào.</>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAppointment;
