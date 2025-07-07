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
                    <a href="product.html?handle=${product.handle}" class="view-product-btn">
                        View Details
                    </a>
                </div>
            </div>
        `;
    },
};

window.PLP = PLP;
