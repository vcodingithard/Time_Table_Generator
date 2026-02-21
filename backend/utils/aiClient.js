import axios from "axios";

const MODELS = [
  "openrouter/auto", // Let OpenRouter pick the best available free model
  "meta-llama/llama-3.1-8b-instruct:free",
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "microsoft/phi-3-mini-128k-instruct:free"
];

export const callAIModel = async (prompt) => {
  let lastError = null;

  for (const modelId of MODELS) {
    try {
      console.log(`🤖 Attempting generation with: ${modelId}...`);
      
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: modelId,
          messages: [
            {
              role: "system",
              content: "You are a university scheduling expert. Return ONLY valid JSON."
            },
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Timetable Generator",
            "Content-Type": "application/json"
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("No JSON in response");
      
      console.log(`✅ Success with ${modelId}`);
      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      lastError = error.response?.data?.error?.message || error.message;
      console.warn(`⚠️ ${modelId} failed: ${lastError}. Trying next...`);
      // Continue to next model in the loop
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError}`);
};