// Filters Module for Items Page

import { loadJSON, qs, escapeHTML, debounce, fuzzySearch, getQueryParams, setQueryParam } from './utils.js';

let allItems = [];
let filteredItems = [];

const filters = {
    search: '',
    type: '',
    rarity: '',
    sort: 'name'
};

async function loadItems() {
    try {
        allItems = await loadJSON('/data/items.json');
        applyFilters();
    } catch (error) {
        console.error('Failed to load items:', error);
        qs('#items-grid').innerHTML = '<div class="error-state">Failed to load items.</div>';
    }
}

function applyFilters() {
    filteredItems = allItems.filter(item => {
        if (filters.search && !fuzzySearch(filters.search, `${item.name} ${item.effect}`)) {
            return false;
        }
        if (filters.type && item.type !== filters.type) {
            return false;
        }
        if (filters.rarity && item.rarity !== filters.rarity) {
            return false;
        }
        return true;
    });

    sortItems();
    renderItems();
    updateCount();
}

function sortItems() {
    const sortKey = filters.sort.replace('-', '');
    const descending = filters.sort.startsWith('-');

    filteredItems.sort((a, b) => {
        let aVal = a[sortKey];
        let bVal = b[sortKey];

        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return descending ? 1 : -1;
        if (aVal > bVal) return descending ? -1 : 1;
        return 0;
    });
}

function renderItems() {
    const grid = qs('#items-grid');

    if (filteredItems.length === 0) {
        grid.innerHTML = '<div class="empty-state">No items match your filters.</div>';
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <article class="item-card" data-item-id="${item.id}" role="button" tabindex="0">
            <div class="item-image">
                <img src="${escapeHTML(item.image || '/assets/img/placeholders/item.svg')}"
                     alt="${escapeHTML(item.name)}"
                     width="80"
                     height="80">
            </div>
            <h3>${escapeHTML(item.name)}</h3>
            <div class="item-meta">
                <span class="badge badge-${escapeHTML(item.type || 'passive')}">${escapeHTML(item.type || 'passive')}</span>
                <span class="badge badge-${escapeHTML(item.rarity || 'common')}">${escapeHTML(item.rarity || 'common')}</span>
            </div>
            <p class="item-effect">${escapeHTML(item.effect)}</p>
        </article>
    `).join('');

    // Add click handlers for modal
    grid.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => openItemModal(card.dataset.itemId));
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openItemModal(card.dataset.itemId);
            }
        });
    });
}

function updateCount() {
    const count = qs('#items-count');
    if (count) {
        count.textContent = `Showing ${filteredItems.length} of ${allItems.length} items`;
    }
}

function openItemModal(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const modal = qs('#item-modal');
    const modalBody = qs('#modal-body', modal);

    modalBody.innerHTML = `
        <div class="item-modal-content">
            <div class="item-image" style="width: 120px; height: 120px; margin: 0 auto 1rem;">
                <img src="${escapeHTML(item.image || '/assets/img/placeholders/item.svg')}"
                     alt="${escapeHTML(item.name)}"
                     width="120"
                     height="120">
            </div>
            <h2 id="modal-title" style="text-align: center; margin-bottom: 1rem;">${escapeHTML(item.name)}</h2>
            <div class="item-meta" style="justify-content: center; margin-bottom: 1rem;">
                <span class="badge badge-${escapeHTML(item.type || 'passive')}">${escapeHTML(item.type || 'passive')}</span>
                <span class="badge badge-${escapeHTML(item.rarity || 'common')}">${escapeHTML(item.rarity || 'common')}</span>
            </div>
            ${item.tags && item.tags.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <strong>Tags:</strong> ${item.tags.map(tag => `<span class="badge">${escapeHTML(tag)}</span>`).join(' ')}
                </div>
            ` : ''}
            <p><strong>Effect:</strong> ${escapeHTML(item.effect)}</p>
            ${item.details ? `<p>${escapeHTML(item.details)}</p>` : ''}
            ${item.pools && item.pools.length > 0 ? `
                <div style="margin-top: 1rem;">
                    <strong>Item Pools:</strong>
                    <ul>
                        ${item.pools.map(pool => `<li>${escapeHTML(pool)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    modal.removeAttribute('hidden');

    // Close handlers
    const closeModal = () => modal.setAttribute('hidden', '');
    modal.querySelectorAll('[data-modal-close]').forEach(el => {
        el.addEventListener('click', closeModal, { once: true });
    });

    // ESC key handler
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const filterSearch = qs('#filter-search');
    const filterType = qs('#filter-type');
    const filterRarity = qs('#filter-rarity');
    const filterSort = qs('#filter-sort');
    const clearBtn = qs('#clear-filters');

    if (!filterSearch || !filterType || !filterRarity || !filterSort) return;

    // Load URL params
    const params = getQueryParams();
    if (params.type) {
        filterType.value = params.type;
        filters.type = params.type;
    }
    if (params.rarity) {
        filterRarity.value = params.rarity;
        filters.rarity = params.rarity;
    }

    // Search handler
    const debouncedSearch = debounce((value) => {
        filters.search = value;
        applyFilters();
    }, 300);

    filterSearch.addEventListener('input', (e) => debouncedSearch(e.target.value));

    // Filter handlers
    filterType.addEventListener('change', (e) => {
        filters.type = e.target.value;
        setQueryParam('type', e.target.value);
        applyFilters();
    });

    filterRarity.addEventListener('change', (e) => {
        filters.rarity = e.target.value;
        setQueryParam('rarity', e.target.value);
        applyFilters();
    });

    filterSort.addEventListener('change', (e) => {
        filters.sort = e.target.value;
        applyFilters();
    });

    // Clear filters
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterSearch.value = '';
            filterType.value = '';
            filterRarity.value = '';
            filterSort.value = 'name';
            filters.search = '';
            filters.type = '';
            filters.rarity = '';
            filters.sort = 'name';
            setQueryParam('type', '');
            setQueryParam('rarity', '');
            applyFilters();
        });
    }

    // Load items
    loadItems();
});
