/**
 * Design Feedback API - Multi-agent design critique endpoints
 * Implements the blueprint's multi-agent feedback system
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const DesignFeedbackService = require('../services/designFeedback');
const DesignArtifactsService = require('../services/designArtifacts');
const { auth: authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/designs/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

/**
 * POST /design-feedback/artifacts
 * Create design artifact from Figma or image upload
 */
router.post('/artifacts', authenticateToken, async (req, res) => {
    try {
        const { 
            type, // 'figma' or 'image'
            figma_file_key, 
            figma_node_id,
            name,
            description
        } = req.body;
        const adminId = req.user.userId;

        if (type === 'figma') {
            if (!figma_file_key || !figma_node_id) {
                return res.status(400).json({
                    error: 'Figma file key and node ID are required',
                    details: 'Please provide figma_file_key and figma_node_id'
                });
            }

            const artifact = await DesignArtifactsService.createFromFigma(
                figma_file_key, 
                figma_node_id, 
                adminId,
                { name, description }
            );

            res.status(201).json({
                success: true,
                message: 'Design artifact created from Figma',
                artifact: {
                    id: artifact.id,
                    name: artifact.name,
                    description: artifact.description,
                    figma_url: artifact.figma_url,
                    image_url: artifact.image_url,
                    created_at: new Date().toISOString()
                }
            });

        } else if (type === 'image') {
            // Handle image upload
            upload.single('image')(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Image upload failed',
                        details: err.message
                    });
                }

                if (!req.file) {
                    return res.status(400).json({
                        error: 'Image file is required',
                        details: 'Please upload an image file'
                    });
                }

                const imageData = {
                    url: `/uploads/designs/${req.file.filename}`,
                    path: req.file.path,
                    width: 0, // Would be extracted from image in production
                    height: 0,
                    mimeType: req.file.mimetype,
                    size: req.file.size
                };

                const artifact = await DesignArtifactsService.createFromImage(
                    imageData, 
                    adminId,
                    { name, description }
                );

                res.status(201).json({
                    success: true,
                    message: 'Design artifact created from image',
                    artifact: {
                        id: artifact.id,
                        name: artifact.name,
                        description: artifact.description,
                        image_url: artifact.image_url,
                        created_at: new Date().toISOString()
                    }
                });
            });

        } else {
            res.status(400).json({
                error: 'Invalid artifact type',
                details: 'Type must be "figma" or "image"'
            });
        }

    } catch (error) {
        console.error('Artifact creation error:', error);
        res.status(500).json({
            error: 'Failed to create design artifact',
            details: error.message
        });
    }
});

/**
 * POST /design-feedback/run
 * Run multi-agent feedback on design artifact
 */
router.post('/run', authenticateToken, async (req, res) => {
    try {
        const { 
            artifact_id, 
            agent_ids, 
            task_context = {} 
        } = req.body;
        const adminId = req.user.userId;

        if (!artifact_id || !agent_ids || !Array.isArray(agent_ids) || agent_ids.length === 0) {
            return res.status(400).json({
                error: 'Invalid request parameters',
                details: 'Please provide artifact_id and agent_ids array'
            });
        }

        // Get design artifact
        const artifact = await DesignArtifactsService.getArtifact(artifact_id);
        if (!artifact) {
            return res.status(404).json({
                error: 'Design artifact not found',
                artifact_id: artifact_id
            });
        }

        console.log('Running multi-agent feedback:', {
            artifactId: artifact_id,
            agentCount: agent_ids.length,
            adminId
        });

        // Run multi-agent feedback
        const feedback = await DesignFeedbackService.runMultiAgentFeedback(
            artifact,
            agent_ids,
            task_context
        );

        res.json({
            success: true,
            message: 'Multi-agent feedback completed',
            feedback: {
                summary: feedback.summary,
                critical_issues: feedback.criticalIssues,
                disagreements: feedback.disagreements,
                consensus: feedback.consensus,
                statistics: feedback.statistics
            },
            artifact: {
                id: artifact.id,
                name: artifact.name,
                description: artifact.description
            },
            agents_used: agent_ids.length
        });

    } catch (error) {
        console.error('Multi-agent feedback error:', error);
        res.status(500).json({
            error: 'Failed to run multi-agent feedback',
            details: error.message
        });
    }
});

/**
 * GET /design-feedback/artifacts
 * Get user's design artifacts
 */
router.get('/artifacts', authenticateToken, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        const adminId = req.user.userId;

        const artifacts = await DesignArtifactsService.getUserArtifacts(
            adminId, 
            parseInt(limit), 
            parseInt(offset)
        );

        res.json({
            artifacts: artifacts.map(artifact => ({
                id: artifact.id,
                name: artifact.name,
                description: artifact.description,
                figma_url: artifact.figma_url,
                image_url: artifact.image_url,
                created_at: artifact.created_at,
                metadata: artifact.image_metadata
            })),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: artifacts.length
            }
        });

    } catch (error) {
        console.error('Artifacts fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch design artifacts',
            details: error.message
        });
    }
});

/**
 * GET /design-feedback/artifacts/:id
 * Get specific design artifact with feedback history
 */
