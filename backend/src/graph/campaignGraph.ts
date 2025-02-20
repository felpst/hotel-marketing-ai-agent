import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { z } from "zod";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer, MemorySaver } from "@langchain/langgraph";
import { StructuredOutputParser } from "langchain/output_parsers";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure required environment variables are present
if (!process.env.TAVILY_API_KEY) {
  throw new Error('TAVILY_API_KEY environment variable is not set');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

/* ----------------------------
   1. Define Structured Output Schemas
------------------------------- */
// Schema for research node: generates keywords and audience locations
const ResearchOutputSchema = z.object({
  keywords: z.array(z.string()).describe("List of 5-10 targeted keywords for the campaign"),
  audienceLocations: z.array(z.string()).describe("List of specific locations to target")
});

// Schema for copywriter node: generates ad copy variations
const CopywriterOutputSchema = z.object({
  adCopies: z.array(
    z.object({
      headline: z.string().describe("Ad headline text"),
      body: z.string().describe("Ad body text")
    })
  ).describe("List of ad copy variations")
});

// Create structured output parsers
const researchParser = StructuredOutputParser.fromZodSchema(ResearchOutputSchema);
const copywriterParser = StructuredOutputParser.fromZodSchema(CopywriterOutputSchema);

/* ----------------------------
   2. Define State Schema
------------------------------- */
const StateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [] as BaseMessage[],
  }),
  keywords: Annotation({
    reducer: (prev: string[], curr: string[]) => curr,
    default: () => [] as string[],
  }),
  audienceLocations: Annotation({
    reducer: (prev: string[], curr: string[]) => curr,
    default: () => [] as string[],
  }),
  adCopies: Annotation({
    reducer: (prev: Array<{ headline: string; body: string }>, curr: Array<{ headline: string; body: string }>) => curr,
    default: () => [] as Array<{ headline: string; body: string }>,
  }),
  dailyBudget: Annotation({
    reducer: (prev: number, curr: number) => curr,
    default: () => 0,
  })
});

/* ----------------------------
   3. LLM Configuration
------------------------------- */
const baseLLM = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3,
});

// Initialize Tavily search with API key from environment
const tavily = new TavilySearchResults({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 3
});

/* ----------------------------
   4. Node Implementations
------------------------------- */

// Helper function to safely get message content
const getMessageContent = (message: BaseMessage): string => {
  const content = message.content;
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(item => 
      typeof item === 'string' ? item : JSON.stringify(item)
    ).join(' ');
  }
  return JSON.stringify(content);
};

// Research Node: Generates keywords and audience locations
const researchNode = async (state: typeof StateAnnotation.State) => {
  const hotelInfo = JSON.parse(getMessageContent(state.messages[0]));
  
  // Use Tavily to research the hotel and its market
  const searchQuery = `${hotelInfo.name} hotel reviews location amenities luxury market analysis`;
  const searchResults = await tavily.invoke(searchQuery);
  
  const systemPrompt = new SystemMessage(
    `You are a Google SEM expert specializing in luxury hotel marketing. Your task is to:
    1. Generate 5-10 highly specific, long-tail keywords that will maximize ROAS
    2. Identify 3-5 specific geographic locations (feeder markets) to target
    
    Use this market research data to inform your decisions:
    ${JSON.stringify(searchResults, null, 2)}
    
    Guidelines:
    - Keywords should focus on luxury travel, unique experiences, and high-value amenities
    - Target locations should be wealthy areas or cities with high travel spending
    - Consider both domestic and international markets where relevant
    - Focus on locations with direct flights or easy access to the hotel`
  );
  
  const format_instructions = researchParser.getFormatInstructions();
  
  const userPrompt = new HumanMessage(
    `Based on this hotel information: ${getMessageContent(state.messages[0])},
    and the market research data above, generate targeted keywords and identify specific audience locations.
    
    Requirements:
    - Keywords should be specific and focused on high ROAS
    - Locations should be specific cities or regions that are likely to be profitable feeder markets
    
    ${format_instructions}`
  );
  
  const response = await baseLLM.invoke([systemPrompt, userPrompt]);
  
  try {
    const result = await researchParser.parse(getMessageContent(response));
    return {
      keywords: result.keywords,
      audienceLocations: result.audienceLocations
    };
  } catch (error) {
    console.error("Error parsing research node response:", error);
    // Provide meaningful fallback values based on the hotel's location
    const defaultLocations = hotelInfo.location?.includes("New York") 
      ? ["Boston", "Philadelphia", "Washington DC", "Toronto", "London"]
      : ["New York City", "Los Angeles", "Chicago", "Miami", "London"];
    
    return { 
      keywords: [
        "luxury hotel experience",
        "5-star hotel accommodation",
        "premium city hotel",
        "luxury weekend getaway",
        "exclusive hotel suite"
      ],
      audienceLocations: defaultLocations
    };
  }
};

