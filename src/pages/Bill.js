import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockBills = [
  { id: 1, type: "Deposit", amount: 50000, status: "Completed", date: "2025-10-03 14:22" },
  { id: 2, type: "Withdrawal", amount: -20000, status: "Pending", date: "2025-10-02 09:15" },
  { id: 3, type: "VIP Purchase", amount: -100000, status: "Completed", date: "2025-10-01 18:40" },
  { id: 4, type: "Daily Reward", amount: 6000, status: "Completed", date: "2025-10-01 00:01" },
  { id: 5, type: "Withdrawal", amount: -15000, status: "Failed", date: "2025-09-30 22:10" },
];

export default function Bill() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const filteredBills = filter === "All" 
    ? mockBills 
    : mockBills.filter(b => b.type === filter);

  const getStatusColor = (status) => {
    if (status === "Completed") return "#28a745";
    if (status === "Pending") return "#ffc107";
    return "#dc3545";
  };

  const getAmountColor = (amount) => {
    return amount >= 0 ? "#28a745" : "#dc3545";
  };

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ marginBottom: '15px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Transaction History</h2>
      
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "5px" }}>
        {["All", "Deposit", "Withdrawal", "VIP Purchase", "Daily Reward"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "20px",
              background: filter === f ? "#ff6b35" : "#fff",
              color: filter === f ? "#fff" : "#333",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div>
        {filteredBills.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No transactions found
          </div>
        ) : (
          filteredBills.map(bill => (
            <div 
              key={bill.id} 
              style={{ 
                background: "#fff", 
                padding: "15px", 
                borderRadius: "12px", 
                marginBottom: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px" }}>{bill.type}</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{bill.date}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ 
                    margin: "0 0 4px", 
                    fontSize: "18px", 
                    fontWeight: "bold",
                    color: getAmountColor(bill.amount)
                  }}>
                    {bill.amount >= 0 ? "+" : ""}{Math.abs(bill.amount).toLocaleString()} UGX
                  </p>
                  <span style={{ 
                    fontSize: "12px", 
                    color: getStatusColor(bill.status),
                    fontWeight: "bold"
                  }}>
                    {bill.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}