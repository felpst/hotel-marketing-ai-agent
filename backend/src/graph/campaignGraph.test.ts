import * as dotenv from 'dotenv';
import { HumanMessage } from "@langchain/core/messages";
import { campaignGraph } from "./campaignGraph";

// Load environment variables
dotenv.config();

async function testCampaignGraph() {
  try {
    console.log("Starting Campaign Graph Test...\n");

    // Initial hotel details
    const hotelDetails = {
      name: "Ocean View Resort",
      location: "Maui, Hawaii",
      features: [
        "Beachfront location",
        "Luxury spa",
        "5-star dining",
        "Ocean view rooms",
        "Private beach access"
      ],
      priceRange: "$400-$800 per night",
      targetMarket: "Luxury travelers"
    };

    // Initialize the graph with hotel details
    const initialState = {
      messages: [new HumanMessage(JSON.stringify(hotelDetails))],
      keywords: [],
      audienceLocations: [],
      adCopies: [],
      dailyBudget: 0
    };

    console.log("Initial State:", JSON.stringify(initialState, null, 2), "\n");

    // Run the graph with thread_id configuration
    console.log("Running Campaign Graph...\n");
    const result = await campaignGraph.invoke(initialState, {
      configurable: {
        thread_id: "test-campaign-" + Date.now()
      }
    });

    // Log the results
    console.log("Final State:");
    console.log("Keywords:", result.keywords);
    console.log("Audience Locations:", result.audienceLocations);
    console.log("Ad Copies:", JSON.stringify(result.adCopies, null, 2));
    console.log("Daily Budget:", result.dailyBudget);

  } catch (error) {
    console.error("Error running campaign graph:", error);
  }
}

// Run the test
testCampaignGraph(); 