router.get('/artifacts/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const artifact = await DesignArtifactsService.getArtifact(id);
        if (!artifact) {
            return res.status(404).json({
                error: 'Design artifact not found',
                artifact_id: id
            });
        }

        // Check if user owns the artifact
        if (artifact.created_by !== adminId) {
            return res.status(403).json({
                error: 'Access denied',
                details: 'You can only view your own design artifacts'
            });
        }

        // Get feedback history
        const feedbackHistory = await DesignArtifactsService.getArtifactFeedback(id);

        res.json({
            artifact: {
                id: artifact.id,
                name: artifact.name,
                description: artifact.description,
                figma_url: artifact.figma_url,
                image_url: artifact.image_url,
                node_mapping: artifact.node_mapping,
                created_at: artifact.created_at
            },
            feedback_history: feedbackHistory.map(feedback => ({
                id: feedback.id,
                agent_name: feedback.agent_name,
                agent_id: feedback.agent_id,
                critique_text: feedback.critique_text,
                severity: feedback.severity,
                heuristic_principle: feedback.heuristic_principle,
                evidence_elements: feedback.evidence_elements,
                suggested_fix: feedback.suggested_fix,
                created_at: feedback.created_at
            }))
        });

    } catch (error) {
        console.error('Artifact fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch design artifact',
            details: error.message
        });
    }
});

/**
 * PUT /design-feedback/artifacts/:id
 * Update design artifact
 */
router.put('/artifacts/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const adminId = req.user.userId;

        const artifact = await DesignArtifactsService.getArtifact(id);
        if (!artifact) {
            return res.status(404).json({
                error: 'Design artifact not found',
                artifact_id: id
            });
        }

        if (artifact.created_by !== adminId) {
            return res.status(403).json({
                error: 'Access denied',
                details: 'You can only update your own design artifacts'
            });
        }

        const updatedArtifact = await DesignArtifactsService.updateArtifact(id, updates);

        res.json({
            success: true,
            message: 'Design artifact updated successfully',
            artifact: {
                id: updatedArtifact.id,
                name: updatedArtifact.name,
                description: updatedArtifact.description,
                updated_at: updatedArtifact.updated_at
            }
        });

    } catch (error) {
        console.error('Artifact update error:', error);
        res.status(500).json({
            error: 'Failed to update design artifact',
            details: error.message
        });
    }
});

/**
 * DELETE /design-feedback/artifacts/:id
 * Delete design artifact
 */
router.delete('/artifacts/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const artifact = await DesignArtifactsService.getArtifact(id);
        if (!artifact) {
            return res.status(404).json({
                error: 'Design artifact not found',
                artifact_id: id
            });
        }

        if (artifact.created_by !== adminId) {
            return res.status(403).json({
                error: 'Access denied',
                details: 'You can only delete your own design artifacts'
            });
        }

        const deleted = await DesignArtifactsService.deleteArtifact(id);

        if (deleted) {
            res.json({
                success: true,
                message: 'Design artifact deleted successfully',
                artifact_id: id
            });
        } else {
            res.status(500).json({
                error: 'Failed to delete design artifact',
                details: 'Database operation failed'
            });
        }

    } catch (error) {
        console.error('Artifact deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete design artifact',
            details: error.message
        });
    }
});

/**
 * GET /design-feedback/heuristics
 * Get available usability heuristics
 */
router.get('/heuristics', async (req, res) => {
    try {
        // Return Nielsen's 10 Usability Heuristics
        const heuristics = [
            {
                id: 'visibility_of_system_status',
                name: 'Visibility of System Status',
                description: 'The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.',
                category: 'usability'
            },
            {
                id: 'match_system_real_world',
                name: 'Match Between System and Real World',
                description: 'The system should speak the users language, with words, phrases and concepts familiar to the user.',
                category: 'usability'
            },
            {
                id: 'user_control_freedom',
                name: 'User Control and Freedom',
                description: 'Users often choose system functions by mistake and will need a clearly marked emergency exit.',
                category: 'usability'
            },
            {
                id: 'consistency_standards',
                name: 'Consistency and Standards',
                description: 'Users should not have to wonder whether different words, situations, or actions mean the same thing.',
                category: 'usability'
            },
            {
                id: 'error_prevention',
                name: 'Error Prevention',
                description: 'Even better than good error messages is a careful design which prevents a problem from occurring in the first place.',
                category: 'usability'
            },
            {
                id: 'recognition_recall',
                name: 'Recognition Rather Than Recall',
                description: 'Minimize the user\'s memory load by making objects, actions, and options visible.',
                category: 'usability'
            },
            {
                id: 'flexibility_efficiency',
                name: 'Flexibility and Efficiency of Use',
                description: 'Accelerators may be unseen by the novice user, but can speed up the interaction for the expert user.',
                category: 'usability'
            },
            {
                id: 'aesthetic_minimalist',
                name: 'Aesthetic and Minimalist Design',
                description: 'Dialogues should not contain information which is irrelevant or rarely needed.',
                category: 'usability'
            },
            {
                id: 'help_recognize_errors',
                name: 'Help Users Recognize, Diagnose, and Recover from Errors',
                description: 'Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.',
                category: 'usability'
            },
            {
                id: 'help_documentation',
                name: 'Help and Documentation',
                description: 'Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation.',
                category: 'usability'
            }
        ];

        res.json({
            heuristics: heuristics,
            total: heuristics.length
        });

    } catch (error) {
        console.error('Heuristics fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch usability heuristics',
            details: error.message
        });
    }
});

module.exports = router;
