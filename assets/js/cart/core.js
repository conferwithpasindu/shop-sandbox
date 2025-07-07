import CartNetwork from './network.js';

const CartCore = {
    storageKey: 'demo_cart',

    // Get cart items from localStorage
    getCartItems: function () {
        const cartData = localStorage.getItem(this.storageKey);
        return cartData ? JSON.parse(cartData) : [];
    },

    // Add items to cart
    addToCart: function (items) {
        const currentCart = this.getCartItems();
        const updatedCart = [...currentCart];

        // Process each item and ensure we have the proper format
        const processedItems = items.map((item) => {
            // Create a new object without the id property
            const { id, ...otherProperties } = item;

            // Ensure we're using variantId only
            const processedItem = {
                variantId: item.variantId || id, // Use id only to determine variantId if needed
                quantity: item.quantity || 1,
                ...otherProperties, // Keep other properties except id
            };

            return processedItem;
        });

        // Now process these items for the cart
        processedItems.forEach((newItem) => {
            const existingItemIndex = updatedCart.findIndex((item) => item.variantId === newItem.variantId);

            if (existingItemIndex >= 0) {
                // Update quantity if item exists
                updatedCart[existingItemIndex].quantity += newItem.quantity;
            } else {
                // Add new item
                updatedCart.push({ ...newItem });
            }
        });

        // Make an actual fetch request to a fake endpoint (will show in network tab)
        // Use simulateNetworkRequest to avoid 405 errors
        CartNetwork.simulateNetworkRequest('/api/cart/add', 'POST', {
            items: processedItems.map((item) => ({
                variantId: item.variantId, // Use the preserved variantId
                quantity: item.quantity,
            })),
        });

        // Save to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(updatedCart));

        // Update UI
        this.updateCartUI();

        // Return response for API compatibility
        return {
            status: 'success',
            added: processedItems,
            cart: updatedCart,
        };
    },

    // Clear cart
    clearCart: function () {
        // Make an actual fetch request to a fake endpoint (will show in network tab)
        fetch(`${CartNetwork.apiEndpoint}/clear/${Date.now()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(() => {
                this.showNotification('Cart cleared successfully', 'success');
            })
            .catch(() => {
                // Expected to fail with 404, show notification anyway
                this.showNotification('Network error occurred. Cart cleared locally.', 'error');
            });

        localStorage.removeItem(this.storageKey);
        return {
            status: 'success',
            cart: [],
        };
    },

    // Get total count of items in cart
    getCartTotalCount: function () {
        const cartItems = this.getCartItems();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    },

    // Remove item from cart
    removeItem: function (itemId) {
        const currentCart = this.getCartItems();
        const updatedCart = currentCart.filter((item) => item.variantId !== itemId);

        // Make an actual fetch request to a fake endpoint (will show in network tab)
        fetch(`${CartNetwork.apiEndpoint}/remove/${Date.now()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variantId: itemId,
                cart: updatedCart,
            }),
        })
            .then(() => {
                this.showNotification('Item removed from cart', 'success');
            })
            .catch(() => {
                // Expected to fail with 404, show notification anyway
                this.showNotification('Network error occurred. Cart updated locally.', 'error');
            });

        localStorage.setItem(this.storageKey, JSON.stringify(updatedCart));
        this.updateCartUI();

        return {
            status: 'success',
            removed: itemId,
            cart: updatedCart,
        };
    },

    // Update item quantity
    updateItemQuantity: function (itemId, quantity) {
        const currentCart = this.getCartItems();
        const updatedCart = [...currentCart];

        const itemIndex = updatedCart.findIndex((item) => item.variantId === itemId);
        if (itemIndex >= 0) {
            if (quantity > 0) {
                updatedCart[itemIndex].quantity = quantity;
            } else {
                // Remove item if quantity is 0 or negative
                updatedCart.splice(itemIndex, 1);
            }
        }

        // Make an actual fetch request to a fake endpoint (will show in network tab)
        fetch(`${CartNetwork.apiEndpoint}/update/${Date.now()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: itemId,
                quantity: quantity,
                cart: updatedCart,
            }),
        })
            .then(() => {
                this.showNotification('Cart quantity updated', 'success');
            })
            .catch(() => {
                // Expected to fail with 404, show notification anyway
                this.showNotification('Network error occurred. Cart updated locally.', 'error');
            });

        localStorage.setItem(this.storageKey, JSON.stringify(updatedCart));
        this.updateCartUI();

        return {
            status: 'success',
            updated: { id: itemId, quantity },
            cart: updatedCart,
        };
    },

    // Placeholder methods that will be defined in UI and Utils modules
    updateCartUI: function () {},
    showNotification: function () {},
};

export default CartCore;
