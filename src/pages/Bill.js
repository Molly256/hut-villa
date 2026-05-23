import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = '/api'; // use full URL if backend is separate

export default function Bill() {
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(savedUser);
    const phoneNumber = user.phone;

    fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    })
   .then(res => res.json())
   .then(data => {
      const formatted = (data.transactions || []).map((tx, idx) => ({
        id: idx + 1,
        type: tx.type || (tx.method? 'Deposit' : 'Withdrawal'),
        amount: tx.type === 'Withdrawal'? -tx.amount : tx.amount,
        status: tx.status || 'Pending',
        date: new Date(tx.created_at).toLocaleString('en-UG')
      }));
      setTransactions(formatted);
      setLoading(false);
    })
   .catch(err => {
      console.error(err);
      setTransactions([]);
      setLoading(false);
    });
  }, [navigate]);

  const filteredBills = filter === "All"
   ? transactions
    : transactions.filter(b => b.type === filter);

  const getStatusColor = (status) => {
    if (status === "Completed") return "#28a745";
    if (status === "Pending") return "#ffc107";
    return "#dc3545";
  };

  const getAmountColor = (amount) => {
    return amount >= 0? "#28a745" : "#dc3545";
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
        {["All", "Deposit", "Withdrawal", "VIP Purchase"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "20px",
              background: filter === f? "#ff6b35" : "#fff",
              color: filter === f? "#fff" : "#333",
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
        {loading? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            Loading...
          </div>
        ) : filteredBills.length === 0? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            No transactions yet
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
                    {bill.amount >= 0? "+" : ""}{Math.abs(bill.amount).toLocaleString()} UGX
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