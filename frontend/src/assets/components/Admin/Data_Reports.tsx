import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import "../../../css/data_reports.css";
import Papa from "papaparse";
import api from "../../../services/api";

// This allows admin to generate and download data reports
export function Data_Reports() {
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");

    // if (!admin) {
    //   navigate("/"); // redirect to home page if ur not admin
    // }
  }, [navigate]);

  // Fetching all necessary data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [donRes, userRes, charityRes] = await Promise.all([
          api.get("/admin/donations"),
          api.get("/admin/users"),
          api.get("/admin/charities"),
        ]);

        if (donRes.data.status === "success") setDonations(donRes.data.donations);
        if (userRes.data.status === "success") setUsers(userRes.data.users);
        if (charityRes.data.status === "success") setCharities(charityRes.data.charities);
      } catch (err) {
        console.error("API failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Controlling report generation
  const generateReportDonations = () => {
    const donationData = donations.map((d) => ({
      Date: d.donation_date,
      Status: d.donation_status,
      DonorID: d.donor_ID,
      Items: d.items?.length || 0,
    }));

    const csv = Papa.unparse(donationData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "donation_report.csv",
    );
  };
  //report for users
  const generateReportUsers = () => {
    const userData = users.map((u) => ({
      UserID: u.user_ID,
      Name: u.user_name,
      Email: u.user_email,
      Registered: u.created_date || "",
    }));

    const csv = Papa.unparse(userData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "users_report.csv",
    );
  };
  //report for sustainability
  const generateReportSustainability = () => {
    const totalCO2 = donations.reduce(
      (sum, d) => sum + (d.items?.length || 0) * 1.5,
      0,
    );
    const sustainabilityData = [{ TotalCO2Reduced_kg: totalCO2 }];

    const csv = Papa.unparse(sustainabilityData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "sustainability_report.csv",
    );
  };
  //report for charities
  const generateReportCharities = () => {
    const charityData = charities.map((c) => {
      const donationsReceived = donations.filter(
        (d) => d.charity?.charity_ID === c.charity_ID,
      ).length;
      return {
        Charity: c.charity_name,
        DonationsReceived: donationsReceived,
        Contact: c.contact_person,
        Email: c.charity_email,
        Address: c.charity_address,
      };
    });

    const csv = Papa.unparse(charityData);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      "charity_report.csv",
    ); // we uses papaparse to convert json to csv and file-saver to download the file
  };

  // Generate all reports at once
  
  const generateAllReports = () => {
    generateReportDonations();
    generateReportUsers();
    generateReportSustainability();
    generateReportCharities();
  };
  //temporary console logs for insoection why the other 2 (charity, and user report arent genrated)
  // console.log("USERS:", users);
  // console.log("CHARITIES:", charities);
  // console.log("DONATIONS:", donations);
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
                <td>Donations Report</td>
                <td>Shows number of donations per day.</td>
                <td>
                  <button onClick={generateReportDonations}>Download</button>
                </td>
              </tr>

              <tr>
                <td>User Report</td>
                <td>Lists new registered users for the period.</td>
                <td>
                  <button onClick={generateReportUsers}>Download</button>
                </td>
              </tr>

              <tr>
                <td>Sustainability Report</td>
                <td>Displays total CO₂ reduced through donations.</td>
                <td>
                  <button onClick={generateReportSustainability}>
                    Download
                  </button>
                </td>
              </tr>

              <tr>
                <td>Charity Report</td>
                <td>
                  Shows each charity’s total donations received with contact
                  info.
                </td>
                <td>
                  <button onClick={generateReportCharities}>Download</button>
                </td>
              </tr>

              <tr>
                <td>
                  <strong>All Reports</strong>
                </td>
                <td>Generate and download all reports at once.</td>
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
