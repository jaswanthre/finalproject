# Backend Integration Guide

## Overview

This document provides instructions on how to integrate the frontend donor part with the backend services. The integration has been implemented in the following components:

- DonationForm.jsx
- MyDonations.jsx
- CampaignList.jsx
- CampaignDetail.jsx

## API Clients

Three API clients have been set up in `src/api/client.js`:

1. `client` - Default client for general API calls
2. `donorServiceClient` - Client for donor service API calls
3. `campaignServiceClient` - Client for campaign service API calls

These clients are configured to connect to the following endpoints:

```javascript
baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" // Default client
baseURL: import.meta.env.VITE_DONOR_SERVICE_URL || "http://localhost:3001" // Donor service
baseURL: import.meta.env.VITE_CAMPAIGN_SERVICE_URL || "http://localhost:3002" // Campaign service
```

## Environment Variables

Create or update your `.env` file with the following variables:

```
VITE_API_URL=http://localhost:3000
VITE_DONOR_SERVICE_URL=http://localhost:3001
VITE_CAMPAIGN_SERVICE_URL=http://localhost:3002
```

Adjust the URLs according to your backend setup.

## API Endpoints Used

### Donor Service

- `POST /donation` - Create a new donation
- `GET /donation?donor_email={email}` - Get donations by donor email
- `POST /transaction` - Create a new transaction
- `POST /donation/feedback` - Submit feedback for a donation

### Campaign Service

- `GET /campaign` - Get all campaigns
- `GET /campaign/{id}` - Get campaign details by ID
- `GET /campaign/{id}/updates` - Get campaign updates by campaign ID

## Fallback Mechanism

All components have been updated to use the backend APIs with fallback to the existing mock services if the backend APIs fail. This ensures that the application continues to work even if the backend services are not available.

## Testing

To test the integration:

1. Start the backend services
2. Start the frontend application with `npm run dev`
3. Test the following features:
   - View campaigns list
   - View campaign details
   - Make a donation
   - View donation history
   - Submit feedback for a donation

## Missing Backend Components

The following backend components are required for full integration:

1. **User Authentication Service**:
   - The current implementation uses a simplified authentication mechanism
   - A proper JWT-based authentication system is needed

2. **File Upload Service**:
   - For handling feedback images and campaign media

3. **Email Notification Service**:
   - For sending donation receipts and campaign updates

4. **Payment Gateway Integration**:
   - Currently using a wallet-based system
   - Integration with real payment gateways is needed

## Next Steps

1. Implement proper error handling for API calls
2. Add loading states for API calls
3. Implement pagination for campaigns and donations lists
4. Add unit tests for the integrated components
5. Implement the missing backend components