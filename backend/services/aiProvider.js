/**
 * AI Provider Abstraction Layer
 * Supports OpenAI Chat Completions and Anthropic Messages APIs
 * Implements strategy pattern for easy provider switching and failover
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class AIProvider {
    constructor(provider = 'openai', options = {}) {
        this.provider = provider;
        this.client = this._createClient(provider, options);
    }

    _createClient(provider, options) {
        switch (provider) {
            case 'openai':
                return new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY,
                    ...options
                });
            case 'anthropic':
                return new Anthropic({
                    apiKey: process.env.ANTHROPIC_API_KEY,
                    ...options
                });
            case 'grok':
                return new OpenAI({
                    apiKey: process.env.GROK_API_KEY,
                    baseURL: 'https://api.x.ai/v1',
                    ...options
                });
            default:
                throw new Error(`Unsupported AI provider: ${provider}`);
        }
    }

    /**
     * Generate chat completion with provider-agnostic interface
     * @param {Object} params - Generation parameters
     * @param {Array} params.messages - Array of message objects
     * @param {string} params.model - Model name
     * @param {number} params.temperature - Temperature (0-2)
     * @param {number} params.max_tokens - Maximum tokens
     * @param {Object} params.tools - Function calling tools (OpenAI only)
     * @returns {Promise<Object>} Response object
     */
    async generateCompletion(params) {
        const { messages, model, temperature = 0.7, max_tokens = 1000, tools } = params;

        try {
            if (this.provider === 'anthropic') {
                return await this._generateWithAnthropic(messages, model, temperature, max_tokens);
            } else {
                return await this._generateWithOpenAI(messages, model, temperature, max_tokens, tools);
            }
        } catch (error) {
            console.error(`AI Provider Error (${this.provider}):`, error.message);
            throw new Error(`Failed to generate completion: ${error.message}`);
        }
    }

    async _generateWithOpenAI(messages, model, temperature, max_tokens, tools) {
        const requestBody = {
            model: model || 'gpt-4o',
            messages: this._formatMessagesForOpenAI(messages),
            temperature,
            max_tokens
        };

        if (tools) {
            requestBody.tools = tools;
        }

        const response = await this.client.chat.completions.create(requestBody);
        
        return {
            content: response.choices[0].message.content,
            role: response.choices[0].message.role,
            usage: response.usage,
            finish_reason: response.choices[0].finish_reason,
            tool_calls: response.choices[0].message.tool_calls
        };
    }

    async _generateWithAnthropic(messages, model, temperature, max_tokens) {
        // Convert OpenAI format to Anthropic format
        const systemMessage = messages.find(msg => msg.role === 'system');
        const conversationMessages = messages.filter(msg => msg.role !== 'system');

        const requestBody = {
            model: model || 'claude-3-5-sonnet-20241022',
            max_tokens: max_tokens,
            temperature: temperature,
            messages: conversationMessages
        };

        if (systemMessage) {
            requestBody.system = systemMessage.content;
        }

        const response = await this.client.messages.create(requestBody);
        
        return {
            content: response.content[0].text,
            role: 'assistant',
            usage: response.usage,
            finish_reason: response.stop_reason
        };
    }

    _formatMessagesForOpenAI(messages) {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    /**
     * Generate embeddings for semantic search
     * @param {string|Array} input - Text or array of texts to embed
     * @param {string} model - Embedding model name
     * @returns {Promise<Array>} Embedding vectors
     */
    async generateEmbeddings(input, model = 'text-embedding-3-large') {
        if (this.provider === 'anthropic') {
            throw new Error('Anthropic does not support embeddings. Use OpenAI for embeddings.');
        }

        try {
            const response = await this.client.embeddings.create({
                model: model,
                input: Array.isArray(input) ? input : [input]
            });

            return response.data.map(item => item.embedding);
        } catch (error) {
            console.error('Embedding generation error:', error.message);
            throw new Error(`Failed to generate embeddings: ${error.message}`);
        }
    }

    /**
     * Analyze image with vision capabilities
     * @param {Object} params - Vision analysis parameters
     * @param {string} params.imageUrl - URL or base64 image
     * @param {string} params.prompt - Analysis prompt
     * @param {string} params.model - Vision model
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeImage(params) {
        const { imageUrl, prompt, model = 'gpt-4o' } = params;

        const messages = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { 
                        type: 'image_url', 
                        image_url: { url: imageUrl }
                    }
                ]
            }
        ];

        return await this.generateCompletion({
            messages,
            model,
            temperature: 0.3,
            max_tokens: 1000
        });
    }

    /**
     * Get available models for the provider
     * @returns {Array} List of available models
     */
    getAvailableModels() {
        const models = {
            openai: [
                'gpt-4o',
                'gpt-4o-mini',
                'gpt-4-turbo',
                'gpt-4',
                'gpt-3.5-turbo',
                'text-embedding-3-large',
                'text-embedding-3-small',
                'text-embedding-ada-002'
            ],
            anthropic: [
                'claude-3-5-sonnet-20241022',
                'claude-3-5-haiku-20241022',
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307'
            ],
            grok: [
                'grok-beta',
                'grok-2-1212'
            ]
        };

        return models[this.provider] || [];
    }

    /**
     * Check if provider is available and configured
     * @returns {Promise<boolean>} Provider availability
     */
    async isAvailable() {
        try {
            // Test with a simple completion
            await this.generateCompletion({
                messages: [{ role: 'user', content: 'Hello' }],
                model: this.getAvailableModels()[0],
                max_tokens: 5
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}

/**
 * Provider factory for creating instances
 */
class AIProviderFactory {
    static create(provider = 'openai', options = {}) {
        return new AIProvider(provider, options);
    }

    static async createWithFallback(primaryProvider = 'openai', fallbackProvider = 'anthropic') {
        const primary = new AIProvider(primaryProvider);
        
        if (await primary.isAvailable()) {
            return primary;
        }

        console.log(`Primary provider ${primaryProvider} unavailable, falling back to ${fallbackProvider}`);
        return new AIProvider(fallbackProvider);
    }

    static getSupportedProviders() {
        return ['openai', 'anthropic', 'grok'];
    }
}

module.exports = {
    AIProvider,
    AIProviderFactory
};
