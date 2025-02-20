import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface HotelDetails {
  hotelName: string;
  hotelUrl: string;
}

export interface AdCopy {
  headline: string;
  body: string;
}

export interface Campaign {
  keywords: string[];
  adCopies: AdCopy[];
  audienceLocations: string[];
  dailyBudget: number;
}

export interface CampaignMetrics {
  CTR: number;
  ROAS: number;
  currentBid?: number;
  currentBudget?: number;
}

export interface OptimizationResult {
  currentMetrics: {
    CTR: number;
    ROAS: number;
  };
  recommendations: {
    action: string;
    budget: number;
    message: string;
  };
}

const api = {
  generateCampaign: async (hotelDetails: HotelDetails): Promise<Campaign> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/campaign/generate`, {
        hotelName: hotelDetails.hotelName,
        hotelUrl: hotelDetails.hotelUrl
      });
      
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Failed to generate campaign');
      }

      const campaign = response.data.campaign || {};
      
      // Ensure we have all required fields with proper defaults
      return {
        keywords: Array.isArray(campaign.keywords) ? campaign.keywords : [],
        adCopies: Array.isArray(campaign.adCopies) ? campaign.adCopies.map((ad: any) => ({
          headline: ad.headline || '',
          body: ad.body || ''
        })) : [],
        audienceLocations: Array.isArray(campaign.audienceLocations) ? campaign.audienceLocations : [],
        dailyBudget: typeof campaign.dailyBudget === 'number' ? campaign.dailyBudget : 500
      };
    } catch (error) {
      console.error('Error generating campaign:', error);
      throw error;
    }
  },

  optimizeCampaign: async (metrics: CampaignMetrics): Promise<OptimizationResult> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/campaign/optimize`, { metrics });
      
      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'Failed to optimize campaign');
      }
      
      return response.data.optimization;
    } catch (error) {
      console.error('Error optimizing campaign:', error);
      throw error;
    }
  }
};

export default api;

// Function to check backend health
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
} 