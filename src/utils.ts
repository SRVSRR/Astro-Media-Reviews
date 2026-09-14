// Format date to string
function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'long', day:'numeric'};

    return new Date(date).toLocaleDateString(undefined, options);
}

// Compact date for tight layouts (e.g. series listings on mobile)
function formatShortDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {month: 'short', day: 'numeric', year: 'numeric'};

    return new Date(date).toLocaleDateString(undefined, options);
}

// Capitalize the first ltter of tags
function capitalize(str: string): string {
    if(typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Calculate read time based on word count (average 200 words per minute)
function calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const textOnly = content.replace(/```[\s\S]*?```/g, '').replace(/[#*`\[\]()>|_-]/g, '');
    const wordCount = textOnly.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}

// Convert a string to a URL-safe slug (lowercase, hyphen-separated)
function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Escape text for safe insertion into HTML
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Wrap query terms in <mark>, longest term first to avoid partial matches
function highlightTerms(value: string, terms: string[]): string {
    const escaped = escapeHtml(value);
    const patterns = terms
        .map((term) => term.trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
        .map((term) => escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (patterns.length === 0) return escaped;
    return escaped.replace(new RegExp(`(${patterns.join('|')})`, 'gi'), '<mark>$1</mark>');
}

export { formatDate, formatShortDate, capitalize, calculateReadTime, slugify, escapeHtml, highlightTerms };
