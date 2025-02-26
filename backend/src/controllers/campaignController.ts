import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { campaignGraph } from '../graph/campaignGraph';
import { HumanMessage } from "@langchain/core/messages";

interface CampaignRequest {
  hotelName: string;
  hotelUrl: string;
  hotelDetails?: Record<string, any>;
}

export const generateCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelName, hotelUrl, hotelDetails = {} } = req.body as CampaignRequest;

    // Prepare hotel information
    const hotelInfo = {
      name: hotelName,
      website: hotelUrl,
      ...hotelDetails
    };

    // Initialize the workflow state
    const initialState = {
      messages: [new HumanMessage(JSON.stringify(hotelInfo))],
      keywords: [],
      audienceLocations: [],
      adCopies: [],
      dailyBudget: 0
    };

    // Run the campaign graph
    const result = await campaignGraph.invoke(initialState, {
      configurable: {
        thread_id: `campaign-${Date.now()}-${hotelName.toLowerCase().replace(/\s+/g, '-')}`
      }
    });

    // Format the response
    const campaign = {
      keywords: result.keywords || [],
      adCopies: result.adCopies || [],
      audienceLocations: result.audienceLocations || [],
      dailyBudget: result.dailyBudget || 500
    };

    res.status(200).json({
      status: 'success',
      data: campaign
    });
  } catch (error) {
    console.error('Campaign generation failed:', error);
    next(new AppError('Failed to generate campaign', 500));
  }
}; 