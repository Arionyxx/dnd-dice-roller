// Search Module - Full-text search across all data

import { loadJSON, qs, escapeHTML, fuzzySearch, debounce, getQueryParams, setQueryParam } from './utils.js';

class SearchEngine {
    constructor() {
        this.data = [];
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            const [items, characters, bosses, synergies] = await Promise.all([
                loadJSON('/data/items.json'),
                loadJSON('/data/characters.json'),
                loadJSON('/data/bosses.json'),
                loadJSON('/data/synergies.json')
            ]);

            this.data = [
                ...items.map(item => ({ ...item, type: 'item', url: '/items.html' })),
                ...characters.map(char => ({ ...char, type: 'character', url: '/characters.html' })),
                ...bosses.map(boss => ({ ...boss, type: 'boss', url: '/bosses.html' })),
                ...synergies.map(syn => ({ ...syn, type: 'synergy', url: '/synergies.html' }))
            ];

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize search:', error);
            throw error;
        }
    }

    search(query) {
        if (!query || query.trim().length < 2) return [];

        query = query.toLowerCase().trim();
        const results = [];

        for (const item of this.data) {
            const searchText = this.getSearchableText(item);

            if (fuzzySearch(query, searchText)) {
                const relevance = this.calculateRelevance(query, item);
                results.push({ ...item, relevance });
            }
        }

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    getSearchableText(item) {
        const parts = [
            item.name,
            item.effect,
            item.details,
            item.strategy,
            Array.isArray(item.tags) ? item.tags.join(' ') : '',
            Array.isArray(item.items) ? item.items.join(' ') : ''
        ];
        return parts.filter(Boolean).join(' ').toLowerCase();
    }

    calculateRelevance(query, item) {
        let score = 0;
        const name = (item.name || '').toLowerCase();
        const effect = (item.effect || '').toLowerCase();

        // Exact name match
        if (name === query) score += 100;
        // Name starts with query
        else if (name.startsWith(query)) score += 50;
        // Name contains query
        else if (name.includes(query)) score += 25;

        // Effect contains query
        if (effect.includes(query)) score += 10;

        // Boost by type
        if (item.type === 'item') score += 2;

        return score;
    }

    highlightMatch(text, query) {
        if (!query || !text) return escapeHTML(text);

        const regex = new RegExp(`(${query})`, 'gi');
        return escapeHTML(text).replace(regex, '<mark>$1</mark>');
    }
}

// Initialize search on page load
const searchEngine = new SearchEngine();
let currentResults = [];

function renderResults(results, query) {
    const container = qs('#search-results');

    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No results found for "${escapeHTML(query)}"</p>
                <p>Try a different search term or browse our categories:</p>
                <div class="quick-links-grid" style="margin-top: 1rem;">
                    <a href="/items.html" class="btn btn-secondary">Items</a>
                    <a href="/characters.html" class="btn btn-secondary">Characters</a>
                    <a href="/bosses.html" class="btn btn-secondary">Bosses</a>
                    <a href="/synergies.html" class="btn btn-secondary">Synergies</a>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="results-count">${results.length} result${results.length !== 1 ? 's' : ''} found</div>
        ${results.map(result => `
            <article class="search-result-item">
                <span class="search-result-type">${escapeHTML(result.type)}</span>
                <h3>${searchEngine.highlightMatch(result.name, query)}</h3>
                ${result.effect ? `<p>${escapeHTML(result.effect)}</p>` : ''}
                ${result.details ? `<p>${escapeHTML(result.details.substring(0, 150))}${result.details.length > 150 ? '...' : ''}</p>` : ''}
                <a href="${escapeHTML(result.url)}" class="card-link">
                    View ${escapeHTML(result.type)}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </article>
        `).join('')}
    `;
}

async function handleSearch(query) {
    const container = qs('#search-results');

    if (!query || query.trim().length < 2) {
        container.innerHTML = '<div class="empty-state">Enter at least 2 characters to search</div>';
        return;
    }

    container.innerHTML = '<div class="loading-state">Searching...</div>';

    try {
        await searchEngine.init();
        currentResults = searchEngine.search(query);
        renderResults(currentResults, query);
        setQueryParam('q', query);
    } catch (error) {
        console.error('Search error:', error);
        container.innerHTML = '<div class="error-state">An error occurred while searching. Please try again.</div>';
    }
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    const form = qs('#search-form');
    const input = qs('#search-input');

    if (!form || !input) return;

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSearch(input.value);
    });

    // Real-time search with debounce
    const debouncedSearch = debounce((query) => {
        if (query.length >= 2) {
            handleSearch(query);
        }
    }, 500);

    input.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Load search from URL parameter
    const params = getQueryParams();
    if (params.q) {
        input.value = params.q;
        handleSearch(params.q);
    }
});
