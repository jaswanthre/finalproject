import { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('cf_wallet_balance');
    return savedBalance ? Number(savedBalance) : 5000;
  });
  
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('cf_wallet_transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  // Save balance to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cf_wallet_balance', balance.toString());
  }, [balance]);
  
  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cf_wallet_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Add money to wallet
  const addMoney = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    const newBalance = balance + numAmount;
    setBalance(newBalance);
    
    // Add transaction record
    const newTransaction = {
      id: Date.now(),
      type: 'credit',
      amount: numAmount,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      description: 'Added money to wallet',
      status: 'completed'
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    return newBalance;
  };

  // Make a donation (deduct from wallet)
  const makeDonation = (amount, campaignId, campaignTitle, campaignImage, ngoName, goalAmount, raisedAmount, location = 'Online') => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    if (numAmount > balance) {
      throw new Error('Insufficient balance in your wallet');
    }
    
    const newBalance = balance - numAmount;
    setBalance(newBalance);
    
    // Calculate new raised amount and progress percentage
    const newRaisedAmount = raisedAmount ? raisedAmount + numAmount : numAmount;
    const progressPercentage = goalAmount ? Math.round((newRaisedAmount / goalAmount) * 100) : 0;
    
    // Add transaction record
    const newTransaction = {
      id: Date.now(),
      type: 'debit',
      amount: numAmount,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      description: `Donation to ${campaignTitle}`,
      campaignId,
      campaignTitle,
      image: campaignImage, // Fix: renamed campaignImage to image for consistency
      campaignImage, // Keep original for backward compatibility
      ngoName,
      goalAmount,
      raisedAmount: newRaisedAmount,
      progressPercentage,
      location: location || 'Online', // Use provided location or default
      status: 'completed'
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    return { newBalance, newRaisedAmount, progressPercentage };
  };

  // Get wallet statistics
  const getStatistics = () => {
    let totalAdded = 0;
    let totalSpent = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        totalAdded += transaction.amount;
      } else if (transaction.type === 'debit') {
        totalSpent += transaction.amount;
      }
    });
    
    return { totalAdded, totalSpent };
  };

  // Get only donation transactions
  const getDonationTransactions = () => {
    return transactions.filter(transaction => 
      transaction.type === 'debit' && transaction.campaignId
    );
  };

  const value = {
    balance,
    transactions,
    addMoney,
    makeDonation,
    getStatistics,
    getDonationTransactions
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => useContext(WalletContext);