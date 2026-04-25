import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import "../../../css/data_reports.css";
import Papa from "papaparse";
import api from "../../../services/api";

export function Data_Reports() {
  const [reportsData, setReportsData] = useState({
    users: [],
    topUsers: [],
    userActivity: [],
    location: [],
    sales: [],
    donations: [],
    listingsPerformance: [],
    inventory: [],
    timeBased: null,
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    // if (!admin) {
    //   navigate("/"); // redirect to home page if ur not admin
    // }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [
          usersRes,
          topUsersRes,
          userActivityRes,
          locationRes,
          salesRes,
          donationsRes,
          listingsPerformanceRes,
          inventoryRes,
          timeBasedRes,
        ] = await Promise.all([
          api.get("/reports/users"),
          api.get("/reports/top-users"),
          api.get("/reports/user-activity"),
          api.get("/reports/location"),
          api.get("/reports/sales"),
          api.get("/reports/donations"),
          api.get("/reports/listings-performance"),
          api.get("/reports/inventory"),
          api.get("/reports/time-based"),
        ]);

        setReportsData({
          users: usersRes.data.data || [],
          topUsers: topUsersRes.data.data || [],
          userActivity: userActivityRes.data.data || [],
          location: locationRes.data.data || [],
          sales: salesRes.data.data || [],
          donations: donationsRes.data.data || [],
          listingsPerformance: listingsPerformanceRes.data.data || [],
          inventory: inventoryRes.data.data || [],
          timeBased: timeBasedRes.data.data || null,
        });
      } catch (err) {
        console.error("API failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadCsv = (data, filename) => {
    const csv = Papa.unparse(data);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      filename,
    );
  };

  const generateUsersReport = () => {
    downloadCsv(reportsData.users, "01_users_report.csv");
  };

  const generateTopUsersReport = () => {
    downloadCsv(reportsData.topUsers, "02_top_users_report.csv");
  };

  const generateUserActivityReport = () => {
    downloadCsv(reportsData.userActivity, "03_user_activity_report.csv");
  };

  const generateLocationReport = () => {
    downloadCsv(reportsData.location, "04_location_report_users_by_city.csv");
  };

  const generateSalesReport = () => {
    downloadCsv(reportsData.sales, "05_sales_report.csv");
  };

  const generateDonationsReport = () => {
    downloadCsv(reportsData.donations, "06_donations_report_day_by_day.csv");
  };

  const generateListingsPerformanceReport = () => {
    downloadCsv(reportsData.listingsPerformance, "07_listings_performance_report.csv");
  };

  const generateInventoryReport = () => {
    downloadCsv(reportsData.inventory, "08_inventory_report_by_category.csv");
  };

  const generateTimeBasedReport = () => {
    const summaryRows = reportsData.timeBased?.summary
      ? [
          {
            best_hour: reportsData.timeBased.summary.best_hour,
            best_hour_posts: reportsData.timeBased.summary.best_hour_posts,
            best_day: reportsData.timeBased.summary.best_day,
            best_day_posts: reportsData.timeBased.summary.best_day_posts,
          },
        ]
      : [];

    downloadCsv(
      [
        ...summaryRows,
        { separator: "hourly_breakdown" },
        ...(reportsData.timeBased?.hourly || []),
        { separator: "daily_breakdown" },
        ...(reportsData.timeBased?.daily || []),
      ],
      "09_time_based_report.csv",
    );
  };

  const generateAllReports = () => {
    generateUsersReport();
    generateTopUsersReport();
    generateUserActivityReport();
    generateLocationReport();
    generateSalesReport();
    generateDonationsReport();
    generateListingsPerformanceReport();
    generateInventoryReport();
    generateTimeBasedReport();
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Generate Reports</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/admin_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Report Type</th>
                <th>Description</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1 - Users Report</td>
                <td>All registered users with base profile data.</td>
                <td>
                  <button onClick={generateUsersReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>2 - Top Users Report</td>
                <td>Best sellers / best donaters by listing activity.</td>
                <td>
                  <button onClick={generateTopUsersReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>3 - User Activity Report</td>
                <td>Posts, sales, donations, views, and latest activity by user.</td>
                <td>
                  <button onClick={generateUserActivityReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>4 - Location Report</td>
                <td>Users grouped by city.</td>
                <td>
                  <button onClick={generateLocationReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>5 - Sales Report</td>
                <td>Number of sales listings day by day.</td>
                <td>
                  <button onClick={generateSalesReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>6 - Donations Report</td>
                <td>Number of donations day by day.</td>
                <td>
                  <button onClick={generateDonationsReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>7 - Listings Performance Report</td>
                <td>Product / Views / Contacts performance.</td>
                <td>
                  <button onClick={generateListingsPerformanceReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>8 - Inventory Report</td>
                <td>Number of products by category.</td>
                <td>
                  <button onClick={generateInventoryReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>9 - Time-Based Report</td>
                <td>Best publishing hour/day plus hourly and daily breakdown.</td>
                <td>
                  <button onClick={generateTimeBasedReport}>Download</button>
                </td>
              </tr>

              <tr>
                <td>All Reports</td>
                <td>Generate and download all reports at once in order.</td>
                <td>
                  <button onClick={generateAllReports}>Download All</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Data_Reports;
