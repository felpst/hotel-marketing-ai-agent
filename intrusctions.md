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

#### **A. Define a Rich State Schema & Initialize LangGraph:**
- Create a state model to persist campaign data:
  ```javascript
  import { Annotation, messagesStateReducer, StateGraph } from "@langchain/langgraph";

  const campaignState = Annotation.Root({
    messages: Annotation({
      reducer: messagesStateReducer,
    }),
    keywords: [],
    audiences: [],
    adCopies: [],
    metrics: {}
  });
  ```

#### **B. Design Specialized Agents (Nodes):**
- **Supervisor Agent:**  
  Orchestrates and routes tasks based on campaign phase.
  ```javascript
  const supervisorNode = async (state) => {
    // Determine campaign phase based on state (e.g., presence of keywords)
    const phase = state.keywords && state.keywords.length ? "PHASE2" : "PHASE1";
    return { campaignPhase: phase };
  };
  ```
- **Research Agent (Keyword & Audience Discovery):**
  ```javascript
  import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
  const researchNode = async (state) => {
    const tools = [new TavilySearchResults({ maxResults: 15 })];
    const agent = createReactAgent({
      llm: new ChatOpenAI(), // Configure your LLM as needed
      tools,
      systemMessage: "Find niche keywords avoiding broad terms like 'hotels'."
    });
    const result = await agent.invoke(state);
    return { keywords: result.keywords, audiences: result.audiences };
  };
  ```
- **Geo-Targeting Agent:**
  ```javascript
  const geoNode = async (state) => {
    const prompt = `Based on the website content and hotel rating, determine the feeder markets for high-ROAS campaigns.`;
    const response = await yourLLM.invoke(prompt);
    return { audiences: response.feederCities };
  };
  ```
- **Ad Copy Generator Agent:**
  ```javascript
  const copywriterNode = async (state) => {
    const generator = await createReactAgent({
      llm: new ChatOpenAI({ temperature: 0.7 }),
      systemMessage: `Generate 3 ad variations using the following keywords: ${state.keywords.join(", ")}.`
    });
    const result = await generator.invoke(state);
    return { adCopies: result.adCopies };
  };
  ```
- **Optimizer Agent:**
  ```javascript
  const optimizerNode = (state) => {
    const rules = {
      lowCTR: { action: "reduceBid", threshold: 2 },
      highROAS: { action: "increaseBudget", threshold: 300 }
    };
    return { metrics: applyRules(state.metrics, rules) };
  };
  ```

#### **C. Build the LangGraph Workflow:**
- Assemble nodes and define conditional edges:
  ```javascript
  const builder = new StateGraph(campaignState)
    .addNode("supervisor", supervisorNode)
    .addNode("research", researchNode)
    .addNode("geo", geoNode)
    .addNode("copywriter", copywriterNode)
    .addNode("optimizer", optimizerNode);

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

  export const campaignGraph = builder.compile();
  ```

---

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