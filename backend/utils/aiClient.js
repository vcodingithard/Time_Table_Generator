import axios from "axios";

/**
 * Helper to call OpenRouter API
 * @param {string} prompt - The system/user prompt
 * @returns {Object} - Parsed JSON response
 */
export const callAIModel = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // You can use "google/gemini-flash-1.5-exp:free" or "meta-llama/llama-3.1-8b-instruct:free"
        model: "google/gemini-flash-1.5-exp:free", 
        messages: [
          {
            role: "system",
            content: "You are a professional university time table generator expert. You must return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" } // Ensures the model outputs JSON
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
          "X-Title": "Timetable Generator", // Required by OpenRouter
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Some models wrap JSON in code blocks even when asked not to
    const cleanJson = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Model Error:", error.response?.data || error.message);
    throw new Error("AI Generation failed. Check your OpenRouter credits or API key.");
  }
};