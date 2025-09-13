import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyWallet.css';
import { FaDownload, FaSearch, FaFilter } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';

export default function MyWallet() {
  const { balance, transactions, addMoney, getStatistics } = useWallet();
  const [addAmount, setAddAmount] = useState('');
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const navigate = useNavigate();

  // Handle adding money to wallet
  const handleAddMoney = (e) => {
    e.preventDefault();
    const amount = Number(addAmount);
    
    try {
      addMoney(amount);
      setAddAmount('');
      setIsAddingMoney(false);
      setShowAddSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowAddSuccess(false);
      }, 3000);
    } catch (error) {
      alert(error.message);
    }
  };

  // Get wallet statistics from context
  const calculateStatistics = getStatistics;

  // Filter transactions based on type and search term
  useEffect(() => {
    let filtered = [...transactions];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(term) ||
        transaction.campaignTitle?.toLowerCase().includes(term) ||
        transaction.amount.toString().includes(term)
      );
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, filterType, searchTerm]);


  // Download transactions as CSV
  const downloadTransactionsCSV= () => {
    // Create CSV content
    const headers = ['Date', 'Time', 'Type', 'Description', 'Amount', 'Status'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.time,
        t.type,
        `"${t.description}"`,
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
    link.setAttribute('download', `wallet_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  useEffect(() => {
    setFilteredTransactions([...transactions]);
  }, [transactions]);

  return (
    <div className="container wallet-container">
      <div className="wallet-header">
        <h1>My Wallet</h1>
        <p className="wallet-subtitle">Manage your funds and transactions</p>
      </div>
      
      <div className="wallet-image-container">
        <img 
          src="https://www.shutterstock.com/image-photo/woman-held-jar-filled-cash-600nw-2473176517.jpg" 
          alt="Wallet" 
          className="wallet-header-image" 
        />
      </div>

      {showAddSuccess && (
        <div className="add-money-success">
          <div className="success-icon">✅</div>
          <div className="success-message">
            <h3>Money Added Successfully!</h3>
            <p>₹{addAmount} has been added to your wallet.</p>
          </div>
        </div>
      )}

      <div className="wallet-stats-container">
        <div className="wallet-stats-card">
          <h2>Wallet Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Total Added</div>
              <div className="stat-value credit">₹{calculateStatistics().totalAdded.toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value debit">₹{calculateStatistics().totalSpent.toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Current Balance</div>
              <div className="stat-value">₹{balance.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="wallet-grid">
        <div className="wallet-balance-card">
          <div className="balance-header">
            <h2>Available Balance</h2>
            <button 
              className="btn btn-add-money" 
              onClick={() => setIsAddingMoney(true)}
            >
              Add Money
            </button>
          </div>
          <div className="balance-amount">
            <span className="currency">₹</span>
            <span className="amount">{balance.toLocaleString()}</span>
          </div>
          
          {isAddingMoney && (
            <div className="add-money-form-container">
              <form className="add-money-form" onSubmit={handleAddMoney}>
                <h3>Add Money to Wallet</h3>
                <div className="form-group">
                  <label htmlFor="amount">Amount (₹)</label>
                  <input
                    type="number"
                    id="amount"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-cancel" onClick={() => setIsAddingMoney(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-confirm">
                    Add Money
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="recent-transactions-card">
          <div className="transactions-header">
            <h2>Transaction History</h2>
            <button 
              className="download-btn" 
              onClick={downloadTransactionsCSV}
              title="Download transaction history"
            >
              <FaDownload /> Download
            </button>
          </div>
          
          <div className="transaction-filters">
            <div className="search-filter">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search transactions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="type-filter">
              <button 
                className={`filter-btn ${showFilterOptions ? 'active' : ''}`}
                onClick={() => setShowFilterOptions(!showFilterOptions)}
              >
                <FaFilter /> Filter
              </button>
              
              {showFilterOptions && (
                <div className="filter-dropdown">
                  <button 
                    className={`filter-option ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                  >
                    All Transactions
                  </button>
                  <button 
                    className={`filter-option ${filterType === 'credit' ? 'active' : ''}`}
                    onClick={() => setFilterType('credit')}
                  >
                    Money Added
                  </button>
                  <button 
                    className={`filter-option ${filterType === 'debit' ? 'active' : ''}`}
                    onClick={() => setFilterType('debit')}
                  >
                    Donations
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="transactions-list">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-title">
                      {transaction.type === 'debit' && transaction.campaignTitle ? 
                        `Donation to ${transaction.campaignTitle}` : 
                        transaction.description}
                    </div>
                    <div className="transaction-date">{transaction.date} at {transaction.time}</div>
                    {transaction.type === 'debit' && transaction.ngoName && (
                      <div className="transaction-ngo">NGO: {transaction.ngoName}</div>
                    )}
                  </div>
                  <div className={`transaction-amount ${transaction.type === 'credit' ? 'credit' : 'debit'}`}>
                    {transaction.type === 'credit' ? '+' : '-'} ₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}