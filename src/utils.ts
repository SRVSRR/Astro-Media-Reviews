// Format date to string
function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'long', day:'numeric'};

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

export { formatDate, capitalize, calculateReadTime };
