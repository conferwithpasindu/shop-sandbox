import Cart from './cart/index.js';

// Re-export the Cart object
export default Cart;

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    Cart.init();
});

window.Cart = Cart;
