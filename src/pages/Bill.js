import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = '/api';

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
    const phoneNumber = user.phone || user.phoneNumber;

    fetch(`${API_URL}/transactions?action=history&phoneNumber=${encodeURIComponent(phoneNumber)}`)
.then(res => res.json())
.then(data => {
      if (!data.transactions) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const formatted = data.transactions.map((tx, idx) => {
        let type = tx.type;

        // Normalize types to match button names
        if (type === 'rent_income' || type === 'hut_rent' || type === 'VIP Income') type = 'VIP Purchase';
        if (type === 'withdraw') type = 'Withdrawal';
        if (type === 'deposit') type = 'Deposit';
        if (type === 'referral') type = 'Invitation'; // Team A/B/C rewards
        if (!type) type = tx.method? 'Deposit' : 'Withdrawal';

        return {
          id: tx.id || idx + 1,
          type: type,
          amount: type === 'Withdrawal'? -Math.abs(Number(tx.amount)) : Math.abs(Number(tx.amount)),
          status: tx.status || 'Pending',
          date: new Date(tx.createdAt || tx.created_at).toLocaleString('en-UG')
        };
      });

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

  return React.createElement('div', { style: { padding: "20px", background: "#f5f5f5", minHeight: "100vh" } },
    React.createElement('button', {
      onClick: () => navigate('/dashboard'),
      style: { marginBottom: '15px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }
    }, '← Back'),
    React.createElement('h2', { style: { textAlign: "center", marginBottom: "20px" } }, 'Transaction History'),
    React.createElement('div', { style: { display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "5px" } },
      ["All", "Deposit", "Withdrawal", "VIP Purchase", "Invitation"].map(f =>
        React.createElement('button', {
          key: f,
          onClick: () => setFilter(f),
          style: {
            padding: "8px 16px",
            border: "none",
            borderRadius: "20px",
            background: filter === f? "#ff6b35" : "#fff",
            color: filter === f? "#fff" : "#333",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            cursor: "pointer"
          }
        }, f)
      )
    ),
    React.createElement('div', null,
      loading?
        React.createElement('div', { style: { textAlign: "center", padding: "40px", color: "#666" } }, 'Loading...')
      : filteredBills.length === 0?
        React.createElement('div', { style: { textAlign: "center", padding: "40px", color: "#666" } }, 'No transactions yet')
      : filteredBills.map(bill =>
          React.createElement('div', {
            key: bill.id,
            style: {
              background: "#fff",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }
          },
            React.createElement('div', { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
              React.createElement('div', null,
                React.createElement('h4', { style: { margin: "0 0 4px" } }, bill.type),
                React.createElement('p', { style: { margin: 0, fontSize: "13px", color: "#666" } }, bill.date)
              ),
              React.createElement('div', { style: { textAlign: "right" } },
                React.createElement('p', {
                  style: {
                    margin: "0 0 4px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: getAmountColor(bill.amount)
                  }
                }, `${bill.amount >= 0? "+" : ""}UGX ${Math.abs(bill.amount).toFixed(0).toLocaleString()}`),
                React.createElement('span', {
                  style: {
                    fontSize: "12px",
                    color: getStatusColor(bill.status),
                    fontWeight: "bold"
                  }
                }, bill.status)
              )
            )
          )
        )
    )
  );
}