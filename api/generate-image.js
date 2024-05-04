// /api/generate-image.js
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt: prompt,
          n: 1, // Number of images to generate
          // Add other parameters as needed
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.IMAGE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Assuming the API returns a URL or binary data for the image
      res.status(200).json({ imageUrl: response.data.data[0].url }); // Adjust based on the actual response structure
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).send('An error occurred while generating the image.');
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
