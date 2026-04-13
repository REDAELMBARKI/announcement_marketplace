import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../../css/records.css";
import "../../../css/modal.css";

export function View_Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [assignedCharity, setAssignedCharity] = useState("");
  const [userRole, setUserRole] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchUsers();
    fetchCharities();
    fetchRoles();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    // if (!admin) {
    //   navigate("/"); //redirect to home page if ur not admin
    // }
  }, [navigate]);

  const fetchUsers = () => {
    fetch("http://localhost:8000/api/user-management/view-users")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setUsers(data.users);
          setFilteredUsers(data.users);
        } else showMessage("Error fetching users", "error");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  };

  const fetchCharities = () => {
    fetch("http://localhost:8000/api/user-management/charities-list")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setCharities(data.charities);
      })
      .catch((err) => console.error("Error fetching charities:", err));
  };

  const fetchRoles = () => {
    fetch("http://localhost:8000/api/user-management/roles")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setRoles(data.roles);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  };

  useEffect(() => {
    let results = users;
    if (searchTerm.trim()) {
      results = results.filter((u) =>
        u.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (roleFilter.trim()) {
      results = results.filter(
        (u) => (u.role_name || "").toLowerCase() === roleFilter.toLowerCase(),
      );
    }
    setFilteredUsers(results);
  }, [searchTerm, roleFilter, users]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setUserRole(user.role_name || "");
    setAssignedCharity(user.charity_ID || "");
    setShowEditModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    fetch(
      `http://localhost:8000/api/user-management/users/${userToDelete.user_ID}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    )
      .then(async (res) => {
        // Some delete endpoints return no JSON body- avoid crash
        let data = {};
        try {
          data = await res.json();
        } catch (e) {
          // No JSON returned- treat HTTP 200 as success
          if (res.ok) {
            data = { status: "success" };
          } else {
            throw new Error("Non-JSON response from server");
          }
        }

        if (data.status === "success") {
          showMessage("User deleted successfully", "success");

          setUsers((prev) =>
            prev.filter((u) => u.user_ID !== userToDelete.user_ID),
          );
          setFilteredUsers((prev) =>
            prev.filter((u) => u.user_ID !== userToDelete.user_ID),
          );
        } else {
          showMessage(data.message || "Error deleting user", "error");
        }

        setShowDeleteModal(false);
        setUserToDelete(null);
      })
      .catch((err) => {
        console.error("Error:", err);
        showMessage("Network error occurred", "error");
        setShowDeleteModal(false);
      });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updateData = {};
    // Promote charity_staff- admin
    if (userRole === "admin") updateData.role_name = "admin";
    // Update assigned charity
    if (selectedUser.role_name === "charity_staff")
      updateData.charity_id = assignedCharity;

    fetch(
      `http://localhost:8000/api/user-management/users/${selectedUser.user_ID}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          showMessage("User updated successfully", "success");
          fetchUsers();
          setShowEditModal(false);
        } else showMessage(data.message || "Error updating user", "error");
      })
      .catch((err) => {
        console.error("Error:", err);
        showMessage("Network error occurred", "error");
      });
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
          {roles.map((role) => (
            <option key={role.role_id} value={role.role_name}>
              {role.role_name}
            </option>
          ))}
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
                  <th>Assigned Charity</th>
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
                      <td>{user.role_name}</td>
                      <td>{user.charity_name || "N/A"}</td>
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
                    <td colSpan="6">No users found.</td>
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
                    <label>Assign to Charity:</label>
                    <select
                      value={assignedCharity}
                      onChange={(e) => setAssignedCharity(e.target.value)}
                      required
                    >
                      <option value="">Select Charity</option>
                      {charities.map((c) => (
                        <option key={c.charity_ID} value={c.charity_ID}>
                          {c.charity_name}
                        </option>
                      ))}
                    </select>
                  </div>
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
