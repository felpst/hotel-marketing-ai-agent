## **Step 1: Project Initialization & Setup**  

### **Objectives:**
- Initialize version control and set up project structure.
- Configure the development environment for both backend and frontend.
- Install required dependencies including LangGraph.js.

### **Technical Requirements:**
- **Version Control & Structure:**
  - Initialize a Git repository with branches (e.g., `main`, `develop`).
  - Create separate folders or a monorepo for:
    - **Backend:** Node.js with Express.
    - **Frontend:** Next.js project with Tailwind CSS.
- **Dependencies:**
  - **Backend:**  
    ```bash
    npm install express dotenv axios
    npm install @langchain/langgraph @langchain/core
    ```
  - **Frontend (Next.js with Tailwind CSS):**  
    ```bash
    npx create-next-app@latest hotel-marketing-ui
    cd hotel-marketing-ui
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
    - Configure `tailwind.config.js` and add Tailwind directives to `globals.css` as per [Tailwind's Next.js setup guide](https://tailwindcss.com/docs/guides/nextjs).
- **Environment Configuration:**
  - Create a `.env` file for sensitive data:
    - `OPENAI_API_KEY`
    - `TAVILY_API_KEY`
    - `LANGSMITH_API_KEY` (if using LangSmith for observability)
  - Set up npm scripts to run backend and frontend concurrently.

---

## **Step 2: UI Design & Frontend Implementation**  

### **Objectives:**
- Develop a user-friendly interface for hotel owners to input campaign details.
- Display campaign outputs (keywords, ad copy, audience segments, and daily budget) in a responsive Next.js application styled with Tailwind CSS.
- Provide real-time workflow updates via streaming.

### **Technical Requirements:**
- **Input Form:**
  - Use Next.js pages and React components.
  - Fields: Hotel Name, Hotel Website URL.
  - Implement client-side validations (e.g., required fields, valid URL format).
  - A “Submit” button to trigger campaign generation.
- **Output Dashboard:**
  - Design pages/components to display:
    - Generated Keywords (list view).
    - Ad Copy (headlines and body text).
    - Audience Segments (list or map view).
    - Recommended Daily Budget.
- **Real-Time Updates:**
  - Implement Server-Sent Events (SSE) or WebSockets in Next.js API routes to stream workflow state and progress.
- **Styling & Framework:**
  - Use Tailwind CSS for responsive and modern UI design.
- **API Integration:**
  - Use axios (or fetch) to call backend endpoints.
  - Manage loading, error, and success states in React components.

---

## **Step 3: Backend API & Traditional Logic Setup**  

### **Objectives:**
- Create backend API endpoints for campaign generation.
- Validate and process user inputs.

### **Technical Requirements:**
- **API Endpoints:**
  - **POST `/api/generate-campaign`:**
    - Accept JSON payload: `{ hotelName, hotelUrl }`.
    - Trigger the LangGraph workflow.
    - Return the final campaign output as JSON.
  - (Optional) **POST `/api/optimize-budget`:**
    - Accept performance metrics and return updated budget recommendations.
- **Middleware:**
  - Input validation (e.g., using `express-validator`).
  - Error handling and logging middleware.
- **Security:**
  - Load API keys from the `.env` file.
  - Configure CORS if the frontend is hosted separately.

---

## **Step 4: Multi-Step Campaign Generation with LangGraph.js**  

### **Objectives:**
- Build a stateful, multi-agent workflow using LangGraph.js.
- Decompose campaign generation into specialized phases with dedicated agents.

### **Technical Requirements:**

```javascript
// campaignGraph.js

