import React, { useState, useEffect } from "react";
import "./RequestLeave.css";
import axios from "axios";
import bgIcon from "../utilities/leavess.jpg";

const RequestLeave = () => {
  const [user, setUser] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const fetchLeaveRequests = async (email) => {
    try {
      const res = await axios.get(
        "https://people-sync-33225-default-rtdb.firebaseio.com/leaves.json"
      );
      const data = res.data
        ? Object.entries(res.data)
            .map(([id, obj]) => ({ id, ...obj }))
            .filter((leave) => leave.employeeEmail === email)
        : [];
      setLeaveRequests(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalLeaves = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // const newLeaveRequest = {
    //   employeeName,
    //   employeeEmail,
    //   leaveType,
    //   startDate,
    //   endDate,
    //   reason,
    //   totalLeaves,
    //   status: "PENDING"
    // };
    const newLeaveRequest = {
      employeeName: user.name,
      employeeEmail: user.email,
      leaveType,
      startDate,
      endDate,
      reason,
      totalLeaves,
      status: "PENDING",
    };

    try {
      await axios.post(
        "https://people-sync-33225-default-rtdb.firebaseio.com/leaves.json",
        newLeaveRequest
      );
      console.log("Leave request submitted:", newLeaveRequest);

      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      alert("Leave Request Submitted Successsfully !.");
    } catch (error) {
      console.error("Error submitting leave request:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const u = localStorage.getItem("user");
      if (u != null) {
        const userObject = JSON.parse(u);
        setUser(userObject);
        fetchLeaveRequests(userObject?.email);
        clearInterval(interval);
      }
    }, 500);
  }, []);
  const approvedLeavesTotal = leaveRequests
    .filter((req) => req.status === "APPROVED")
    .reduce((sum, req) => sum + req.totalLeaves, 0);

  return (
    <div className="request-leave">
      <h4 className="myTableHeader animate__animated animate__lightSpeedInLeft">
        Request Leave
      </h4>
      <div className="row">
        {/* Graph Section */}
        <div className="col-md-6">
          <div className="column leave-section">
            <img src={bgIcon} height="250px" style={{ borderRadius: "20px" }} />
            <div>
              <p className="online-count">{approvedLeavesTotal}</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Total Leaves Credited</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form className="requestleaveform" onSubmit={handleSubmit}>
        <div className="sRow">
          <label>Leave Type:</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
          >
            <option value="">Select Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Annual Leave">Annual Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
          </select>
        </div>
        <div className="oneRow">
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <label>Reason:</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <button type="submit">Submit Request</button>
      </form>

      <h3>My Leave Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5">Loading leave history...</td>
            </tr>
          ) : leaveRequests.length === 0 ? (
            <tr>
              <td colSpan="5">No leave requests found.</td>
            </tr>
          ) : (
            leaveRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.leaveType}</td>
                <td>{request.startDate}</td>
                <td>{request.endDate}</td>
                <td>{request.reason}</td>
                <td className={`status ${request.status.toLowerCase()}`}>
                  {request.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestLeave;
