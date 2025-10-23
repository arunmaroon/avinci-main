const express = require('express');
const { OpenAI } = require('openai');
const axios = require('axios');
const { pool } = require('../models/database');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware to check authentication
const requireAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    req.user = { id: userId };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Apply auth middleware to all routes
router.use(requireAuth);

// Figma import endpoint
router.post('/figma-import', async (req, res) => {
  try {
    const { fileKey, accessToken } = req.body;

    if (!fileKey || !accessToken) {
      return res.status(400).json({ 
        error: 'File key and access token are required' 
      });
    }

    // Fetch Figma file data
    const figmaResponse = await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': accessToken
      }
    });

    const figmaData = figmaResponse.data;
    
    // Extract UI elements from Figma nodes
    const extractUIElements = (nodes) => {
      const elements = [];
      
      const traverse = (node) => {
        if (node.type === 'TEXT') {
          elements.push({
            type: 'text',
            content: node.characters,
            style: {
              fontSize: node.style?.fontSize,
              fontFamily: node.style?.fontFamily,
              color: node.fills?.[0]?.color
            },
            bounds: node.absoluteBoundingBox
          });
        } else if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
          elements.push({
            type: 'container',
            name: node.name,
            style: {
              backgroundColor: node.fills?.[0]?.color,
              cornerRadius: node.cornerRadius,
              padding: node.paddingTop || 0
            },
            bounds: node.absoluteBoundingBox
          });
        } else if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
          elements.push({
            type: 'component',
            name: node.name,
            componentSet: node.componentSetId,
            bounds: node.absoluteBoundingBox
          });
        }

        if (node.children) {
          node.children.forEach(traverse);
        }
      };

      traverse(nodes);
      return elements;
    };

    const uiElements = extractUIElements(figmaData.document);
    
    // Generate image for vision analysis (if possible)
    let imageBase64 = null;
    try {
      const imageResponse = await axios.get(`https://api.figma.com/v1/images/${fileKey}`, {
        params: {
          ids: figmaData.document.id,
          format: 'png',
          scale: 2
        },
        headers: {
          'X-Figma-Token': accessToken
        }
      });
      
      if (imageResponse.data.images[figmaData.document.id]) {
        const imageUrl = imageResponse.data.images[figmaData.document.id];
        const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        imageBase64 = Buffer.from(imageBuffer.data).toString('base64');
      }
    } catch (imageError) {
      console.warn('Could not fetch Figma image:', imageError.message);
    }

    // Analyze with GPT-4o vision if image available
    let visionAnalysis = null;
    if (imageBase64) {
      try {
        const visionResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this Figma design and provide actionable UI/UX feedback. Focus on:
                  1. Layout and spacing issues
                  2. Color contrast and accessibility
                  3. Typography hierarchy
                  4. Component consistency
                  5. User experience flow
                  
                  Provide specific, actionable suggestions like "Increase button padding by 8px" or "Use bg-blue-600 for primary actions".
                  Return as JSON with sections: layout, colors, typography, components, accessibility, suggestions.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1500
        });

        visionAnalysis = JSON.parse(visionResponse.choices[0].message.content);
      } catch (visionError) {
        console.warn('Vision analysis failed:', visionError.message);
      }
    }

    // Generate persona-specific feedback
    const personaFeedback = await generatePersonaFeedback(uiElements, visionAnalysis);

    // Store in database
    const result = await pool.query(`
      INSERT INTO figma_imports (file_key, file_name, ui_elements, vision_analysis, persona_feedback, imported_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id
    `, [
      fileKey,
      figmaData.name,
      JSON.stringify(uiElements),
      JSON.stringify(visionAnalysis),
      JSON.stringify(personaFeedback),
      req.user.id
    ]);

    res.json({
      success: true,
      id: result.rows[0].id,
      name: figmaData.name,
      fileKey,
      uiElements,
      visionAnalysis,
      personaFeedback,
      analysis: {
        suggestions: visionAnalysis?.suggestions || [],
        layout: visionAnalysis?.layout || {},
        colors: visionAnalysis?.colors || {},
        typography: visionAnalysis?.typography || {},
        accessibility: visionAnalysis?.accessibility || {}
      }
    });

  } catch (error) {
    console.error('Figma import error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid Figma access token' 
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Figma file not found or access denied' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to import Figma design',
      details: error.message 
    });
  }
});

// Vision analysis endpoint
router.post('/vision', async (req, res) => {
  try {
    const { image, prompt } = req.body;

    if (!image) {
      return res.status(400).json({ 
        error: 'Image is required' 
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Analyze this UI design and provide actionable feedback on layout, colors, typography, and usability. Focus on specific improvements like spacing, alignment, and design system consistency.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Vision analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
});

// Generate persona-specific feedback
async function generatePersonaFeedback(uiElements, visionAnalysis) {
  try {
    // Get all personas from database
    const personasResult = await pool.query(`
      SELECT id, name, role, goals, pain_points, behaviors, traits
      FROM personas
      WHERE status = 'active'
    `);

    const personas = personasResult.rows;
    const feedback = {};

    for (const persona of personas) {
      const personaContext = `
        Persona: ${persona.name} (${persona.role})
        Goals: ${persona.goals}
        Pain Points: ${persona.pain_points}
        Behaviors: ${persona.behaviors}
        Traits: ${persona.traits}
      `;

      const personaAnalysis = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a UX researcher analyzing UI designs from the perspective of specific user personas. Provide feedback that connects UI elements to persona goals, pain points, and behaviors. Be specific and actionable.`
          },
          {
            role: 'user',
            content: `${personaContext}

            UI Elements: ${JSON.stringify(uiElements)}
            Vision Analysis: ${JSON.stringify(visionAnalysis)}
            
            Provide feedback on how this design affects ${persona.name}'s experience. Focus on:
            1. How UI elements support or hinder their goals
            2. Whether the design addresses their pain points
            3. If the interface matches their behaviors and traits
            4. Specific improvements for this persona
            
            Return as JSON with: insights, improvements, score (1-10)`
          }
        ],
        max_tokens: 500
      });

      feedback[persona.id] = JSON.parse(personaAnalysis.choices[0].message.content);
    }

    return feedback;
  } catch (error) {
    console.error('Persona feedback generation error:', error);
    return {};
  }
}

// Get Figma imports for a user
router.get('/figma-imports', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, file_key, file_name, ui_elements, vision_analysis, persona_feedback, created_at
      FROM figma_imports
      WHERE imported_by = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    const imports = result.rows.map(row => ({
      id: row.id,
      fileKey: row.file_key,
      fileName: row.file_name,
      uiElements: JSON.parse(row.ui_elements),
      visionAnalysis: JSON.parse(row.vision_analysis),
      personaFeedback: JSON.parse(row.persona_feedback),
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      imports
    });

  } catch (error) {
    console.error('Get Figma imports error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Figma imports' 
    });
  }
});

module.exports = router;

