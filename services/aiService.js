const axios = require("axios");

async function generateSummary(content) {

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",

                messages: [
                    {
                        role: "user",
                        content: `Summarize this blog in 3 lines:\n${content}`
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {

        console.log("AI ERROR:");
        console.log(error.response?.data || error.message);

        return "Summary generation failed";
    }
}
async function generateTags(content) {

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",

                messages: [
                    {
                        role: "user",
                        content: `
Generate exactly 5 short one-word or two-word tags.

Return ONLY comma separated tags.

Example:
JavaScript, Node.js, Backend, Web Development, Programming

Blog:
${content}
`
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );

        const tagsText =
            response.data.choices[0].message.content;
            console.log(tagsText);
        return tagsText
            .split(",")
            .map(tag => tag.trim());

    } catch (error) {

        console.log("TAG ERROR:");

        console.log(error.response?.data || error.message);

        return [];
    }
}
async function generateTitles(content) {

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",

                messages: [
                    {
                        role: "user",
                        content: `
Generate 5 catchy blog titles.

Return ONLY comma separated titles.

Blog:
${content}
`
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );

        const titlesText =
            response.data.choices[0].message.content;

        return titlesText
            .split(",")
            .map(title => title.trim());

    } catch (error) {

        console.log("TITLE ERROR:");

        console.log(error.response?.data || error.message);

        return [];
    }
}
async function grammarCorrection(content) {

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",

                messages: [
                    {
                        role: "user",
                        content: `
Correct grammar and improve readability.

Do NOT change the meaning.

Return ONLY corrected text.

Blog:
${content}
`
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );

        const correctedText =
            response.data.choices[0].message.content;

        console.log(correctedText);

        return correctedText;

    } catch (error) {

        console.log("GRAMMAR ERROR:");

        console.log(
            error.response?.data || error.message
        );

        return "Grammar correction failed.";
    }
}

module.exports = {
    generateSummary,
    generateTags,
    generateTitles,
    grammarCorrection,
};