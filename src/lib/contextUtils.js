/**
 * Context Utilities
 * Helper functions to filter data by context (empresa/pessoal/consolidado)
 */

/**
 * Filter items by context
 * @param {Array} items - Array of items to filter
 * @param {string} context - Current context ('empresa', 'pessoal', 'consolidado')
 * @param {string} field - Field name to filter by (default: 'origem')
 * @returns {Array} Filtered items
 */
export const filterByContext = (items, context, field = 'origem') => {
    if (!items || !Array.isArray(items)) return [];
    if (context === 'consolidado') return items;
    return items.filter(item => item[field] === context);
};

/**
 * Get human-readable label for context
 * @param {string} context - Context identifier
 * @returns {string} Human-readable label
 */
export const getContextLabel = (context) => {
    const labels = {
        empresa: 'Empresa',
        pessoal: 'Pessoal',
        consolidado: 'Consolidado'
    };
    return labels[context] || 'Todos';
};

/**
 * Check if context is empresa
 * @param {string} context - Context identifier
 * @returns {boolean}
 */
export const isEmpresaContext = (context) => context === 'empresa';

/**
 * Check if context is pessoal
 * @param {string} context - Context identifier
 * @returns {boolean}
 */
export const isPessoalContext = (context) => context === 'pessoal';

/**
 * Check if context is consolidado
 * @param {string} context - Context identifier
 * @returns {boolean}
 */
export const isConsolidadoContext = (context) => context === 'consolidado';

/**
 * Filter transactions by context and type
 * @param {Array} transactions - Array of transactions
 * @param {string} context - Current context
 * @param {string|Array} type - Transaction type(s) to filter
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByContextAndType = (transactions, context, type) => {
    const contextFiltered = filterByContext(transactions, context);

    if (!type) return contextFiltered;

    const types = Array.isArray(type) ? type : [type];
    return contextFiltered.filter(t => types.includes(t.type));
};

/**
 * Calculate total from filtered items
 * @param {Array} items - Array of items
 * @param {string} context - Current context
 * @param {string} valueField - Field containing the value (default: 'valor')
 * @returns {number} Total sum
 */
export const calculateContextTotal = (items, context, valueField = 'valor') => {
    const filtered = filterByContext(items, context);
    return filtered.reduce((sum, item) => sum + Number(item[valueField] || 0), 0);
};
