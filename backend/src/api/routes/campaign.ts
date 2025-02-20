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
    // Check for validation errors
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
      audiences: [],
      adCopies: [],
      metrics: {},
      campaignPhase: undefined
    };

    console.log('Starting campaign generation for:', hotelName);
    console.log('Initial state:', JSON.stringify(initialState, null, 2));

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
        hotelInfo,
        keywords: result.keywords,
        audiences: result.audiences,
        adCopies: result.adCopies,
        metrics: result.metrics,
        phase: result.campaignPhase
      }
    };

    console.log('Campaign generation completed for:', hotelName);
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
      messages: [],
      keywords: [],
      audiences: [],
      adCopies: [],
      metrics,
      campaignPhase: 'OPTIMIZATION'
    };

    console.log('Starting campaign optimization with metrics:', metrics);

    // Run optimization through the graph
    const result = await campaignGraph.invoke(optimizationState, {
      configurable: {
        thread_id: `optimization-${Date.now()}`
      }
    });

    res.json({
      status: 'success',
      optimization: {
        metrics: result.metrics,
        recommendations: {
          bid: result.metrics.newBid,
          budget: result.metrics.newBudget
        }
      }
    });

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