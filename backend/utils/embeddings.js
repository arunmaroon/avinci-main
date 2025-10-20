const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

let openai = null;
let pinecone = null;
let pineconeIndex = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function getPinecone() {
  if (!pinecone && process.env.PINECONE_API_KEY) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME || 'design-prototypes');
  }
  return { pinecone, index: pineconeIndex };
}

function summarizeAst(ast) {
  try {
    const screens = ast.length;
    const names = ast.slice(0, 5).map(n => n.name).filter(Boolean).join(', ');
    const components = ast.reduce((acc, node) => {
      const count = (node.children || []).filter(c => c.type === 'COMPONENT').length;
      return acc + count;
    }, 0);
    return `Figma prototype with ${screens} screens: ${names}. Contains ${components} components.`;
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

async function upsertToPinecone(prototypeId, embedding, metadata, namespace = 'design') {
  try {
    const { index } = await getPinecone();
    if (!index) {
      console.warn('Pinecone not configured, skipping vector storage');
      return;
    }

    await index.namespace(namespace).upsert([{
      id: prototypeId,
      values: embedding,
      metadata: {
        type: 'prototype',
        ...metadata
      }
    }]);
    
    console.log(`✅ Upserted design embedding for prototype ${prototypeId}`);
  } catch (error) {
    console.error('Error upserting to Pinecone:', error);
    throw error;
  }
}

async function searchPrototypes(query, namespace = 'design', topK = 3) {
  try {
    const { index } = await getPinecone();
    if (!index) {
      console.warn('Pinecone not configured, returning empty results');
      return [];
    }

    // Generate embedding for the query
    const queryEmbedding = await getOpenAI().embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });

    const results = await index.namespace(namespace).query({
      vector: queryEmbedding.data[0].embedding,
      topK,
      includeMetadata: true
    });

    return results.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    }));
  } catch (error) {
    console.error('Error searching prototypes:', error);
    return [];
  }
}

async function generateAndUpsert(prototypeId, ast, userId) {
  try {
    const { vector, summary } = await generateDesignEmbedding(ast);
    await upsertToPinecone(prototypeId, vector, {
      astSummary: summary,
      importedBy: userId,
      version: 1,
      screenCount: ast.length
    });
    return { success: true, summary };
  } catch (error) {
    console.error('Error generating and upserting embedding:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateDesignEmbedding,
  summarizeAst,
  upsertToPinecone,
  searchPrototypes,
  generateAndUpsert
};


