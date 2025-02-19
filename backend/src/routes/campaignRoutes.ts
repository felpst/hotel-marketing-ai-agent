import { Router } from 'express';
import { generateCampaign } from '../controllers/campaignController';
import { validateCampaignInput } from '../middleware/validation';

const router = Router();

router.post('/generate-campaign', validateCampaignInput, generateCampaign);

export default router; 