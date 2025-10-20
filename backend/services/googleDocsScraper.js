/**
 * Google Docs Scraper Service
 * Extracts text content from Google Docs URLs
 */

const { google } = require('googleapis');
const { logger } = require('../utils/logger');

class GoogleDocsScraper {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    this.docs = google.docs({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Extract document ID from Google Docs URL
   * @param {string} url - Google Docs URL
   * @returns {string} - Document ID
   */
  extractDocumentId(url) {
    try {
      // Handle different Google Docs URL formats
      const patterns = [
        /\/d\/([a-zA-Z0-9-_]+)/,  // Standard format
        /id=([a-zA-Z0-9-_]+)/,    // Alternative format
        /\/document\/d\/([a-zA-Z0-9-_]+)/  // Another format
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      
      throw new Error('Invalid Google Docs URL format');
    } catch (error) {
      logger.error('Error extracting document ID:', error);
      throw new Error('Invalid Google Docs URL format');
    }
  }

  /**
   * Validate Google Docs URL
   * @param {string} url - URL to validate
   * @returns {boolean} - Whether URL is valid
   */
  validateUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('docs.google.com') || 
             urlObj.hostname.includes('drive.google.com');
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract text content from Google Docs
   * @param {string} url - Google Docs URL
   * @returns {Promise<string>} - Extracted text content
   */
  async extractText(url) {
    try {
      // Validate URL
      if (!this.validateUrl(url)) {
        throw new Error('Invalid Google Docs URL');
      }

      // Extract document ID
      const documentId = this.extractDocumentId(url);
      
      logger.info(`Extracting text from Google Doc: ${documentId}`);

      // Get document content
      const response = await this.docs.documents.get({
        documentId: documentId
      });

      // Extract text from document body
      const text = this.extractTextFromDocument(response.data);
      
      logger.info(`Successfully extracted ${text.length} characters from Google Doc`);
      
      return text;
    } catch (error) {
      logger.error('Error extracting text from Google Docs:', error);
      throw new Error(`Failed to extract text from Google Docs: ${error.message}`);
    }
  }

  /**
   * Extract text content from document structure
   * @param {Object} document - Google Docs document object
   * @returns {string} - Extracted text
   */
  extractTextFromDocument(document) {
    try {
      if (!document.body || !document.body.content) {
        return '';
      }

      let text = '';
      
      for (const element of document.body.content) {
        if (element.paragraph) {
          text += this.extractTextFromParagraph(element.paragraph) + '\n';
        } else if (element.table) {
          text += this.extractTextFromTable(element.table) + '\n';
        }
      }

      return text.trim();
    } catch (error) {
      logger.error('Error extracting text from document structure:', error);
      return '';
    }
  }

  /**
   * Extract text from paragraph element
   * @param {Object} paragraph - Paragraph element
   * @returns {string} - Extracted text
   */
  extractTextFromParagraph(paragraph) {
    try {
      if (!paragraph.elements) {
        return '';
      }

      let text = '';
      
      for (const element of paragraph.elements) {
        if (element.textRun) {
          text += element.textRun.content || '';
        }
      }

      return text;
    } catch (error) {
      logger.error('Error extracting text from paragraph:', error);
      return '';
    }
  }

  /**
   * Extract text from table element
   * @param {Object} table - Table element
   * @returns {string} - Extracted text
   */
  extractTextFromTable(table) {
    try {
      if (!table.tableRows) {
        return '';
      }

      let text = '';
      
      for (const row of table.tableRows) {
        if (row.tableCells) {
          for (const cell of row.tableCells) {
            if (cell.content) {
              for (const element of cell.content) {
                if (element.paragraph) {
                  text += this.extractTextFromParagraph(element.paragraph) + ' ';
                }
              }
                text += '\t'; // Tab separator for cells
            }
          }
          text += '\n'; // New line for rows
        }
      }

      return text;
    } catch (error) {
      logger.error('Error extracting text from table:', error);
      return '';
    }
  }

  /**
   * Extract text from multiple Google Docs URLs
   * @param {string[]} urls - Array of Google Docs URLs
   * @returns {Promise<Array>} - Array of extracted text content
   */
  async extractMultipleTexts(urls) {
    try {
      const results = [];
      
      for (const url of urls) {
        try {
          const text = await this.extractText(url);
          results.push({
            url,
            text,
            success: true
          });
        } catch (error) {
          logger.error(`Error extracting text from ${url}:`, error);
          results.push({
            url,
            text: '',
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error extracting multiple texts:', error);
      throw error;
    }
  }
}

module.exports = GoogleDocsScraper;
