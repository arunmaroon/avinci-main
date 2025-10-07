/**
 * Design Artifacts Service - Figma integration and artifact management
 * Handles design artifact ingestion and processing for multi-agent feedback
 */

const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

class DesignArtifactsService {
    /**
     * Create design artifact from Figma file
     */
    static async createFromFigma(figmaFileKey, figmaNodeId, adminId, options = {}) {
        try {
            console.log('Creating design artifact from Figma:', {
                fileKey: figmaFileKey,
                nodeId: figmaNodeId
            });

            // Get Figma file data
            const figmaData = await this.fetchFigmaFile(figmaFileKey);
            if (!figmaData) {
                throw new Error('Failed to fetch Figma file data');
            }

            // Extract node information
            const nodeData = this.extractNodeData(figmaData, figmaNodeId);
            if (!nodeData) {
                throw new Error('Node not found in Figma file');
            }

            // Create artifact record
            const artifactId = uuidv4();
            const artifact = {
                id: artifactId,
                name: nodeData.name || 'Untitled Design',
                description: nodeData.description || '',
                figma_file_key: figmaFileKey,
                figma_node_id: figmaNodeId,
                figma_url: `https://www.figma.com/file/${figmaFileKey}?node-id=${figmaNodeId}`,
                image_url: nodeData.imageUrl || null,
                image_metadata: {
                    width: nodeData.width,
                    height: nodeData.height,
                    type: nodeData.type,
                    figma_data: nodeData.figmaData
                },
                node_mapping: this.createNodeMapping(nodeData),
                created_by: adminId
            };

            // Save to database
            await this.saveArtifact(artifact);

            console.log('Design artifact created:', artifactId);
            return artifact;

        } catch (error) {
            console.error('Figma artifact creation error:', error);
            throw new Error('Failed to create design artifact from Figma: ' + error.message);
        }
    }

    /**
     * Create design artifact from uploaded image
     */
    static async createFromImage(imageData, adminId, options = {}) {
        try {
            const artifactId = uuidv4();
            const artifact = {
                id: artifactId,
                name: options.name || 'Uploaded Design',
                description: options.description || '',
                image_url: imageData.url,
                image_path: imageData.path,
                image_metadata: {
                    width: imageData.width,
                    height: imageData.height,
                    mimeType: imageData.mimeType,
                    size: imageData.size
                },
                node_mapping: {},
                created_by: adminId
            };

            await this.saveArtifact(artifact);

            console.log('Image artifact created:', artifactId);
            return artifact;

        } catch (error) {
            console.error('Image artifact creation error:', error);
            throw new Error('Failed to create design artifact from image: ' + error.message);
        }
    }

    /**
     * Fetch Figma file data
     */
    static async fetchFigmaFile(fileKey) {
        try {
            // In production, you would use actual Figma API
            // For now, return mock data
            const mockFigmaData = {
                name: 'Design File',
                nodes: {
                    '1:1': {
                        id: '1:1',
                        name: 'Home Screen',
                        type: 'FRAME',
                        width: 375,
                        height: 812,
                        children: [
                            {
                                id: '1:2',
                                name: 'Header',
                                type: 'FRAME',
                                width: 375,
                                height: 60
                            },
                            {
                                id: '1:3',
                                name: 'Content',
                                type: 'FRAME',
                                width: 375,
                                height: 600
                            }
                        ]
                    }
                }
            };

            return mockFigmaData;
        } catch (error) {
            console.error('Figma API error:', error);
            return null;
        }
    }

    /**
     * Extract node data from Figma file
     */
    static extractNodeData(figmaData, nodeId) {
        try {
            const node = figmaData.nodes?.[nodeId];
            if (!node) {
                return null;
            }

            return {
                id: node.id,
                name: node.name,
                type: node.type,
                width: node.width,
                height: node.height,
                description: node.description || '',
                figmaData: node,
                imageUrl: this.generateImageUrl(figmaData.name, nodeId)
            };
        } catch (error) {
            console.error('Node extraction error:', error);
            return null;
        }
    }

