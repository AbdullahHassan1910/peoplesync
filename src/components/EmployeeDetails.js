import React, { useEffect, useState } from "react";
import "./EmployeeDetails.css";
import axios from "axios";
import { Button, Dialog, DialogTitle, DialogActions } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

const EmployeeDetails = () => {
  const [employeesD, setEmployeesD] = useState([
    {
      id: 1,
      name: "John Doe",
      position: "Software Engineer",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      address: "123 Elm Street, Cityville",
      dob: "1990-01-15",
      description: "Passionate about coding and solving complex problems.",
      salary: 80000,
      benefits: 5000,
      deductions: 2000,
      netSalary: 83000,
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "UI/UX Designer",
      email: "jane.smith@example.com",
      phone: "987-654-3210",
      address: "456 Oak Avenue, Townsville",
      dob: "1992-03-22",
      description: "Focused on creating user-friendly designs.",
      salary: 75000,
      benefits: 4000,
      deductions: 1500,
      netSalary: 77500,
      image: "https://via.placeholder.com/150",
    },
  ]);
  const [employees, setEmployees] = useState([]);
  const [archives, setArchives] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [showArchives, setShowArchives] = useState(false);

  const fields = [
    "name",
    "phone",
    "dob",
    "gender",
    "idCard",
    "designation",
    "role",
    "employeeType",
    "joiningDate",
    "salary",
    "bankDetails",
    "email",
    "password",
  ];

  const handleEdit = (field) => {
    setEditField(field);
    setEditValue(selectedEmployee[field]);
  };

  const updateHandler = async () => {
    if (!selectedEmployee || !editField) return;
    try {
      const { email } = selectedEmployee;
      const response = await axios.get(
        `https://people-sync-33225-default-rtdb.firebaseio.com/employees.json`
      );
      const employees = response.data;
      const employeeKey = Object.keys(employees).find(
        (key) => employees[key].email === email
      );

      if (employeeKey) {
        await axios.patch(
          `https://people-sync-33225-default-rtdb.firebaseio.com/employees/${employeeKey}.json`,
          { [editField]: editValue }
        );
        setSelectedEmployee({ ...selectedEmployee, [editField]: editValue });
        setEditField(null);
        setEditValue("");
      } else {
        console.error("Employee not found");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };
  const deleteHandler = async (email) => {
    try {
      // 1. Move employee to archives
      const empRes = await axios.get(
        "https://people-sync-33225-default-rtdb.firebaseio.com/employees.json"
      );
      const empData = empRes.data;
      const empKey = Object.keys(empData).find(
        (key) => empData[key].email === email
      );

      if (empKey) {
        const employee = empData[empKey];

        // Save to archives
        await axios.post(
          "https://people-sync-33225-default-rtdb.firebaseio.com/archives.json",
          employee
        );

        // Delete from employees
        await axios.delete(
          `https://people-sync-33225-default-rtdb.firebaseio.com/employees/${empKey}.json`
        );

        console.log("Employee moved to archives");
      } else {
        console.log("Employee not found");
      }

      // 2. Delete from users
      const userRes = await axios.get(
        "https://people-sync-33225-default-rtdb.firebaseio.com/users.json"
      );
      const userData = userRes.data;
      const userKey = Object.keys(userData).find(
        (key) => userData[key].email === email
      );

      if (userKey) {
        await axios.delete(
          `https://people-sync-33225-default-rtdb.firebaseio.com/users/${userKey}.json`
        );
        console.log("User deleted");
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    }
    window.location.reload();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm)
  );

  // const handleEdit = (employee) => {
  //   setEditForm({ ...employee });
  //   setIsEditing(true);
  // };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.id === editForm.id
          ? { ...editForm, netSalary: calculateNetSalary(editForm) }
          : employee
      )
    );
    setIsEditing(false);
    setSelectedEmployee(null);
  };

  const calculateNetSalary = (employee) => {
    const salary = parseFloat(employee.salary) || 0;
    const benefits = parseFloat(employee.benefits) || 0;
    const deductions = parseFloat(employee.deductions) || 0;
    return salary + benefits - deductions;
  };
  const handleDeleteClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirm = (email) => {
    deleteHandler(email);
    setOpenConfirm(false);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          "https://people-sync-33225-default-rtdb.firebaseio.com/employees.json"
        );
        const data = res.data
          ? Object.entries(res.data).map(([id, obj]) => ({ id, ...obj }))
          : [];
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    const fetchArchives = async () => {
      try {
        const res = await axios.get(
          "https://people-sync-33225-default-rtdb.firebaseio.com/archives.json"
        );
        const data = res.data;
        const formatted = Object.keys(data || {}).map((key) => ({
          id: key,
          ...data[key],
        }));
        setArchives(formatted);
      } catch (error) {
        console.error("Error fetching archives:", error);
      }
    };

    fetchEmployees();
    fetchArchives();
  }, []);
  // console.log(employees);
  return (
    <div>
      <div className="search-row">
        <div className="heading-em">
          <h4 className="myTableHeader animate__animated animate__lightSpeedInLeft">
            Employee Details
          </h4>
        </div>

        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search Employee"
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>
      </div>

      {/* List of Employee Profiles */}
      {/* <div className="employee-cards">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="employee-card"
            onClick={() => setSelectedEmployee(employee)}
          >
            <div className="profile-container">
              <div className="profile-circle">
                {employee.name?.charAt(0).toUpperCase()}
              </div>
            </div>

            <h3>{employee.name}</h3>
            <p>{employee.role}</p>
          </div>
        ))}
      </div>
      <div className="employee-cards">
        {archives.map((employee) => (
          <div
            key={employee.id}
            className="employee-card archived"
            onClick={() => setSelectedEmployee(employee)}
          >
            <div className="profile-container">
              <div className="profile-circle">
                {employee.name?.charAt(0).toUpperCase()}
              </div>
            </div>

            <h3>{employee.name}</h3>
            <p>{employee.role}</p>
          </div>
        ))}
      </div> */}

      <div>
        {/* Toggle Switch */}
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
        >
          <label style={{ marginRight: 10 }}>
            {showArchives ? "Archives" : "Actives" + "\u00A0" + "\u00A0"}
          </label>
          <div
            onClick={() => setShowArchives(!showArchives)}
            style={{
              width: 50,
              height: 25,
              background: !showArchives ? "#4caf50" : "#ccc",
              borderRadius: 20,
              position: "relative",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "#fff",
                borderRadius: "50%",
                position: "absolute",
                top: 1.5,
                left: !showArchives ? 26 : 2,
                transition: "0.3s",
              }}
            ></div>
          </div>
        </div>

        {/* Display Cards */}
        <div className="employee-cards">
          {(showArchives ? archives : filteredEmployees).length === 0 ? (
            <h2
              style={{ textAlign: "center", marginTop: "50px", color: "#888" }}
            >
              🧘‍♂️ So empty, it's peaceful.!
            </h2>
          ) : (
            (showArchives ? archives : filteredEmployees).map((employee) => (
              <div
                key={employee.id}
                className="employee-card"
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="profile-container">
                  <div className="profile-circle">
                    {employee.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h3>{employee.name}</h3>
                <p>{employee.role}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Popup for Employee Details */}
      {selectedEmployee && (
        <div
          className="popup-overlay"
          onClick={() => setSelectedEmployee(null)}
        >
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedEmployee(null)}
              style={{
                backgroundColor: "transparent",
                color: "red",
                padding: "15px",
                border: "none",
                cursor: "pointer",
                width: "min-content",
                position: "absolute",
                right: "10px",
                top: "0",
              }}
            >
              X
            </button>
            <div className="profile-container2">
              <div className="profile-circle">
                {selectedEmployee.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="popup-header">
              <h1 style={{ textAlign: "center" }}>{selectedEmployee.name}</h1>
            </div>

            <table className="employee-details">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                  {!showArchives && <th>Edit</th>}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field}>
                    <td>
                      {field === "role" ? (
                        <strong>Department</strong>
                      ) : (
                        <strong>{field.toUpperCase()}</strong>
                      )}
                    </td>
                    <td>
                      {editField === field ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        selectedEmployee[field]
                      )}
                    </td>
                    {!showArchives && (
                      <td>
                        {editField === field ? (
                          <button
                            className="btn1"
                            onClick={updateHandler}
                            style={{ color: "#007bff" }}
                          >
                            ✔
                          </button>
                        ) : (
                          <button
                            className="btn1"
                            onClick={() => handleEdit(field)}
                          >
                            <EditIcon style={{ color: "#007bff" }} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!showArchives && (
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteClick}
                style={{ margin: "auto", marginTop: "20px" }}
              >
                Delete
              </Button>
            )}

            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
              <DialogTitle>Are you sure you want to delete?</DialogTitle>
              <DialogActions>
                <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
                <Button
                  onClick={() => handleConfirm(selectedEmployee.email)}
                  color="error"
                  variant="contained"
                >
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="popup-overlay" onClick={() => setIsEditing(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Employee Details</h3>
            <form>
              <label>
                Full Name:
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Position:
                <input
                  type="text"
                  name="position"
                  value={editForm.position}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Phone:
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Address:
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Date of Birth:
                <input
                  type="date"
                  name="dob"
                  value={editForm.dob}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Salary:
                <input
                  type="number"
                  name="salary"
                  value={editForm.salary}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Benefits:
                <input
                  type="number"
                  name="benefits"
                  value={editForm.benefits}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Deductions:
                <input
                  type="number"
                  name="deductions"
                  value={editForm.deductions}
                  onChange={handleFormChange}
                />
              </label>
              <button type="button" onClick={handleSave}>
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
