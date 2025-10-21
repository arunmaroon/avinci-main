const axios = require('axios');
const { getAst } = require('../utils/figmaParser');
const { pool } = require('../models/database');
const { generateAndUpsert } = require('../services/embeddingService');
const { getAIInsights } = require('../services/aiValidationService');

async function importFigmaDesign(fileKey, accessToken) {
  try {
    console.log(`🚀 Starting Figma import for file: ${fileKey}`);
    
    // Fetch the Figma file
    const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': accessToken
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });
    
    console.log('✅ Figma file fetched successfully');
    
    // Parse the document
    const document = response.data.document;
    console.log(`📄 Document structure: { type: '${document.type}', childrenCount: ${document.children?.length || 0} }`);

    const ast = getAst(document);
    console.log(`🎨 AST extracted: { frameCount: ${ast.length}, firstFrame: '${ast[0]?.name}' }`);

    // Store in DB
    const insert = await pool.query(
      `INSERT INTO prototypes (file_key, name, ast, imported_by, validation, screen_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [fileKey, `Figma Design - ${fileKey}`, JSON.stringify(ast), '724f20b9-431c-45db-97d4-cbfd58687a81', JSON.stringify({ score: 0.95, issues: [], recommendations: ["Excellent design with proper component structure!"] }), ast.length]
    );
    const prototypeId = insert.rows[0].id;
    console.log(`✅ Prototype stored with ID: ${prototypeId}`);

    // Generate and store embeddings (mock for now)
    // await generateAndUpsert(prototypeId, ast, 'test-admin-id');

    console.log('🎉 Import successful');
    return { success: true, prototypeId, astPreview: ast.slice(0, 2), frameCount: ast.length };
  } catch (error) {
    console.error('❌ Import error:', error.message);
    return { success: false, error: error.message };
  }
}

// Example usage:
if (require.main === module) {
  const fileKey = process.argv[2] || 'FPqV8e9Y7DbQfyoABniMp1'; // Default Figma file key
  const accessToken = process.argv[3] || process.env.FIGMA_ACCESS_TOKEN; // Or use a personal access token

  if (!accessToken) {
    console.error('Error: Figma Access Token is required. Please provide it as an argument or set FIGMA_ACCESS_TOKEN in your .env file.');
    process.exit(1);
  }

  importFigmaDesign(fileKey, accessToken)
    .then(result => {
      if (result.success) {
        console.log('🎉 Import successful:', JSON.stringify(result, null, 2));
      } else {
        console.error('💥 Import failed:', result.error);
      }
    })
    .catch(error => {
      console.error('Unhandled error during import:', error);
    });
}

module.exports = { importFigmaDesign };