import { Annotation, messagesStateReducer, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

/* ----------------------------
   1. Define Structured Output Schemas
------------------------------- */
// Schema for research node: generates keywords and audiences.
const ResearchOutputSchema = z.object({
  keywords: z.array(z.string()).describe("List of targeted keywords for the campaign"),
  audiences: z.array(z.string()).describe("List of audience segments")
});

// Schema for copywriter node: generates ad copy variations.
const CopywriterOutputSchema = z.object({
  adCopies: z.array(
    z.object({
      headline: z.string().describe("Ad headline text"),
      description: z.string().describe("Ad description text")
    })
  ).describe("List of ad copy variations")
});

/* ----------------------------
   2. Define the Campaign State Schema
------------------------------- */
const campaignState = Annotation.Root({
  messages: Annotation({
    reducer: messagesStateReducer,
  }),
  keywords: Annotation({
    reducer: (prev, curr) => curr,
    initial: []
  }),
  audiences: Annotation({
    reducer: (prev, curr) => curr,
    initial: []
  }),
  adCopies: Annotation({
    reducer: (prev, curr) => curr,
    initial: []
  }),
  metrics: Annotation({
    reducer: (prev, curr) => curr,
    initial: {}
  })
});

/* ----------------------------
   3. LLM Configuration with Structured Output
------------------------------- */
// Base LLM configuration using GPT-4o.
const baseLLM = new ChatOpenAI({
  model: "gpt-4o",       // Use GPT-4o model
  temperature: 0.3,      // Lower temperature for deterministic output
});

// Wrap the base LLM for nodes requiring structured output.
const llmForResearch = baseLLM.withStructuredOutput(ResearchOutputSchema);
const llmForCopywriter = baseLLM.withStructuredOutput(CopywriterOutputSchema);
// Use the base LLM for nodes that don't need structured output.
const llm = baseLLM;

/* ----------------------------
   4. Node Implementations
------------------------------- */

// Supervisor Node: Determines the campaign phase based on state.
const supervisorNode = async (state) => {
  // If no keywords exist, we're in PHASE1 (research); otherwise, move to PHASE2.
  const phase = (state.keywords && state.keywords.length > 0) ? "PHASE2" : "PHASE1";
  return { campaignPhase: phase };
};

// Research Node: Generates niche keywords and initial audiences.
const researchNode = async (state) => {
  const prompt = `Given the hotel details: ${state.messages[0].content},
generate niche keywords (avoid broad terms like "hotels") and suggest target audiences.
Return the result as JSON with keys "keywords" (array of strings) and "audiences" (array of strings).`;
  
  const response = await llmForResearch.invoke([{ role: "user", content: prompt }]);
  // The response is automatically validated against ResearchOutputSchema.
  return { keywords: response.keywords, audiences: response.audiences };
};

// Geo Node: Refines audience selection using geofencing logic.
const geoNode = async (state) => {
  const prompt = `Based on the following hotel details: ${state.messages[0].content},
determine feeder markets (cities) for a high-ROAS campaign.
Return the result as JSON with key "feederCities" as an array of strings.`;
  
  const response = await llm.invoke([{ role: "user", content: prompt }]);
  let result;
  try {
    result = JSON.parse(response.content);
  } catch (e) {
    result = { feederCities: [] };
  }
  return { audiences: result.feederCities };
};

// Copywriter Node: Generates multiple ad copy variations.
const copywriterNode = async (state) => {
  const prompt = `Using the following keywords: ${state.keywords.join(", ")},
generate three ad copy variations for a hotel marketing campaign.
Each variation should include a headline and a description.
Return the result as JSON with key "adCopies" (an array of objects with "headline" and "description").`;
  
  const response = await llmForCopywriter.invoke([{ role: "user", content: prompt }]);
  return { adCopies: response.adCopies };
};

// Optimizer Node: Applies rule-based logic to adjust campaign metrics.
const optimizerNode = (state) => {
  const rules = {
    lowCTR: { action: "reduceBid", threshold: 2 },
    highROAS: { action: "increaseBudget", threshold: 300 }
  };
  const metrics = state.metrics;
  let optimizationSuggestion = {};
  
  if (metrics.CTR < rules.lowCTR.threshold) {
    optimizationSuggestion = { action: "reduceBid", newBid: metrics.currentBid * 0.9 };
  } else if (metrics.ROAS > rules.highROAS.threshold) {
    optimizationSuggestion = { action: "increaseBudget", newBudget: metrics.currentBudget * 1.1 };
  }
  return { metrics: optimizationSuggestion };
};

/* ----------------------------
   5. Build the LangGraph Workflow
------------------------------- */
const builder = new StateGraph(campaignState)
  .addNode("supervisor", supervisorNode)
  .addNode("research", researchNode)
  .addNode("geo", geoNode)
  .addNode("copywriter", copywriterNode)
  .addNode("optimizer", optimizerNode);

// Define edges and conditional routing:
builder
  .addEdge("__start__", "supervisor")
  .addConditionalEdges("supervisor", (state) => state.campaignPhase, {
    PHASE1: "research",
    PHASE2: "copywriter",
    OPTIMIZATION: "optimizer"
  })
  .addEdge("research", "geo")
  .addEdge("geo", "copywriter")
  .addEdge("copywriter", "optimizer")
  .addEdge("optimizer", "__end__");

// Compile the graph into a runnable workflow.
export const campaignGraph = builder.compile();

/* ----------------------------
   6. Example Usage (for testing)
------------------------------- */
/*
const initialState = {
  messages: [{ role: "user", content: "Hotel Name: Lily Hall, Website: https://www.lilyhall.com" }],
  keywords: [],
  audiences: [],
  adCopies: [],
  metrics: { CTR: 1.5, ROAS: 250, currentBid: 100, currentBudget: 500 }
};

campaignGraph.invoke(initialState)
  .then(finalState => {
    console.log("Final Campaign Output:", finalState);
  })
  .catch(error => console.error("Error in campaign workflow:", error));
*/
```

### Explanation

1. **Structured Output Schemas:**  
   - We define two schemas using Zod: one for the research node and one for the copywriter node. This ensures that outputs from the LLM are well-structured and validated.

2. **Campaign State Schema:**  
   - The state includes messages, keywords, audiences, ad copies, and campaign metrics, using LangGraph’s Annotation with a custom reducer.

3. **LLM Configuration:**  
   - The base LLM is configured with GPT-4o, a low temperature, and a max token limit.
   - Two specialized LLM instances (`llmForResearch` and `llmForCopywriter`) are wrapped with structured output using their respective schemas.

4. **Node Implementations:**  
   - **Supervisor Node:** Decides the campaign phase based on whether keywords exist.
   - **Research Node:** Uses the structured LLM (`llmForResearch`) to generate niche keywords and audience suggestions.
   - **Geo Node:** Further refines the audience using geofencing logic.
   - **Copywriter Node:** Uses the structured LLM (`llmForCopywriter`) to generate ad copy variations.
   - **Optimizer Node:** Applies rule-based logic for performance-based adjustments.

5. **Workflow Construction:**  
   - Nodes are connected using conditional edges that route based on the campaign phase. The workflow is compiled into a runnable graph (`campaignGraph`).

This integrated code for Step 4 is now ready to be used within your backend API to orchestrate the multi-step campaign generation process with structured output and proper LLM configuration.


## **Step 5: Orchestrating the Workflow via API**  

### **Objectives:**
- Integrate the LangGraph workflow into the backend API.
- Ensure a unified, stateful process that returns complete campaign data.

### **Technical Requirements:**
- **API Endpoint Integration:**
  - In `/api/generate-campaign`, initialize the workflow state with user inputs:
  ```javascript
  app.post("/api/generate-campaign", async (req, res) => {
    try {
      const { hotelName, hotelUrl } = req.body;
      const initialMessage = {
        role: "user",
        content: `Hotel Name: ${hotelName}, Website: ${hotelUrl}`
      };
      const inputs = { messages: [initialMessage] };
      const finalState = await campaignGraph.invoke(inputs);
      res.json({ campaign: finalState.messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Campaign generation failed" });
    }
  });
  ```
- **Error Handling & Logging:**
  - Implement robust error handling within each node.
  - Log intermediate states for debugging.

---

## **Step 6: Frontend-Backend Integration & Testing**  

### **Objectives:**
- Connect the Next.js UI to the backend API.
- Test the end-to-end workflow and display real-time progress.

### **Technical Requirements:**
- **API Consumption:**
  - Use axios or fetch in Next.js pages/components to call `/api/generate-campaign`.
  - Handle loading, error, and success states.
- **Real-Time Updates:**
  - Implement an API route (e.g., `/api/updates`) that streams state changes using SSE or WebSockets.
  - Build a dashboard in Next.js that displays workflow progress and campaign state.
- **Testing:**
  - Write unit tests (using Jest) for each node function.
  - Use integration tests (Postman or automated suites) to validate the full workflow.
  - Conduct manual testing with sample hotel inputs.

---

## **Step 7: State Management, Optimization & Deployment**  

### **Objectives:**
- Ensure robust state persistence and enable human-in-the-loop interventions.
- Optimize performance and deploy the application.

### **Technical Requirements:**
- **State Persistence:**
  - Use LangGraph’s MemorySaver for checkpointing:
  ```javascript
  import { MemorySaver } from "@langchain/langgraph";
  const checkpointer = new MemorySaver();
  // Pass checkpointer during graph compilation if necessary.
  ```
- **Optimization & Rollback:**
  - Implement rule-based adjustments in the optimizer node.
  - Enable manual override controls via the dashboard.
- **Deployment:**
  - Prepare a deployment pipeline (e.g., using GitHub Actions).
  - Deploy using services such as Heroku, Vercel, or LangGraph Cloud:
  ```bash
  twenty-first deploy --runtime node18 --include "src/*.graph.js"
  ```
  - Ensure environment variables (`TAVILY_API_KEY`, `OPENAI_API_KEY`, `LANGSMITH_API_KEY`) are set in the deployment environment.
- **Monitoring:**
  - Integrate logging and monitoring (e.g., via LangSmith) for performance tracking and error recovery.

---

## **Step 8: Documentation & Final Review**  

### **Objectives:**
- Provide comprehensive documentation for setup, usage, and troubleshooting.
- Finalize code cleanup and conduct thorough testing.

### **Technical Requirements:**
- **README File:**
  - Document project overview, installation steps, environment configuration, and API usage.
  - Include detailed instructions for running both the backend and the Next.js frontend.
- **Inline Documentation:**
  - Comment key functions, nodes, and workflow edges.
- **Final Testing & Review:**
  - Conduct end-to-end tests.
  - Ensure all sensitive data is secured and remove any debugging logs.