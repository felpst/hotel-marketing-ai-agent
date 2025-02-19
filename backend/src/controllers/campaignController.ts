import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

interface CampaignRequest {
  hotelName: string;
  hotelUrl: string;
}

// Temporary mock response until we implement LangGraph.js
const generateMockCampaign = (input: CampaignRequest) => {
  return {
    keywords: [
      'luxury hotel',
      'boutique accommodation',
      'city center hotel',
      'hotel deals',
      'best rates guaranteed'
    ],
    adCopies: [
      {
        headline: `Experience Luxury at ${input.hotelName}`,
        body: 'Discover exceptional comfort and world-class service in the heart of the city.'
      },
      {
        headline: 'Special Offers Available',
        body: 'Book directly for exclusive rates and premium perks. Limited time offer.'
      }
    ],
    audiences: [
      'Business Travelers',
      'Luxury Travelers',
      'Couples',
      'Weekend Getaway Seekers'
    ],
    dailyBudget: 150.00
  };
};

export const generateCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelName, hotelUrl } = req.body as CampaignRequest;

    // TODO: Implement actual LangGraph.js workflow here
    const campaign = generateMockCampaign({ hotelName, hotelUrl });

    res.status(200).json({
      status: 'success',
      data: campaign
    });
  } catch (error) {
    next(new AppError('Failed to generate campaign', 500));
  }
}; 