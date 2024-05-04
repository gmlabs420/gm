// File: /api/generate-text.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { prompt, max_tokens = 150 } = req.body; // Setting a default value for max_tokens
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        { prompt, max_tokens },
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEXT_API_KEY}`, // Corrected API key variable name
            'Content-Type': 'application/json'
          }
        }
      );
      res.status(200).json({ result: response.data.choices[0].text });
    } catch (error) {
      console.error('Error in text generation:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
