import CartCore from './core.js';
import Utils from '../utils.js';

const CartUI = {
    // Update cart UI elements
    updateCartUI: function () {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const count = CartCore.getCartTotalCount();
            cartCountElement.textContent = count;
            cartCountElement.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    // Display cart modal/drawer
    showCartModal: function () {
        const cartItems = CartCore.getCartItems();
        const cartModal = document.getElementById('cart-modal');

        if (!cartModal) {
            this.createCartModal();
            return;
        }

        const cartItemsList = document.getElementById('cart-items-list');
        if (cartItemsList) {
            cartItemsList.innerHTML = '';

            if (cartItems.length === 0) {
                cartItemsList.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
                return;
            }

            cartItems.forEach((item) => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    ${
                        item.image
                            ? `<div class="cart-item-image">
                          <img src="${item.image}" alt="${item.title || 'Product'}" width="50" height="50">
                       </div>`
                            : ''
                    }
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.title || 'Product ID: ' + item.variantId}</div>
                        <div class="cart-item-price">${item.price ? Utils.formatPrice(item.price) : ''}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn decrease-btn" data-id="${item.variantId}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn increase-btn" data-id="${item.variantId}">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${item.variantId}">Remove</button>
                `;
                cartItemsList.appendChild(cartItemEl);
            });

            // Add event listeners
            const decreaseBtns = cartItemsList.querySelectorAll('.decrease-btn');
            const increaseBtns = cartItemsList.querySelectorAll('.increase-btn');
            const removeBtns = cartItemsList.querySelectorAll('.remove-item-btn');

            decreaseBtns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.target.getAttribute('data-id');
                    const currentItem = cartItems.find((item) => item.variantId === itemId);
                    if (currentItem) {
                        CartCore.updateItemQuantity(itemId, currentItem.quantity - 1);
                        this.showCartModal(); // Refresh the modal
                    }
                });
            });

            increaseBtns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.target.getAttribute('data-id');
                    const currentItem = cartItems.find((item) => item.variantId === itemId);
                    if (currentItem) {
                        CartCore.updateItemQuantity(itemId, currentItem.quantity + 1);
                        this.showCartModal(); // Refresh the modal
                    }
                });
            });

            removeBtns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    const itemId = e.target.getAttribute('data-id');
                    CartCore.removeItem(itemId);
                    this.showCartModal(); // Refresh the modal
                });
            });
        }

        // Calculate total
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            const totalPrice = cartItems.reduce((sum, item) => {
                return sum + (item.price || 0) * item.quantity;
            }, 0);
            cartTotal.textContent = Utils.formatPrice(totalPrice);
        }

        // Show the modal
        cartModal.style.display = 'block';
    },

    // Create cart modal if it doesn't exist
    createCartModal: function () {
        const modalHTML = `
            <div id="cart-modal" class="cart-modal">
                <div class="cart-modal-content">
                    <div class="cart-modal-header">
                        <h3>Your Cart (${CartCore.getCartTotalCount()} items)</h3>
                        <span class="close-cart">&times;</span>
                    </div>
                    <div id="cart-items-list" class="cart-items-list">
                        <!-- Cart items will be added here -->
                    </div>
                    <div class="cart-modal-footer">
                        <div class="cart-total-section">
                            <span>Total:</span>
                            <span id="cart-total">$0.00</span>
                        </div>
                        <div class="cart-action-buttons">
                            <button id="clear-cart-btn" class="clear-cart-btn">Clear Cart</button>
                            <a href="${
                                window.location.pathname.includes('/shop/') ? '../basket.html' : 'basket.html'
                            }" class="view-basket-btn">View Basket</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        // Add event listeners
        const closeBtn = document.querySelector('.close-cart');
        const clearCartBtn = document.getElementById('clear-cart-btn');
        const cartModal = document.getElementById('cart-modal');

        closeBtn.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });

        clearCartBtn.addEventListener('click', () => {
            CartCore.clearCart();
            CartUI.updateCartUI();
            this.showCartModal();
        });

        // Close when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });

        // Now show the cart
        this.showCartModal();
    },
};

export default CartUI;
