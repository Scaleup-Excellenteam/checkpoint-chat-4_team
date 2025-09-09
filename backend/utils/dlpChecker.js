const Recipe = require('../models/Recipe');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');

const genAI = new GoogleGenerativeAI(config.apis.gemini.apiKey);

exports.hasLeak = async (message) => {
    const model = genAI.getGenerativeModel({ model: config.apis.gemini.model });

    // load all secret recipes from DB
    const secretRecipes = await Recipe.find({}, 'name ingredients').lean();

    const prompt = `You are a security assistant for a company. Your job is to check for leaks of confidential information.
The following is a list of our company's private, secret recipes. They are NOT to be shared.

Confidential recipes:
${secretRecipes.map(s => `${s.name}: ${s.ingredients.join(', ')}`).join('\n')}

Analyze the following message for any signs of intent to leak, share, or threaten to expose the confidential data.
Message: "${message}"

If the message contains a full or partial match to any of the confidential recipes on the list, respond "Yes". Otherwise, respond "No".`;

    const MAX_RETRIES = config.security.dlp.maxRetries;
    const BASE_DELAY = config.security.dlp.baseDelay; // milliseconds

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text.toLowerCase().includes("yes");
        } catch (error) {
            // Check for the specific 503 error
            if (error.status === 503) {
                console.warn(`Attempt ${i + 1} failed with 503 Service Unavailable. Retrying...`);
                // Calculate exponential delay with random jitter
                const delay = Math.pow(2, i) * BASE_DELAY + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // If the error is not a 503, re-throw it immediately
                throw error;
            }
        }
    }

    // If all retries fail, throw a final error
    throw new Error("Failed to get a response from Gemini after multiple retries.");
};