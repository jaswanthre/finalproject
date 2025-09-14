import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext";
import { FaDownload } from "react-icons/fa";
import "./MyTransactions.css";

export default function MyTransactions() {
  const { user } = useAuth();
  const { transactions: allTransactions, getDonationTransactions } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get only donation transactions from wallet context
    const donationTransactions = getDonationTransactions();
    setTransactions(donationTransactions);
    setLoading(false);
  }, [getDonationTransactions]);

  if (!user) {
    return (
      <div className="container transactions-container">
        <div className="card transactions-card">
          <h2>My Transactions</h2>
          <p>Please log in to view your transactions.</p>
        </div>
      </div>
    );
  }

  // Calculate total donated amount
  const totalDonated = transactions.reduce((sum, transaction) => {
    return sum + transaction.amount;
  }, 0);

  // Download transactions as CSV
  const downloadTransactionsCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Time', 'Campaign', 'NGO', 'Amount', 'Status'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.time,
        `"${t.campaignTitle || 'N/A'}"`,
        `"${t.ngoName || 'N/A'}"`,
        t.amount,
        t.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `donation_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container transactions-container">
      <div className="card transactions-card">
        <div className="transactions-header-title">
          <h2>My Donations</h2>
          <p className="transactions-subtitle">Your donation history</p>
          <button 
            className="download-btn" 
            onClick={downloadTransactionsCSV}
            title="Download donation history"
          >
            <FaDownload /> Download
          </button>
        </div>
        
        <div className="transactions-summary">
          <div className="balance-card">
            <span className="balance-label">Total Donated</span>
            <span className="balance-amount">₹{totalDonated.toLocaleString()}</span>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : transactions.length === 0 ? (
          <p className="no-transactions">You don't have any transactions yet.</p>
        ) : (
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-header">
                  <div className="transaction-title-wrapper">
                    <h3 className="transaction-title">{transaction.campaignTitle}</h3>
                    {transaction.type === 'donation' && (
                      <span className="transaction-ngo">{transaction.ngoName}</span>
                    )}
                  </div>
                  <span className="transaction-amount negative">
                    - ₹{transaction.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="transaction-details">
                  <div className="transaction-detail-item">
                    <span className="detail-label">Date & Time</span>
                    <span className="detail-value">
                      {transaction.date} at {transaction.time}
                    </span>
                  </div>
                  
                  <div className="transaction-detail-item">
                    <span className="detail-label">Campaign</span>
                    <span className="detail-value">{transaction.campaignTitle || 'N/A'}</span>
                  </div>
                  
                  <div className="transaction-detail-item">
                    <span className="detail-label">NGO</span>
                    <span className="detail-value">{transaction.ngoName || 'N/A'}</span>
                  </div>
                  
                  <div className="transaction-detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`detail-value status-${transaction.status}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                {transaction.type === 'donation' && transaction.campaignId && (
                  <div className="transaction-actions">
                    <a href={`/campaigns/${transaction.campaignId}`} className="btn btn-sm btn-outline">
                      View Campaign
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}