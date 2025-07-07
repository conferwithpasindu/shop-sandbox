const PDP = {
    container: null,
    currentProduct: null,
    variants: [],

    // Initialize PDP
    init: function () {
        this.container = document.getElementById('product-container');
        if (!this.container) {
            console.error('Product container not found');
            return;
        }

        const handle = Utils.getUrlParam('handle');
        if (!handle) {
            this.showError('No product specified');
            return;
        }

        this.loadProduct(handle);
    },

    // Load product data
    loadProduct: async function (handle) {
        try {
            Utils.showLoading(this.container);

            const product = await ProductLoader.getProductByHandle(handle);

            if (!product) {
                this.showError('Product not found');
                return;
            }

            this.currentProduct = product;

            // Load variants
            this.variants = await ProductLoader.getVariantsByGroupingId(product.groupingId);

            // Update page title
            document.title = `${product.title} - Demo Store`;

            this.renderProduct();
        } catch (error) {
            console.error('Error loading product:', error);
            this.showError('Error loading product details');
        }
    },

    // Render product
    renderProduct: function () {
        const product = this.currentProduct;
        const availabilityClass = product.availability === 'in stock' ? 'in-stock' : 'out-of-stock';

        const html = `
            <div class="product-detail">
                <div class="product-images">
                    <img src="${product.featuredImage}" alt="${
            product.title
        }" class="product-main-image" id="mainImage">
                    <div class="product-thumbnails">
                        ${product.images
                            .map(
                                (image, index) => `
                            <img src="${image}" alt="${product.title}" class="product-thumbnail ${
                                    index === 0 ? 'active' : ''
                                }" 
                                 onclick="PDP.changeMainImage('${image}', this)">
                        `
                            )
                            .join('')}
                    </div>
                </div>
                
                <div class="product-details">
                    <h1>${product.title}</h1>
                    <div class="price">${Utils.formatPrice(product.price)}</div>
                    <div class="availability ${availabilityClass}">
                        ${Utils.capitalize(product.availability)}
                    </div>
                    
                    <div class="description">
                        ${product.descriptionHtml}
                    </div>
                    
                    ${this.renderVariantSelector()}
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" ${product.availability !== 'in stock' ? 'disabled' : ''}>
                            ${product.availability === 'in stock' ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                    
                    <div class="product-meta">
                        <p><strong>Category:</strong> ${product.productType}</p>
                        ${product.tags.length > 0 ? `<p><strong>Tags:</strong> ${product.tags.join(', ')}</p>` : ''}
                    </div>
                    
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Add event listeners
        this.setupEventListeners();
    },

    // Render variant selector
    renderVariantSelector: function () {
        if (this.variants.length <= 1) {
            return '';
        }

        const options = this.variants
            .map(
                (variant) => `
            <option value="${variant.handle}" ${variant.handle === this.currentProduct.handle ? 'selected' : ''}>
                ${variant.title}
            </option>
        `
            )
            .join('');

        return `
            <div class="variant-selector">
                <label for="variant-select">Select Variant:</label>
                <select id="variant-select" onchange="PDP.changeVariant(this.value)">
                    ${options}
                </select>
            </div>
        `;
    },

    // Change main image
    changeMainImage: function (imageSrc, thumbnail) {
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.src = imageSrc;
        }

        // Update active thumbnail
        const thumbnails = document.querySelectorAll('.product-thumbnail');
        thumbnails.forEach((thumb) => thumb.classList.remove('active'));
        thumbnail.classList.add('active');
    },

    // Change variant
    changeVariant: function (handle) {
        if (handle && handle !== this.currentProduct.handle) {
            // Update URL and reload page
            window.location.href = `product.html?handle=${handle}`;
        }
    },

    // Setup event listeners
    setupEventListeners: function () {
        // Add to cart button
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn && !addToCartBtn.disabled) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }
    },

    // Add to cart functionality
    addToCart: function () {
        const product = this.currentProduct;

        // Prepare cart item
        const cartItem = {
            variantId: product.variantId,
            title: product.title,
            price: product.price,
            quantity: 1,
            image: product.featuredImage,
        };

        // Use the fetch API to add to cart
        fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [cartItem],
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log('Product added to cart:', data);

                // Show confirmation message
                const addToCartBtn = document.querySelector('.add-to-cart-btn');
                const originalText = addToCartBtn.textContent;

                addToCartBtn.textContent = 'Added to Cart!';
                addToCartBtn.classList.add('added');

                setTimeout(() => {
                    addToCartBtn.textContent = originalText;
                    addToCartBtn.classList.remove('added');
                }, 2000);
            })
            .catch((error) => {
                console.error('Error adding to cart:', error);
            });
    },

    // Show error message
    showError: function (message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="../index.html">Return to Home</a>
            </div>
        `;
    },
};

window.PDP = PDP;
