/**
 * Minimal Figma AST parser
 */

/**
 * @typedef {Object} FigmaNode
 * @property {string} id
 * @property {string} type
 * @property {string} [name]
 * @property {Object} [layout]
 * @property {Object} [styles]
 * @property {Array<FigmaNode>} [children]
 */

function extractLayout(node) {
  const b = node.absoluteBoundingBox || {};
  return {
    x: b.x || 0,
    y: b.y || 0,
    width: b.width || 0,
    height: b.height || 0,
    rotation: node.rotation || 0
  };
}

function extractStyles(node) {
  return {
    fills: node.fills || [],
    strokes: node.strokes || [],
    effects: node.effects || [],
    cornerRadius: node.cornerRadius || 0
  };
}

function toAstNode(node) {
  const ast = {
    id: node.id,
    type: node.type,
    name: node.name || '',
    layout: extractLayout(node),
    styles: extractStyles(node),
    // Add interaction data if available
    interactions: node.interactions || [],
    // Add visibility
    visible: node.visible !== false
  };
  
  // Extract text content for TEXT nodes
  if (node.type === 'TEXT' && node.characters) {
    ast.text = node.characters;
    ast.fontSize = node.style?.fontSize;
    ast.fontFamily = node.style?.fontFamily;
    ast.fontWeight = node.style?.fontWeight;
    ast.textAlign = node.style?.textAlignHorizontal;
    ast.lineHeight = node.style?.lineHeightPx;
    ast.letterSpacing = node.style?.letterSpacing;
  }
  
  // Extract component properties for instances
  if (node.type === 'INSTANCE' && node.componentProperties) {
    ast.componentProperties = node.componentProperties;
    ast.componentId = node.componentId;
  }
  
  // Extract layout properties
  if (node.layoutMode) {
    ast.layoutMode = node.layoutMode;
    ast.itemSpacing = node.itemSpacing;
    ast.paddingLeft = node.paddingLeft;
    ast.paddingRight = node.paddingRight;
    ast.paddingTop = node.paddingTop;
    ast.paddingBottom = node.paddingBottom;
  }
  
  // Extract text from text nodes in children
  if (Array.isArray(node.children) && node.children.length) {
    ast.children = node.children
      .filter(child => child.visible !== false) // Only include visible children
      .map(toAstNode);
    
    // Collect all text content from children for easier processing
    const textNodes = node.children.filter(child => child.type === 'TEXT' && child.characters);
    if (textNodes.length > 0) {
      ast.text = textNodes.map(tn => tn.characters).join(' ');
    }
  }
  
  return ast;
}

function collectTopFrames(document) {
  if (!document || !Array.isArray(document.children)) return [];
  const frames = [];
  
  // First, try to find top-level frames
  for (const child of document.children) {
    if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET') {
      frames.push(child);
    }
    if (frames.length >= 10) break;
  }
  
  // If no top-level frames found, look for pages and their children
  if (frames.length === 0) {
    for (const page of document.children) {
      if (page.type === 'CANVAS' && Array.isArray(page.children)) {
        for (const child of page.children) {
          if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET') {
            frames.push(child);
          }
          if (frames.length >= 10) break;
        }
      }
      if (frames.length >= 10) break;
    }
  }
  
  // If still no frames, look for any visible frames in the entire document
  if (frames.length === 0) {
    const findFramesRecursively = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      
      for (const child of node.children) {
        if (child.type === 'FRAME' && child.visible !== false) {
          frames.push(child);
          if (frames.length >= 10) break;
        }
        if (frames.length < 10) {
          findFramesRecursively(child);
        }
      }
    };
    
    findFramesRecursively(document);
  }
  
  return frames;
}

function getAst(figmaDocument) {
  const frames = collectTopFrames(figmaDocument);
  if (frames.length === 0) throw new Error('No top-level frames/components found');
  if (frames.length > 10) throw new Error('Too many top-level frames (>10)');
  return frames.map(toAstNode);
}

module.exports = {
  getAst
};