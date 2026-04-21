import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export default function Charity_Distribution_Records() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const charityId = user?.charity_ID;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const loadInventory = () => {
    fetch(`http://localhost:8000/api/inventory?charity_ID=${charityId}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.inventory || []);
        setLoading(false);
      })
      .catch(() => {
        showMessage("Failed to load inventory.", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (charityId) loadInventory();
  }, [charityId]);

  const handleDistribute = async (inventoryId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/inventory/${inventoryId}/distribute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();

      if (res.ok && data.status === "success") {
        showMessage("Item has been successfully distributed!", "success");
        loadInventory();
      } else {
        showMessage("Failed to distribute item.", "error");
      }
    } catch (err) {
      showMessage("Network error occurred.", "error");
    }
  };

  return (
    <main>
      {message && (
        <div className={`form-message ${messageType}`}>{message}</div>
      )}

      <div className="records-container">
        <div className="header-left">
          <h2>Distribution Records</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/charity_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Loading inventory...</p>
        ) : items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Size</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((i) => (
                <tr key={i.inventory_ID}>
                  <td>{i.item}</td>
                  <td>{i.category}</td>
                  <td>{i.size || "N/A"}</td>
                  <td>{i.distributed ? "Distributed" : "Pending"}</td>
                  <td>
                    {i.distributed ? (
                      <button disabled className="distributed-btn">
                        Sent
                      </button>
                    ) : (
                      <button
                        className="distribute-btn"
                        onClick={() => handleDistribute(i.inventory_ID)}
                      >
                        Send
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
