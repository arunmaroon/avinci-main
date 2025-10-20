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
    effects: node.effects || []
  };
}

function toAstNode(node) {
  const ast = {
    id: node.id,
    type: node.type,
    name: node.name || '',
    layout: extractLayout(node),
    styles: extractStyles(node)
  };
  if (Array.isArray(node.children) && node.children.length) {
    ast.children = node.children.map(toAstNode);
  }
  return ast;
}

function collectTopFrames(document) {
  if (!document || !Array.isArray(document.children)) return [];
  const frames = [];
  for (const child of document.children) {
    if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'COMPONENT_SET') {
      frames.push(child);
    }
    if (frames.length >= 10) break;
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


