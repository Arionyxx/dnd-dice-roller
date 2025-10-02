// Simple Privacy-Friendly Analytics using localStorage

(function() {
    const STORAGE_KEY = 'isaac-analytics';

    function getAnalytics() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : { pageViews: {}, totalVisits: 0, firstVisit: null };
        } catch {
            return { pageViews: {}, totalVisits: 0, firstVisit: null };
        }
    }

    function saveAnalytics(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save analytics:', error);
        }
    }

    function trackPageView() {
        const analytics = getAnalytics();
        const page = window.location.pathname || '/';

        // Initialize if first visit
        if (!analytics.firstVisit) {
            analytics.firstVisit = new Date().toISOString();
        }

        // Increment page views
        analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;
        analytics.totalVisits += 1;
        analytics.lastVisit = new Date().toISOString();

        saveAnalytics(analytics);
    }

    // Track page view on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }

    // Expose function to get analytics (for debugging or stats pages)
    window.getAnalytics = getAnalytics;
})();
