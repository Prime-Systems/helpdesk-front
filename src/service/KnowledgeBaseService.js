import axios from '@/plugins/axios';

/**
 * Service for managing FAQ and Articles via the Knowledge Base Module API
 * Base Path: /api/v1/knowledge-base
 */
export const KnowledgeBaseService = {
    // ============ FAQ Endpoints ============

    /**
     * Get all FAQs (paginated)
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.size - Page size
     * @param {number} params.categoryId - Filter by category (optional)
     * @returns {Promise<{faqs: Array<FaqDto>, totalItems: number}>}
     */
    async getFaqs(params = {}) {
        const response = await axios.get('/knowledge-base/faqs', {
            params: {
                page: params.page !== undefined ? params.page : 1,
                size: params.size || 20,
                categoryId: params.categoryId
            }
        });
        return response.data;
    },

    /**
     * Get FAQ by ID
     * @param {number} id - FAQ ID
     * @returns {Promise<FaqDto>}
     */
    async getFaqById(id) {
        const response = await axios.get(`/knowledge-base/faqs/${id}`);
        return response.data;
    },

    /**
     * Create FAQ
     * @param {Object} faqData - CreateFaqDto
     * @returns {Promise<FaqDto>}
     */
    async createFaq(faqData) {
        const response = await axios.post('/knowledge-base/faqs', faqData);
        return response.data;
    },

    /**
     * Update FAQ
     * @param {number} id - FAQ ID
     * @param {Object} faqData - FaqDto
     * @returns {Promise<FaqDto>}
     */
    async updateFaq(id, faqData) {
        const response = await axios.put(`/knowledge-base/faqs/${id}`, faqData);
        return response.data;
    },

    /**
     * Delete FAQ
     * @param {number} id - FAQ ID
     */
    async deleteFaq(id) {
        await axios.delete(`/knowledge-base/faqs/${id}`);
    },

    /**
     * Mark FAQ as helpful
     * @param {number} id - FAQ ID
     * @returns {Promise<FaqDto>}
     */
    async markFaqHelpful(id) {
        const response = await axios.post(`/knowledge-base/faqs/${id}/helpful`);
        return response.data;
    },

    /**
     * Search FAQs
     * @param {string} query - Search query
     * @returns {Promise<Array<FaqDto>>}
     */
    async searchFaqs(query) {
        const response = await axios.get('/knowledge-base/faqs/search', {
            params: { q: query }
        });
        return response.data;
    },

    /**
     * Get popular FAQs
     * @param {number} limit - Number of results
     * @returns {Promise<Array<FaqDto>>}
     */
    async getPopularFaqs(limit = 5) {
        const response = await axios.get('/knowledge-base/faqs/popular', {
            params: { limit }
        });
        return response.data;
    },

    /**
     * Get FAQ categories
     * @returns {Promise<Array<FaqCategoryDto>>}
     */
    async getFaqCategories() {
        const response = await axios.get('/knowledge-base/faq-categories');
        return response.data;
    },

    /**
     * Create FAQ category
     * @param {Object} categoryData - FaqCategoryDto
     * @returns {Promise<FaqCategoryDto>}
     */
    async createFaqCategory(categoryData) {
        const response = await axios.post('/knowledge-base/faq-categories', categoryData);
        return response.data;
    },

    /**
     * Update FAQ category
     * @param {number} id - Category ID
     * @param {Object} categoryData - FaqCategoryDto
     * @returns {Promise<FaqCategoryDto>}
     */
    async updateFaqCategory(id, categoryData) {
        const response = await axios.put(`/knowledge-base/faq-categories/${id}`, categoryData);
        return response.data;
    },

    /**
     * Delete FAQ category
     * @param {number} id - Category ID
     */
    async deleteFaqCategory(id) {
        await axios.delete(`/knowledge-base/faq-categories/${id}`);
    },

    // ============ Article Endpoints ============

    /**
     * Get all articles (paginated)
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.size - Page size
     * @param {number} params.categoryId - Filter by category (optional)
     * @returns {Promise<{articles: Array<ArticleDto>, totalItems: number}>}
     */
    async getArticles(params = {}) {
        const response = await axios.get('/knowledge-base/articles', {
            params: {
                page: params.page !== undefined ? params.page : 1,
                size: params.size || 20,
                categoryId: params.categoryId
            }
        });
        return response.data;
    },

    /**
     * Get article by ID
     * @param {number} id - Article ID
     * @returns {Promise<ArticleDto>}
     */
    async getArticleById(id) {
        const response = await axios.get(`/knowledge-base/articles/${id}`);
        return response.data;
    },

    /**
     * Create article
     * @param {Object} articleData - CreateArticleDto
     * @returns {Promise<ArticleDto>}
     */
    async createArticle(articleData) {
        const response = await axios.post('/knowledge-base/articles', articleData);
        return response.data;
    },

    /**
     * Update article
     * @param {number} id - Article ID
     * @param {Object} articleData - ArticleDto
     * @returns {Promise<ArticleDto>}
     */
    async updateArticle(id, articleData) {
        const response = await axios.put(`/knowledge-base/articles/${id}`, articleData);
        return response.data;
    },

    /**
     * Delete article
     * @param {number} id - Article ID
     */
    async deleteArticle(id) {
        await axios.delete(`/knowledge-base/articles/${id}`);
    },

    /**
     * Search articles
     * @param {string} query - Search query
     * @returns {Promise<Array<ArticleDto>>}
     */
    async searchArticles(query) {
        const response = await axios.get('/knowledge-base/articles/search', {
            params: { q: query }
        });
        return response.data;
    },

    /**
     * Get article categories
     * @returns {Promise<Array<ArticleCategoryDto>>}
     */
    async getArticleCategories() {
        const response = await axios.get('/knowledge-base/article-categories');
        return response.data;
    }
};