    /**
     * Generate image URL for Figma node
     */
    static generateImageUrl(fileName, nodeId) {
        // In production, use Figma's image export API
        return `https://via.placeholder.com/375x812/cccccc/666666?text=${encodeURIComponent(fileName)}`;
    }

    /**
     * Create node mapping for actionable feedback
     */
    static createNodeMapping(nodeData) {
        const mapping = {};
        
        if (nodeData.figmaData?.children) {
            nodeData.figmaData.children.forEach((child, index) => {
                mapping[`element_${index}`] = {
                    id: child.id,
                    name: child.name,
                    type: child.type,
                    bounds: {
                        x: child.x || 0,
                        y: child.y || 0,
                        width: child.width,
                        height: child.height
                    },
                    text: child.characters || '',
                    style: child.style || {}
                };
            });
        }

        return mapping;
    }

    /**
     * Save artifact to database
     */
    static async saveArtifact(artifact) {
        try {
            const query = `
                INSERT INTO design_artifacts (
                    id, name, description, figma_file_key, figma_node_id,
                    figma_url, image_url, image_path, image_metadata,
                    node_mapping, created_by, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `;

            await pool.query(query, [
                artifact.id,
                artifact.name,
                artifact.description,
                artifact.figma_file_key,
                artifact.figma_node_id,
                artifact.figma_url,
                artifact.image_url,
                artifact.image_path,
                JSON.stringify(artifact.image_metadata),
                JSON.stringify(artifact.node_mapping),
                artifact.created_by,
                new Date()
            ]);
        } catch (error) {
            console.error('Failed to save artifact:', error);
            throw error;
        }
    }

    /**
     * Get artifact by ID
     */
    static async getArtifact(artifactId) {
        try {
            const result = await pool.query(
                `SELECT * FROM design_artifacts WHERE id = $1`,
                [artifactId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Failed to get artifact:', error);
            return null;
        }
    }

    /**
     * Get all artifacts for a user
     */
    static async getUserArtifacts(adminId, limit = 20, offset = 0) {
        try {
            const result = await pool.query(
                `SELECT id, name, description, figma_url, image_url, 
                        created_at, image_metadata
                 FROM design_artifacts 
                 WHERE created_by = $1 
                 ORDER BY created_at DESC 
                 LIMIT $2 OFFSET $3`,
                [adminId, limit, offset]
            );
            return result.rows;
        } catch (error) {
            console.error('Failed to get user artifacts:', error);
            return [];
        }
    }

    /**
     * Update artifact
     */
    static async updateArtifact(artifactId, updates) {
        try {
            const allowedFields = ['name', 'description', 'image_metadata', 'node_mapping'];
            const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
            
            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            const setClause = updateFields.map((field, index) => 
                `${field} = $${index + 2}`
            ).join(', ');

            const query = `
                UPDATE design_artifacts 
                SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 
                RETURNING *
            `;

            const values = [artifactId, ...updateFields.map(field => 
                typeof updates[field] === 'object' ? JSON.stringify(updates[field]) : updates[field]
            )];

            const result = await pool.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Failed to update artifact:', error);
            throw error;
        }
    }

    /**
     * Delete artifact
     */
    static async deleteArtifact(artifactId) {
        try {
            const result = await pool.query(
                `DELETE FROM design_artifacts WHERE id = $1 RETURNING id`,
                [artifactId]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Failed to delete artifact:', error);
            return false;
        }
    }

    /**
     * Get artifact feedback history
     */
    static async getArtifactFeedback(artifactId) {
        try {
            const result = await pool.query(
                `SELECT 
                    fi.id, fi.critique_text, fi.severity, fi.heuristic_principle,
                    fi.evidence_elements, fi.suggested_fix, fi.created_at,
                    a.name as agent_name, a.id as agent_id
                 FROM feedback_items fi
                 JOIN agents a ON fi.agent_id = a.id
                 WHERE fi.design_artifact_id = $1
                 ORDER BY fi.created_at DESC`,
                [artifactId]
            );
            return result.rows;
        } catch (error) {
            console.error('Failed to get artifact feedback:', error);
            return [];
        }
    }
}

module.exports = DesignArtifactsService;
