import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";
import "../../../css/modal.css";

export function View_Inventory() {
  const role = localStorage.getItem("role"); // 11 = charity, 12 = admin
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ category: "", type: "" });

  useEffect(() => {
    let url = "http://localhost:8000/api/inventory";

    // Charity sees only their inventory
    if (role === "11" && user.charity_ID) {
      url += `?charity_ID=${user.charity_ID}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const items = data.inventory || [];
        setInventory(items);
        setFilteredInventory(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [role, user.charity_ID]);

  const handleFilterChange = (e) => {
    const updatedFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(updatedFilters);

    const filtered = inventory.filter((item) => {
      const matchCategory =
        updatedFilters.category === "" ||
        item.category.toLowerCase() === updatedFilters.category.toLowerCase();

      const matchItem =
        updatedFilters.type === "" ||
        item.item.toLowerCase().includes(updatedFilters.type.toLowerCase());

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
          <ul>
            <li>
              <Link to="/charity_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

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
          <option value="">All Types</option>
          <option value="shirt">Shirt</option>
          <option value="trouser">Trouser</option>
          <option value="jacket">Jacket</option>
          <option value="shoe">Shoes</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Size</th>
                <th>Image</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.inventory_ID}>
                    <td>{item.inventory_ID}</td>
                    <td>{item.item}</td>
                    <td>{item.category}</td>
                    <td>{item.size}</td>
                    <td>{item.image || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No items found for your charity </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default View_Inventory;
