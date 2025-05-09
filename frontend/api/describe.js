// /api/describe.ts (or .js if not using TypeScript)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { species } = req.body;
  const prompt = `Give me a short and friendly one-sentence description of the bird species "${species}".`;

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 60,
          temperature: 0.7,
        }),
      }
    );

    const data = await openaiRes.json();
    console.log("OpenAI raw response:", data);

    const message = data.choices?.[0]?.message?.content?.trim() || "";
    res.status(200).json({ description: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch description." });
  }
}
