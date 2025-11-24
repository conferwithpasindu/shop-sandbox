// Export Utils as both a named export and default export
export const Utils = {
    // Get URL parameters
    getUrlParam: function (param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // Update URL without page reload
    updateUrl: function (param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    },

    // Format price
    formatPrice: function (price) {
        return `$${parseFloat(price).toFixed(2)}`;
    },

    // Capitalize first letter
    capitalize: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Show loading state
    showLoading: function (element, text = 'Loading...') {
        element.innerHTML = `<div class="loading">${text}</div>`;
    },

    // Show error message
    showError: function (element, message = 'Something went wrong. Please try again.') {
        element.innerHTML = `<div class="error">${message}</div>`;
    },

    // Debounce function
    debounce: function (func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
};

// Global error handler
window.addEventListener('error', function (e) {
    console.error('JavaScript error:', e.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
});

window.Utils = Utils;

// Add default export for module support
export default Utils;

/*
 * Load Conferwith Widget
 */

const WIDGET_EXCLUDED_PATHS = ['/contact'];

function shouldShowWidget() {
    const currentPath = window.location.pathname;
    return !WIDGET_EXCLUDED_PATHS.some((path) => currentPath.endsWith(path) || currentPath.endsWith(path + '/'));
}

function loadConferWithWidget() {
    if (!shouldShowWidget()) {
        return;
    }

    // const script = document.createElement('script');
    // script.src = 'https://live.conferwith.io/cdn/conferwith_widget.js';
    // script.setAttribute('data-baseurl', 'johnlewis_samsungtv.com');
    // document.body.appendChild(script);
    const script = document.createElement('script');
    script.src = 'https://widget.personaguide.store/gtm.js';
    script.setAttribute('data-baseurl', 'johnlewis_samsungtv.com');
    document.body.appendChild(script);
}

// Initialize widget when DOM ready
document.addEventListener('DOMContentLoaded', loadConferWithWidget);
