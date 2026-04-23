import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../../css/records.css";
import "../../../css/modal.css";
import api from "../../../services/api";

export function Admin_Inventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", type: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const buildImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:8000/storage/${path.replace("public/", "")}`;
  };

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    // if (!admin) {
    //   navigate("/"); // redirect to home page if ur not admin
    // }
  }, [navigate]);

  // Fetch inventory from backend
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await api.get("/admin/inventory");
        if (response.data.status === "success") {
          const items = response.data.inventory.map(item => ({
            inventory_ID: item.id,
            item: item.name,
            category: item.category.toLowerCase(),
            quantity: item.quantity,
            condition: item.condition,
            recommended_age: item.recommended_age,
            gender: item.gender,
            donation_date: item.created_at,
            image: item.image_url
          }));
          setInventory(items);
          setFilteredInventory(items);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    const filtered = inventory.filter((item) => {
      const matchCategory =
        updated.category === "" || item.category === updated.category;

      const matchItem =
        updated.type === "" || item.item?.toLowerCase().includes(updated.type);

      return matchCategory && matchItem;
    });

    setFilteredInventory(filtered);
  };

  const handleReset = () => {
    setFilters({ category: "", type: "" });
    setFilteredInventory(inventory);
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Inventory</h2>
        </div>
        <div className="return-right">
          <Link to="/admin_dashboard">Return</Link>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          <option value="womens">Women's</option>
          <option value="mens">Men's</option>
          <option value="girls">Girls</option>
          <option value="boys">Boys</option>
        </select>

        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Items</option>
          <option value="shirt">Shirt</option>
          <option value="trouser">Trouser</option>
          <option value="jacket">Jacket</option>
          <option value="shoe">Shoes</option>
          <option value="other">Other</option>
        </select>

        <button className="filter-button" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="table-container">
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Donor ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Size</th>
                <th>Image</th>
                <th>Date Donated</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => {
                  const imgUrl = buildImageUrl(item.image);
                  return (
                    <tr key={index}>
                      <td>{item.inventory_ID}</td>
                      <td>{item.donor_ID || "Unknown"}</td>
                      <td>{item.item}</td>
                      <td>{item.category}</td>
                      <td>{item.size}</td>
                      <td>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.item}
                            style={{
                              width: "50px",
                              cursor: "pointer",
                              borderRadius: "4px",
                            }}
                            onClick={() => {
                              setModalImage(imgUrl);
                              setModalOpen(true);
                            }}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        {item.donation_date
                          ? new Date(item.donation_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* IMAGE MODAL */}
      {modalOpen && modalImage && (
        <div className="image-modal" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} className="full-image" />
            <button
              className="close-modal-btn"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Admin_Inventory;
