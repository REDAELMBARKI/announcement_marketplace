import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../../css/records.css";
import "../../../css/modal.css";
import api from "../../../services/api";

export function View_Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    // if (!admin) {
    //   navigate("/"); //redirect to home page if ur not admin
    // }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user-management/view-users");
      if (response.data.status === "success") {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } else showMessage("Error fetching users", "error");
    } catch (err) {
      console.error("Error fetching users:", err);
      showMessage("Error fetching users", "error");
    } finally {
      setLoading(false);
    }
  };

  const normalizeRole = (roleName) =>
    (roleName || "").toLowerCase() === "donor" ? "user" : (roleName || "").toLowerCase();

  useEffect(() => {
    let results = users;
    if (searchTerm.trim()) {
      results = results.filter((u) =>
        u.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (roleFilter.trim()) {
      results = results.filter(
        (u) => normalizeRole(u.role_name) === roleFilter.toLowerCase(),
      );
    }
    setFilteredUsers(results);
  }, [searchTerm, roleFilter, users]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setUserRole(user.role_name || "");
    setShowEditModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await api.delete(`/user-management/users/${userToDelete.user_ID}`);
      if (response.data.status === "success") {
        showMessage("User deleted successfully", "success");
        fetchUsers();
      } else showMessage(response.data.message || "Error deleting user", "error");
    } catch (err) {
      console.error("Error deleting user:", err);
      showMessage("Error deleting user", "error");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updateData = {};
    if (userRole === "admin") updateData.role_name = "admin";

    try {
      const response = await api.put(
        `/user-management/users/${selectedUser.user_ID}`,
        updateData
      );
      if (response.data.status === "success") {
        showMessage("User updated successfully", "success");
        fetchUsers();
        setShowEditModal(false);
      } else showMessage(response.data.message || "Error updating user", "error");
    } catch (err) {
      console.error("Error updating user:", err);
      showMessage("Error updating user", "error");
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleFilterReset = () => {
    setSearchTerm("");
    setRoleFilter("");
    setFilteredUsers(users);
  };

  return (
    <main className="dashboard-main">
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="records-container">
        <div className="header-left">
          <h2>View Users</h2>
        </div>
        <div className="return-right">
          <ul>
            <li>
              <Link to="/admin_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search.."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">Users</option>
        </select>
        <button className="filter-button" onClick={handleFilterReset}>
          Reset
        </button>
      </div>

      <div className="table-container">
        <div className="profile-form button">
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.user_ID}>
                      <td>{user.user_ID}</td>
                      <td>{user.user_name}</td>
                      <td>{user.user_email}</td>
                      <td>{normalizeRole(user.role_name) === "user" ? "user" : user.role_name}</td>
                      <td>
                        {user.role_name === "charity_staff" && (
                          <button onClick={() => handleEdit(user)}>Edit</button>
                        )}
                        {user.role_name !== "admin" && (
                          <button onClick={() => handleDeleteClick(user)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User: {selectedUser.user_name}</h3>
            <form onSubmit={handleUpdateUser}>
              {selectedUser.role_name === "charity_staff" && (
                <>
                  <div className="form-group">
                    <label>Change role to Admin:</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                    >
                      <option value="charity_staff">Charity Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete user{" "}
              <strong>{userToDelete.user_name}</strong>?
            </p>
            <div className="modal-actions">
              <button onClick={confirmDelete}>Delete</button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default View_Users;
