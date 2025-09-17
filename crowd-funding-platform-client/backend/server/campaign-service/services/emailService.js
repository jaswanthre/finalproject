import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("Razorpay Key ID:", process.env.EMAIL_USER);
console.log(
  "Razorpay Key Secret:",
  process.env.EMAIL_PASS ? "Loaded " : "Missing "
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendCampaignEmail = async (recipients, campaign) => {
  const mailOptions = {
    from: `"Crowdfunding Portal" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject: ` New Campaign: ${campaign.title}`,
    html: `
      <h2>${campaign.title}</h2>
      <p><b>By:</b> ${campaign.ngo_email}</p>
      <p><b>Target:</b> ₹${campaign.target_amount}</p>
      <p>${campaign.description}</p>
      <img src="${campaign.campaign_image}" alt="Campaign Image" width="400"/>
      <br/><br/>
      <a href="http://localhost:5173/donate/${campaign.campaign_id}">
         Click here to Support this Campaign
      </a>
    `,
  };

  await transporter.sendMail(mailOptions);
};
