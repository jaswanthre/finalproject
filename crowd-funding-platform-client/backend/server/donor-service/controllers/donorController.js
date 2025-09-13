// import pool from "../db/index.js";

// Mock database for testing
const mockDonations = [
  {
    donation_id: "123e4567-e89b-12d3-a456-426614174000",
    campaign_id: "223e4567-e89b-12d3-a456-426614174001",
    donor_email: "test@example.com",
    amount: 100.00,
    payment_method: "Credit Card",
    payment_status: "SUCCESS",
    created_at: "2023-06-15T10:30:00Z"
  },
  {
    donation_id: "223e4567-e89b-12d3-a456-426614174002",
    campaign_id: "223e4567-e89b-12d3-a456-426614174001",
    donor_email: "donor@example.com",
    amount: 50.00,
    payment_method: "PayPal",
    payment_status: "SUCCESS",
    created_at: "2023-06-16T14:20:00Z"
  }
];

export const createDonation = async (req, res) => {
  try {
    const { campaign_id, donor_email, amount, payment_method } = req.body;
    
    // Mock implementation
    const newDonation = {
      donation_id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      campaign_id,
      donor_email,
      amount,
      payment_method,
      payment_status: "SUCCESS",
      created_at: new Date().toISOString()
    };
    
    mockDonations.push(newDonation);
    res.status(201).json(newDonation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock implementation
    const donation = mockDonations.find(d => d.donation_id === id);
    
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }
    
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    
    // Mock implementation
    const donationIndex = mockDonations.findIndex(d => d.donation_id === id);
    
    if (donationIndex === -1) {
      return res.status(404).json({ error: "Donation not found" });
    }
    
    mockDonations[donationIndex].payment_status = payment_status;
    res.json(mockDonations[donationIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock implementation
    const donationIndex = mockDonations.findIndex(d => d.donation_id === id);
    
    if (donationIndex === -1) {
      return res.status(404).json({ error: "Donation not found" });
    }
    
    const deletedDonation = mockDonations.splice(donationIndex, 1)[0];
    res.json(deletedDonation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDonationsByDonorEmail = async (req, res) => {
  try {
    const { donor_email } = req.query;
    if (!donor_email) {
      return res.status(400).json({ error: "Donor email is required" });
    }
    
    // Mock implementation
    const donations = mockDonations.filter(d => d.donor_email === donor_email);
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
