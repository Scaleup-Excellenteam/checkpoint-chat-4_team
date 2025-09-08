const Recipe = require('../models/Recipe');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.hasLeak = async (message) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    // load all secret recipes from DB
    const secretRecipes = await Recipe.find({}, 'name ingredients').lean();


const prompt = `You are a security assistant for a company. Your job is to check for leaks of confidential information.
The following is a list of our company's private, secret recipes. They are NOT to be shared.

Confidential recipes:
${secretRecipes.map(s => `${s.name}: ${s.ingredients.join(', ')}`).join('\n')}

Check if the following message contains any of this confidential information.
Message: "${message}"

If the message contains a full or partial match to any of the confidential recipes on the list, respond "Yes". Otherwise, respond "No".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.toLowerCase().includes("yes");
};