import { StateGraph, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer, MemorySaver } from "@langchain/langgraph";
import { StructuredOutputParser } from "langchain/output_parsers";

/* ----------------------------
   1. Define Structured Output Schemas
------------------------------- */
// Schema for research node: generates keywords and audiences
const ResearchOutputSchema = z.object({
  keywords: z.array(z.string()).describe("List of targeted keywords for the campaign"),
  audiences: z.array(z.string()).describe("List of audience segments")
});

// Schema for copywriter node: generates ad copy variations
const CopywriterOutputSchema = z.object({
  adCopies: z.array(
    z.object({
      headline: z.string().describe("Ad headline text"),
      description: z.string().describe("Ad description text")
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
  audiences: Annotation({
    reducer: (prev: string[], curr: string[]) => curr,
    default: () => [] as string[],
  }),
  adCopies: Annotation({
    reducer: (prev: Array<{ headline: string; description: string }>, curr: Array<{ headline: string; description: string }>) => curr,
    default: () => [] as Array<{ headline: string; description: string }>,
  }),
  metrics: Annotation({
    reducer: (prev: Record<string, number>, curr: Record<string, number>) => ({ ...prev, ...curr }),
    default: () => ({} as Record<string, number>),
  }),
  campaignPhase: Annotation({
    reducer: (prev: string | undefined, curr: string | undefined) => curr,
    default: () => undefined as string | undefined,
  }),
});

/* ----------------------------
   3. LLM Configuration
------------------------------- */
const baseLLM = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3,
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

// Supervisor Node: Determines the campaign phase based on state
const supervisorNode = async (state: typeof StateAnnotation.State) => {
  // If we have metrics, we're in OPTIMIZATION phase
  if (Object.keys(state.metrics).length > 0) {
    return { campaignPhase: "OPTIMIZATION" };
  }
  // If no keywords exist, we're in PHASE1 (research); otherwise, move to PHASE2
  const phase = (state.keywords && state.keywords.length > 0) ? "PHASE2" : "PHASE1";
  return { campaignPhase: phase };
};

// Research Node: Generates niche keywords and initial audiences
const researchNode = async (state: typeof StateAnnotation.State) => {
  // Skip if we're in optimization phase
  if (state.campaignPhase === "OPTIMIZATION") {
    return { keywords: state.keywords, audiences: state.audiences };
  }

  const systemPrompt = new SystemMessage(
    "You are a hotel marketing expert. Generate niche keywords and target audiences based on hotel details."
  );
  
  const format_instructions = researchParser.getFormatInstructions();
  
  const userPrompt = new HumanMessage(
    `Given the hotel details: ${getMessageContent(state.messages[0])},
generate niche keywords (avoid broad terms like "hotels") and suggest target audiences.
Focus on unique selling points and specific customer segments.

${format_instructions}`
  );
  
  const response = await baseLLM.invoke([systemPrompt, userPrompt]);
  
  try {
    const result = await researchParser.parse(getMessageContent(response));
    return { keywords: result.keywords, audiences: result.audiences };
  } catch (error) {
    console.error("Error parsing research node response:", error);
    console.log("Raw response:", getMessageContent(response));
    return { keywords: [], audiences: [] };
  }
};

// Geo Node: Refines audience selection using geofencing logic
const geoNode = async (state: typeof StateAnnotation.State) => {
  // Skip if we're in optimization phase
  if (state.campaignPhase === "OPTIMIZATION") {
    return { audiences: state.audiences };
  }

  const systemPrompt = new SystemMessage(
    "You are a location targeting expert. Determine the best feeder markets for a hotel."
  );
  
  const geoSchema = z.object({
    feederCities: z.array(z.string()).describe("List of high-potential feeder market cities")
  });
  const geoParser = StructuredOutputParser.fromZodSchema(geoSchema);
  const format_instructions = geoParser.getFormatInstructions();
  
  const userPrompt = new HumanMessage(
    `Based on the following hotel details: ${getMessageContent(state.messages[0])},
determine feeder markets (cities) for a high-ROAS campaign.
Consider factors like:
- Travel distance and accessibility
- Income levels and travel patterns
- Seasonal tourism trends

${format_instructions}`
  );
  
  const response = await baseLLM.invoke([systemPrompt, userPrompt]);
  
  try {
    const result = await geoParser.parse(getMessageContent(response));
    return { audiences: [...state.audiences, ...result.feederCities] };
  } catch (error) {
    console.error("Error parsing geo node response:", error);
    console.log("Raw response:", getMessageContent(response));
    return { audiences: state.audiences };
  }
};

// Copywriter Node: Generates multiple ad copy variations
const copywriterNode = async (state: typeof StateAnnotation.State) => {
  // Skip if we're in optimization phase
  if (state.campaignPhase === "OPTIMIZATION") {
    return { adCopies: state.adCopies };
  }

  const systemPrompt = new SystemMessage(
    "You are an expert ad copywriter. Create compelling ad variations based on keywords and audiences."
  );
  
  const format_instructions = copywriterParser.getFormatInstructions();
  
  const userPrompt = new HumanMessage(
    `Using the following keywords: ${state.keywords.join(", ")},
and targeting these audiences: ${state.audiences.join(", ")},
generate three compelling ad copy variations for a hotel marketing campaign.
Each variation should:
- Have a unique selling proposition
- Include emotional triggers
- Be optimized for high CTR

${format_instructions}`
  );
  
  const response = await baseLLM.invoke([systemPrompt, userPrompt]);
  
  try {
    const result = await copywriterParser.parse(getMessageContent(response));
    return { adCopies: result.adCopies };
  } catch (error) {
    console.error("Error parsing copywriter node response:", error);
    console.log("Raw response:", getMessageContent(response));
    return { adCopies: [] };
  }
};

// Optimizer Node: Applies rule-based logic to adjust campaign metrics
const optimizerNode = (state: typeof StateAnnotation.State) => {
  const rules = {
    lowCTR: { action: "reduceBid", threshold: 2 },
    highROAS: { action: "increaseBudget", threshold: 300 }
  };
  const metrics = state.metrics;
  let optimizationSuggestion = {};
  
  if (metrics.CTR && metrics.CTR < rules.lowCTR.threshold) {
    optimizationSuggestion = { 
      action: "reduceBid", 
      newBid: metrics.currentBid ? metrics.currentBid * 0.9 : 0,
      CTR: metrics.CTR,
      ROAS: metrics.ROAS
    };
  } else if (metrics.ROAS && metrics.ROAS > rules.highROAS.threshold) {
    optimizationSuggestion = { 
      action: "increaseBudget", 
      newBudget: metrics.currentBudget ? metrics.currentBudget * 1.1 : 0,
      CTR: metrics.CTR,
      ROAS: metrics.ROAS
    };
  } else {
    optimizationSuggestion = {
      action: "maintain",
      message: "Current performance is within acceptable ranges",
      ...metrics
    };
  }
  return { metrics: optimizationSuggestion };
};

/* ----------------------------
   5. Build the LangGraph Workflow
------------------------------- */
// Define the graph with state and nodes
const workflow = new StateGraph(StateAnnotation)
  .addNode("supervisor", supervisorNode)
  .addNode("research", researchNode)
  .addNode("geo", geoNode)
  .addNode("copywriter", copywriterNode)
  .addNode("optimizer", optimizerNode);

// Add edges and conditional routing
workflow.addEdge("__start__", "supervisor");
workflow.addConditionalEdges(
  "supervisor",
  (state: typeof StateAnnotation.State) => state.campaignPhase || "PHASE1",
  {
    PHASE1: "research",
    PHASE2: "copywriter",
    OPTIMIZATION: "optimizer"
  }
);

// Add sequential edges
workflow.addEdge("research", "geo");
workflow.addEdge("geo", "copywriter");
workflow.addEdge("copywriter", "optimizer");
workflow.addEdge("optimizer", END);

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

// Compile the workflow into a runnable graph
export const campaignGraph = workflow.compile({ checkpointer });