import axios from 'axios';
import React from 'react';
import CampaignResultCard from '../components/CampaignResultCard';
import OptimizationResultCard from '../components/OptimizationResultCard';

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

interface ConversationState {
  flow: 'initial' | 'generate' | 'optimize';
  collectedData: {
    hotelName?: string;
    hotelUrl?: string;
    metrics?: {
      CTR?: number;
      ROAS?: number;
      currentBudget?: number;
    };
  };
}

interface CampaignResponse {
  status: string;
  campaign?: {
    keywords: string[];
    adCopies: string[];
    audienceLocations: string[];
    dailyBudget: number;
  };
  optimization?: {
    currentMetrics: {
      CTR: number;
      ROAS: number;
    };
    recommendations: {
      action: 'increase' | 'decrease' | 'maintain';
      budget: number;
      message: string;
    };
  };
  error?: string;
}

interface ConversationResponse {
  response: string | React.ReactNode;
  nextState: ConversationState;
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

export const processUserMessage = async (
  message: string, 
  conversationState: ConversationState
): Promise<ConversationResponse> => {
  try {
    // Initial greeting and flow selection
    if (conversationState.flow === 'initial') {
      if (message.toLowerCase().includes('generate') || message.toLowerCase().includes('create') || message.toLowerCase().includes('new')) {
        return {
          response: "I'll help you generate a new marketing campaign. First, what's the name of your hotel?",
          nextState: { ...conversationState, flow: 'generate', collectedData: {} }
        };
      } else if (message.toLowerCase().includes('optimize') || message.toLowerCase().includes('improve')) {
        return {
          response: "I'll help you optimize your existing campaign. Could you share your current CTR (Click-Through Rate) percentage?",
          nextState: { ...conversationState, flow: 'optimize', collectedData: { metrics: {} } }
        };
      } else {
        return {
          response: "I can help you with two things:\n1. Generate a new marketing campaign for your hotel\n2. Optimize an existing campaign\n\nWhich would you like to do?",
          nextState: conversationState
        };
      }
    }

    // Campaign Generation Flow
    if (conversationState.flow === 'generate') {
      const state = { ...conversationState };
      
      if (!state.collectedData.hotelName) {
        state.collectedData.hotelName = message;
        return {
          response: "Great! Now, please provide your hotel's website URL:",
          nextState: state
        };
      }
      
      if (!state.collectedData.hotelUrl) {
        if (!isValidUrl(message)) {
          return {
            response: "That doesn't look like a valid URL. Please provide a valid website URL (e.g., https://yourhotel.com):",
            nextState: state
          };
        }
        state.collectedData.hotelUrl = message;
        
        // Now we have all required data, make the API call
        const { data } = await axios.post<CampaignResponse>(`${API_BASE_URL}/campaign/generate`, {
          hotelName: state.collectedData.hotelName,
          hotelUrl: state.collectedData.hotelUrl
        });
        
        return {
          response: formatCampaignResponse(data),
          nextState: { flow: 'initial', collectedData: {} }
        };
      }
    }

    // Campaign Optimization Flow
    if (conversationState.flow === 'optimize') {
      const state = { ...conversationState };
      const metrics = state.collectedData.metrics || {};
      
      if (metrics.CTR === undefined) {
        const ctr = parseFloat(message);
        if (isNaN(ctr)) {
          return {
            response: "Please provide a valid CTR percentage (e.g., 2.5):",
            nextState: state
          };
        }
        metrics.CTR = ctr;
        return {
          response: "What's your current ROAS (Return on Ad Spend) ratio? For example, if you earn $3 for every $1 spent, enter 3:",
          nextState: { ...state, collectedData: { metrics } }
        };
      }
      
      if (metrics.ROAS === undefined) {
        const roas = parseFloat(message);
        if (isNaN(roas)) {
          return {
            response: "Please provide a valid ROAS number (e.g., 3):",
            nextState: state
          };
        }
        metrics.ROAS = roas;
        return {
          response: "What's your current daily budget in dollars?",
          nextState: { ...state, collectedData: { metrics } }
        };
      }
      
      if (metrics.currentBudget === undefined) {
        const budget = parseFloat(message);
        if (isNaN(budget)) {
          return {
            response: "Please provide a valid budget amount (e.g., 500):",
            nextState: state
          };
        }
        metrics.currentBudget = budget;
        
        // Now we have all required data, make the API call
        const { data } = await axios.post<CampaignResponse>(`${API_BASE_URL}/campaign/optimize`, {
          metrics
        });
        
        return {
          response: formatOptimizationResponse(data),
          nextState: { flow: 'initial', collectedData: {} }
        };
      }
    }

    // Fallback
    return {
      response: "I'm not sure how to help with that. Would you like to generate a new campaign or optimize an existing one?",
      nextState: { flow: 'initial', collectedData: {} }
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      response: 'Sorry, I encountered an error. Please try again.',
      nextState: { flow: 'initial', collectedData: {} }
    };
  }
};

const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

const formatCampaignResponse = (data: CampaignResponse): React.ReactNode => {
  if (!data.campaign) return 'Sorry, I could not generate a campaign at this time.';

  // Map string array to proper ad copy format if needed
  const formattedAdCopies = Array.isArray(data.campaign.adCopies) 
    ? data.campaign.adCopies.map(ad => {
        if (typeof ad === 'string') {
          return {
            headline: 'Ad Copy',
            body: ad
          };
        }
        return ad;
      })
    : [];

  return React.createElement(CampaignResultCard, {
    dailyBudget: data.campaign.dailyBudget,
    keywords: data.campaign.keywords,
    adCopies: formattedAdCopies,
    audienceLocations: data.campaign.audienceLocations,
    timestamp: new Date().toLocaleTimeString()
  });
};

const formatOptimizationResponse = (data: CampaignResponse): React.ReactNode => {
  if (!data.optimization) return 'Sorry, I could not optimize the campaign at this time.';

  return React.createElement(OptimizationResultCard, {
    currentMetrics: data.optimization.currentMetrics,
    recommendations: data.optimization.recommendations,
    timestamp: new Date().toLocaleTimeString()
  });
}; 