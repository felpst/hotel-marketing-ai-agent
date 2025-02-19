const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CampaignInput {
  hotelName: string;
  hotelUrl: string;
}

export interface CampaignResponse {
  keywords: string[];
  adCopies: {
    headline: string;
    body: string;
  }[];
  audiences: string[];
  dailyBudget: number;
}

export async function generateCampaign(input: CampaignInput): Promise<CampaignResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating campaign:', error);
    throw error;
  }
}

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