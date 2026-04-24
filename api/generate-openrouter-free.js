const FREE_MODELS = [
  'openrouter/free',
  'z-ai/glm-4.5-air:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'liquid/lfm-2.5-1.2b-thinking-20260120:free',
  'tencent/hy3-preview-20260421:free',
  'minimax/minimax-m2.5:free',
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { model, messages, max_tokens = 8192, temperature = 0.7 } = req.body || {};

  if (!model || !FREE_MODELS.includes(model)) {
    return res.status(400).json({ error: 'Invalid or missing model. Must be a free OpenRouter model.' });
  }
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const apiKey = process.env.OPENROUTER_FREE_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API key not configured on server' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://plugin.new',
        'X-Title': 'WP Gen',
      },
      body: JSON.stringify({ model, messages, max_tokens, temperature }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
