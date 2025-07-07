import CartCore from './core.js';
import CartNetwork from './network.js';
import CartUI from './ui.js';
import CartUtils from './utils.js';

// Create a unified Cart object by combining all modules
const Cart = {
    // Properties
    storageKey: CartCore.storageKey,
    apiEndpoint: CartNetwork.apiEndpoint,
    networkRequestsInProgress: CartNetwork.networkRequestsInProgress,

    // Core functionality
    getCartItems: function () {
        return CartCore.getCartItems.apply(this, arguments);
    },

    addToCart: function () {
        return CartCore.addToCart.apply(this, arguments);
    },

    clearCart: function () {
        return CartCore.clearCart.apply(this, arguments);
    },

    getCartTotalCount: function () {
        return CartCore.getCartTotalCount.apply(this, arguments);
    },

    removeItem: function () {
        return CartCore.removeItem.apply(this, arguments);
    },

    updateItemQuantity: function () {
        return CartCore.updateItemQuantity.apply(this, arguments);
    },

    // Network functionality
    simulateNetworkRequest: function () {
        return CartNetwork.simulateNetworkRequest.apply(this, arguments);
    },

    setupNetworkTracking: function () {
        return CartNetwork.setupNetworkTracking.apply(this, arguments);
    },

    overrideFetch: function () {
        return CartNetwork.overrideFetch.apply(this, arguments);
    },

    updateNetworkIndicator: function () {
        return CartNetwork.updateNetworkIndicator.apply(this, arguments);
    },

    // UI functionality
    updateCartUI: function () {
        return CartUI.updateCartUI.apply(this, arguments);
    },

    showCartModal: function () {
        return CartUI.showCartModal.apply(this, arguments);
    },

    createCartModal: function () {
        return CartUI.createCartModal.apply(this, arguments);
    },

    // Utility functions
    showNotification: function () {
        return CartUtils.showNotification.apply(this, arguments);
    },

    // Initialize cart functionality
    init: function () {
        this.overrideFetch();
        this.updateCartUI();
        this.setupNetworkTracking();
    },
};

// Export the Cart object
export default Cart;

// Make Cart available globally immediately
window.Cart = Cart;

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    Cart.init();
});
