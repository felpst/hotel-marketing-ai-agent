import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { campaignGraph } from '../../graph/campaignGraph';
import { HumanMessage } from '@langchain/core/messages';

const router = Router();

// Validation middleware for campaign generation
const validateCampaignInput = [
  body('hotelName')
    .trim()
    .notEmpty()
    .withMessage('Hotel name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('hotelUrl')
    .trim()
    .notEmpty()
    .withMessage('Hotel website URL is required')
    .isURL()
    .withMessage('Invalid hotel website URL'),
  body('hotelDetails')
    .optional()
    .isObject()
    .withMessage('Hotel details must be an object if provided')
];

interface HotelDetails {
  [key: string]: unknown;
}

interface CampaignRequest extends Request {
  body: {
    hotelName: string;
    hotelUrl: string;
    hotelDetails?: HotelDetails;
  }
}

interface OptimizationRequest extends Request {
  body: {
    metrics: {
      CTR?: number;
      ROAS?: number;
      currentBid?: number;
      currentBudget?: number;
    }
  }
}

// Campaign generation endpoint
router.post('/generate', validateCampaignInput, async (req: CampaignRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hotelName, hotelUrl, hotelDetails = {} } = req.body;

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

    console.log('Starting campaign generation for:', hotelName);

    // Run the campaign graph
    const result = await campaignGraph.invoke(initialState, {
      configurable: {
        thread_id: `campaign-${Date.now()}-${hotelName.toLowerCase().replace(/\s+/g, '-')}`
      }
    });

    // Format the response
    const response = {
      status: 'success',
      campaign: {
        keywords: result.keywords || [],
        adCopies: result.adCopies || [],
        audienceLocations: result.audienceLocations || [],
        dailyBudget: result.dailyBudget || 500
      }
    };

    console.log('Campaign generation completed for:', hotelName);
    console.log('Generated response:', JSON.stringify(response, null, 2));
    
    res.json(response);

  } catch (error: unknown) {
    console.error('Campaign generation failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Campaign generation failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// Campaign optimization endpoint
router.post('/optimize', [
  body('metrics').isObject().withMessage('Campaign metrics are required'),
  body('metrics.CTR').isFloat().optional(),
  body('metrics.ROAS').isFloat().optional(),
  body('metrics.currentBid').isFloat().optional(),
  body('metrics.currentBudget').isFloat().optional()
], async (req: OptimizationRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { metrics } = req.body;

    // Initialize optimization state
    const optimizationState = {
      messages: [new HumanMessage(JSON.stringify({ metrics }))],
      keywords: [],
      audienceLocations: [],
      adCopies: [],
      dailyBudget: metrics.currentBudget || 0
    };

    console.log('Starting campaign optimization with metrics:', metrics);

    // Run optimization through the graph
    const result = await campaignGraph.invoke(optimizationState, {
      configurable: {
        thread_id: `optimization-${Date.now()}`
      }
    });

    // Calculate optimization recommendations
    const currentBudget = metrics.currentBudget || 0;
    const recommendedBudget = result.dailyBudget;
    const budgetChange = recommendedBudget - currentBudget;
    
    const optimizationResponse = {
      status: 'success',
      optimization: {
        currentMetrics: {
          CTR: metrics.CTR || 0,
          ROAS: metrics.ROAS || 0
        },
        recommendations: {
          action: budgetChange > 0 ? 'increase' : budgetChange < 0 ? 'decrease' : 'maintain',
          budget: recommendedBudget,
          message: `Recommended daily budget: $${recommendedBudget}`
        }
      }
    };

    res.json(optimizationResponse);

  } catch (error: unknown) {
    console.error('Campaign optimization failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Campaign optimization failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router; 