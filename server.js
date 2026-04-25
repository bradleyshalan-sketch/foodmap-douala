const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory (optional, for single-platform deployment)
app.use(express.static('./'));

app.post('/api/ai-search', async (req, res) => {
    const { query, systemPrompt } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [{ role: 'user', content: query }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Anthropic Error]', data);
            throw new Error(data.error?.message || 'Failed to fetch from Anthropic');
        }

        res.json(data);
    } catch (error) {
        console.error('[Server Error]', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`FoodMap backend running on http://localhost:${PORT}`);
});
