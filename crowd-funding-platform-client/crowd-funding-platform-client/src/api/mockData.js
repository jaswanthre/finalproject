// Essential mock data for campaigns when API is unavailable

export const campaigns = [
  {
    id: "1",
    title: "Clean Water Initiative",
    description: "Providing clean drinking water to rural communities in need.",
    ngoName: "WaterCare Foundation",
    image: "https://images.unsplash.com/photo-1581152201225-5c2864dafec1?q=80&w=1000&auto=format&fit=crop",
    goalAmount: 500000,
    currentAmount: 325000,
    location: "Rural Districts",
    updates: [
      { id: 1, text: "First water purification system installed successfully!", date: "2023-06-15" },
    ],
  },
  {
    id: "2",
    title: "Education for All",
    description: "Supporting education for underprivileged children by providing school supplies and scholarships.",
    ngoName: "EduCare Trust",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
    goalAmount: 750000,
    currentAmount: 420000,
    location: "Urban Schools",
    updates: [
      { id: 1, text: "Distributed school supplies to 500 students.", date: "2023-05-10" },
    ],
  },
];

// Function to get campaign by ID
export const getCampaignById = (id) => {
  return campaigns.find(campaign => campaign.id === id) || null;
};