// Copywriter Node: Generates ad copy variations
const copywriterNode = async (state: typeof StateAnnotation.State) => {
  const systemPrompt = new SystemMessage(
    `You are an expert ad copywriter specializing in Google Ads for luxury hotels. Your task is to create compelling ad copies that:
    1. Match the search intent of the targeted keywords
    2. Highlight unique selling points and luxury amenities
    3. Include emotional triggers and create a sense of exclusivity
    4. Follow Google Ads best practices and character limits
    
    Each ad copy must have:
    - A compelling headline (max 30 characters)
    - Engaging body text (max 90 characters)
    - Clear call to action
    - Focus on luxury and unique experiences`
  );
  
  const format_instructions = copywriterParser.getFormatInstructions();
  
  const userPrompt = new HumanMessage(
    `Create luxury hotel ad copies for: ${getMessageContent(state.messages[0])}
    
    Using these keywords: ${state.keywords.join(", ")}
    Targeting these locations: ${state.audienceLocations.join(", ")}
    
    Requirements:
    - Create 4 unique ad variations
    - Each ad should be tailored to luxury travelers
    - Include unique selling points and amenities
    - Strictly follow character limits:
      * Headlines: 30 characters max
      * Body: 90 characters max
    
    ${format_instructions}`
  );
  
  const response = await baseLLM.invoke([systemPrompt, userPrompt]);
  
  try {
    const result = await copywriterParser.parse(getMessageContent(response));
    return { adCopies: result.adCopies };
  } catch (error) {
    console.error("Error parsing copywriter node response:", error);
    return {
      adCopies: [
        {
          headline: "Luxury Stay at Warwick NY",
          body: "Experience timeless elegance in Manhattan. 4-star luxury, prime location. Book your stay today."
        },
        {
          headline: "Stay at Warwick, Heart of NY",
          body: "Historic charm meets modern luxury. Steps from Central Park & 5th Avenue. Reserve now."
        }
      ]
    };
  }
};

// Budget Node: Determines initial daily budget
const budgetNode = async (state: typeof StateAnnotation.State) => {
  const systemPrompt = new SystemMessage(
    `You are a Google Ads budget optimization expert for luxury hotels. Analyze the hotel information and campaign targeting to recommend an initial daily budget that will:
    1. Maximize ROAS for a luxury hotel audience
    2. Ensure sufficient impression share in competitive markets
    3. Account for high-value keyword competition and costs
    4. Consider the target locations and their typical CPCs
    
    For luxury hotels, consider:
    - Higher average CPCs for luxury travel keywords
    - Higher conversion value due to room rates
    - Competitive bidding in prime locations
    - Seasonal variations in demand`
  );
  
  const userPrompt = new HumanMessage(
    `Based on:
    - Hotel: ${getMessageContent(state.messages[0])}
    - Keywords: ${state.keywords.join(", ")}
    - Target Locations: ${state.audienceLocations.join(", ")}
    
    Recommend a daily budget for this luxury hotel campaign.
    Consider the competitive landscape and high-value nature of luxury hotel keywords.
    Return only the number (e.g., "500" for $500/day).`
  );
  
  const response = await baseLLM.invoke([systemPrompt, userPrompt]);
  
  try {
    const budget = parseFloat(getMessageContent(response).replace(/[^0-9.]/g, ''));
    return { dailyBudget: isNaN(budget) ? 500 : budget };
  } catch (error) {
    console.error("Error parsing budget node response:", error);
    return { dailyBudget: 500 };
  }
};

/* ----------------------------
   5. Build the LangGraph Workflow
------------------------------- */
const workflow = new StateGraph(StateAnnotation)
  .addNode("research", researchNode)
  .addNode("copywriter", copywriterNode)
  .addNode("budget", budgetNode);

// Add sequential edges
workflow.addEdge("__start__", "research");
workflow.addEdge("research", "copywriter");
workflow.addEdge("copywriter", "budget");
workflow.addEdge("budget", END);

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

// Compile the workflow into a runnable graph
export const campaignGraph = workflow.compile({ checkpointer });