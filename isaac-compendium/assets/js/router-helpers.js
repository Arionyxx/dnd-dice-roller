// Router Helpers - Query String and Navigation Utilities

export function parseQueryString(queryString = window.location.search) {
    const params = new URLSearchParams(queryString);
    const result = {};

    for (const [key, value] of params.entries()) {
        result[key] = value;
    }

    return result;
}

export function buildQueryString(params) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.set(key, value);
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

export function updateQueryString(params, replace = true) {
    const currentParams = parseQueryString();
    const newParams = { ...currentParams, ...params };

    // Remove null/undefined values
    Object.keys(newParams).forEach(key => {
        if (newParams[key] === null || newParams[key] === undefined || newParams[key] === '') {
            delete newParams[key];
        }
    });

    const queryString = buildQueryString(newParams);
    const newUrl = `${window.location.pathname}${queryString}`;

    if (replace) {
        window.history.replaceState({}, '', newUrl);
    } else {
        window.history.pushState({}, '', newUrl);
    }
}

export function navigateTo(url) {
    window.location.href = url;
}

export function getCurrentPage() {
    return window.location.pathname.replace(/^\/|\/$/g, '') || 'index';
}

export function isActive(path) {
    return window.location.pathname === path || window.location.pathname === `${path}.html`;
}
