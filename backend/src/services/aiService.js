import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Allowed values for validation
const VALID_CATEGORIES = ['Billing', 'Technical', 'Sales', 'General', 'Unclassified'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical', 'Unassigned'];

/**
 * Evaluates a ticket's title and description to determine its category and priority.
 * @param {string} title - The ticket title
 * @param {string} description - The ticket description
 * @returns {Promise<Object>} - The classified data (category, priority, confidence)
 */
export const classifyTicket = async (title, description) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // ✅ upgraded model
      temperature: 0, // deterministic output
      response_format: { type: 'json_object' }, // ✅ enforce JSON
      messages: [
        {
          role: 'system',
          content: 'You are an expert IT support ticket classifier. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: `
Classify the following support ticket.

Title: "${title}"
Description: "${description}"

Return ONLY JSON in this format:
{
  "aiCategory": "Billing | Technical | Sales | General | Unclassified",
  "aiPriority": "Low | Medium | High | Critical | Unassigned",
  "aiConfidenceScore": number (0-100)
}
`,
        },
      ],
    });

    const rawResult = response.choices[0].message.content;

    // 🔍 Debug log (VERY IMPORTANT)
    console.log('🧠 AI Raw Response:', rawResult);

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResult);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('❌ Raw Response:', rawResult);
      throw new Error('Invalid JSON returned from AI');
    }

    // ✅ Validate & sanitize output
    const aiCategory = VALID_CATEGORIES.includes(parsedResult.aiCategory)
      ? parsedResult.aiCategory
      : 'Unclassified';

    const aiPriority = VALID_PRIORITIES.includes(parsedResult.aiPriority)
      ? parsedResult.aiPriority
      : 'Unassigned';

    const aiConfidenceScore =
      typeof parsedResult.aiConfidenceScore === 'number'
        ? Math.min(100, Math.max(0, parsedResult.aiConfidenceScore))
        : 0;

    return {
      aiCategory,
      aiPriority,
      aiConfidenceScore,
    };
  } catch (error) {
    console.error('🔴 AI Classification Error:', error.message);

    // Extra debugging
    if (!process.env.OPENAI_API_KEY) {
      console.error('⚠️ OPENAI_API_KEY is missing!');
    }

    // ❗ DO NOT fail silently anymore — log clearly
    console.error('Full error:', error);

    // Safe fallback
    return {
      aiCategory: 'Unclassified',
      aiPriority: 'Unassigned',
      aiConfidenceScore: 0,
    };
  }
};
