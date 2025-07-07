const PLP = {
    container: null,

    // Initialize PLP
    init: function (productType) {
        this.container = document.getElementById('products-container');
        if (!this.container) {
            console.error('Products container not found');
            return;
        }

        this.loadProducts(productType);
        this.setupEventListeners();
    },

    // Set up event listeners for product listing page
    setupEventListeners: function () {
        // Add event delegation for add to cart buttons
        document.addEventListener('click', (e) => {
            // Check if click was on an add to cart button
            if (e.target && e.target.classList.contains('add-to-cart-btn-plp') && !e.target.disabled) {
                // Get product data from data attribute
                try {
                    const productData = JSON.parse(e.target.dataset.product);
                    if (productData && productData.variantId) {
                        // Check for variantId instead of id
                        this.quickAddToCart(productData, e.target);
                    }
                } catch (error) {
                    console.error('Error parsing product data:', error);
                }
            }
        });
    },

    // Quick add to cart functionality
    quickAddToCart: function (productData, button) {
        // Create cart item
        const item = {
            variantId: productData.variantId,
            title: productData.title,
            price: productData.price,
            quantity: 1,
            image: productData.image,
        };

        // Use fetch to add to cart (this will be intercepted by our overridden fetch)
        fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [item] }),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log('Product added to cart:', data);

                // Show confirmation on button
                const originalText = button.textContent;
                button.textContent = 'Added!';
                button.classList.add('added');

                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('added');
                }, 2000);
            })
            .catch((error) => {
                console.error('Error adding to cart:', error);
            });
    },

    // Load and display products
    loadProducts: async function (productType) {
        try {
            Utils.showLoading(this.container);

            const products = await ProductLoader.getProductsByType(productType);

            if (products.length === 0) {
                this.container.innerHTML = '<p class="no-products">No products found.</p>';
                return;
            }

            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showError(this.container);
        }
    },

    // Render products
    renderProducts: function (products) {
        const productsHtml = products.map((product) => this.renderProductCard(product)).join('');
        this.container.innerHTML = productsHtml;
    },

    // Render individual product card
    renderProductCard: function (product) {
        const availabilityClass = product.availability === 'in stock' ? 'in-stock' : 'out-of-stock';

        return `
            <div class="product-card">
                <img src="${product.featuredImage}" alt="${product.title}" class="product-image" loading="lazy">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${Utils.formatPrice(product.price)}</div>
                    <div class="product-availability ${availabilityClass}">
                        ${Utils.capitalize(product.availability)}
                    </div>
                    <div class="product-actions">
                        <a href="product.html?handle=${product.handle}" class="view-product-btn">
                            View Details
                        </a>
                        <button class="add-to-cart-btn-plp" data-product='${JSON.stringify({
                            id: product.groupingId || product.variantId, // Use groupingId as id if available, otherwise use variantId
                            variantId: product.variantId, // Always use variantId as the unique identifier
                            title: product.title,
                            price: product.price,
                            image: product.featuredImage,
                        }).replace(/'/g, '&apos;')}' ${product.availability !== 'in stock' ? 'disabled' : ''}>
                            ${product.availability === 'in stock' ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
};

window.PLP = PLP;
