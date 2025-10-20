const OpenAI = require('openai');

let openai = null;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function summarizeAst(ast) {
  try {
    const screens = ast.length;
    const names = ast.slice(0, 5).map(n => n.name).filter(Boolean).join(', ');
    return `Prototype with ${screens} screens. Example screens: ${names}`;
  } catch {
    return 'Prototype summary unavailable';
  }
}

async function generateDesignEmbedding(astJson) {
  const summary = summarizeAst(astJson);
  const resp = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: `Figma prototype summary: ${summary}`
  });
  const vec = resp.data?.[0]?.embedding || [];
  return { vector: vec, summary };
}

module.exports = {
  generateDesignEmbedding,
  summarizeAst
};


