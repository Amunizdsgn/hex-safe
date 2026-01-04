/**
 * Date utilities with Salvador/Bahia timezone (America/Bahia, UTC-3)
 * All dates in the system should use these functions to ensure consistency
 */

const SALVADOR_TIMEZONE = 'America/Bahia';

/**
 * Get current date/time in Salvador timezone
 * @returns {Date} Current date in Salvador timezone
 */
export const getCurrentDate = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
};

/**
 * Format date to ISO string in Salvador timezone
 * @param {Date} date - Date to format
 * @returns {string} ISO formatted date string
 */
export const toISOString = (date = getCurrentDate()) => {
    const salvadorDate = new Date(date.toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
    return salvadorDate.toISOString();
};

/**
 * Format date to YYYY-MM-DD in Salvador timezone
 * @param {Date} date - Date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const toDateString = (date = getCurrentDate()) => {
    const salvadorDate = new Date(date.toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
    const year = salvadorDate.getFullYear();
    const month = String(salvadorDate.getMonth() + 1).padStart(2, '0');
    const day = String(salvadorDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string} Date string in DD/MM/YYYY format
 */
export const toBrazilianDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', { timeZone: SALVADOR_TIMEZONE });
};

/**
 * Format date and time to Brazilian format (DD/MM/YYYY HH:mm)
 * @param {Date|string} date - Date to format
 * @returns {string} Date and time string
 */
export const toBrazilianDateTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR', {
        timeZone: SALVADOR_TIMEZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get current month (0-11) in Salvador timezone
 * @returns {number} Current month
 */
export const getCurrentMonth = () => {
    return getCurrentDate().getMonth();
};

/**
 * Get current year in Salvador timezone
 * @returns {number} Current year
 */
export const getCurrentYear = () => {
    return getCurrentDate().getFullYear();
};

/**
 * Get start of day in Salvador timezone
 * @param {Date} date - Date to get start of day
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date = getCurrentDate()) => {
    const salvadorDate = new Date(date.toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
    salvadorDate.setHours(0, 0, 0, 0);
    return salvadorDate;
};

/**
 * Get end of day in Salvador timezone
 * @param {Date} date - Date to get end of day
 * @returns {Date} End of day
 */
export const getEndOfDay = (date = getCurrentDate()) => {
    const salvadorDate = new Date(date.toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
    salvadorDate.setHours(23, 59, 59, 999);
    return salvadorDate;
};

/**
 * Get start of month in Salvador timezone
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {Date} Start of month
 */
export const getStartOfMonth = (month = getCurrentMonth(), year = getCurrentYear()) => {
    const date = new Date(year, month, 1);
    return new Date(date.toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
};

/**
 * Get end of month in Salvador timezone
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {Date} End of month
 */
export const getEndOfMonth = (month = getCurrentMonth(), year = getCurrentYear()) => {
    const date = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return new Date(date.toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
};

/**
 * Parse date string to Date object in Salvador timezone
 * @param {string} dateString - Date string to parse
 * @returns {Date} Parsed date
 */
export const parseDate = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.toLocaleString('en-US', { timeZone: SALVADOR_TIMEZONE }));
};

/**
 * Check if date is today in Salvador timezone
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = getCurrentDate();
    return toDateString(d) === toDateString(today);
};

/**
 * Get relative time description (e.g., "hoje", "ontem", "há 2 dias")
 * @param {Date|string} date - Date to get relative time
 * @returns {string} Relative time description
 */
export const getRelativeTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = getCurrentDate();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;
    return `há ${Math.floor(diffDays / 365)} anos`;
};
