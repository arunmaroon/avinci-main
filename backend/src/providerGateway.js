const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

/**
 * Model-agnostic provider gateway for OpenAI and Anthropic
 * Allows switching between AI providers without changing calling code
 */

class ProviderGateway {
  constructor() {
    this.provider = this.getProvider();
  }

  getProvider() {
    const provider = process.env.AI_PROVIDER || 'openai';
    
    if (provider === 'anthropic') {
      return new AnthropicProvider();
    } else {
      return new OpenAIProvider();
    }
  }

  async chat(messages, params = {}) {
    return await this.provider.chat(messages, params);
  }
}

class OpenAIProvider {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async chat(messages, params = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: params.model || 'gpt-4o',
        messages: messages,
        temperature: params.temperature || 0.8,
        max_tokens: params.max_tokens || 300,
        top_p: params.top_p || 0.9,
        presence_penalty: params.presence_penalty || 0.6,
        frequency_penalty: params.frequency_penalty || 0.5
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }
}

class AnthropicProvider {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async chat(messages, params = {}) {
    try {
      // Separate system message from conversation messages
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      // Convert to Anthropic format
      const anthropicMessages = conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await this.client.messages.create({
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 300,
        system: systemMessage?.content || '',
        messages: anthropicMessages,
        temperature: params.temperature || 0.8
      });

      // Extract text content from response
      const textContent = response.content.find(part => part.type === 'text');
      return textContent?.text || '';
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw new Error(`Anthropic API Error: ${error.message}`);
    }
  }
}

// Export singleton instance
const providerGateway = new ProviderGateway();
module.exports = providerGateway;

