const ProductLoader = {
    cache: null,

    // Load products from feed.json
    loadProducts: async function () {
        if (this.cache) {
            return this.cache;
        }

        try {
            const response = await fetch('../data/feed.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            this.cache = products;
            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            throw error;
        }
    },

    // Get products by type
    getProductsByType: async function (productType) {
        try {
            const products = await this.loadProducts();
            return products.filter((product) => product.productType === productType);
        } catch (error) {
            console.error('Error filtering products by type:', error);
            throw error;
        }
    },

    // Get product by handle
    getProductByHandle: async function (handle) {
        try {
            const products = await this.loadProducts();
            return products.find((product) => product.handle === handle);
        } catch (error) {
            console.error('Error finding product by handle:', error);
            throw error;
        }
    },

    // Get variants by grouping ID
    getVariantsByGroupingId: async function (groupingId) {
        try {
            const products = await this.loadProducts();
            return products.filter((product) => product.groupingId === groupingId);
        } catch (error) {
            console.error('Error finding variants by grouping ID:', error);
            throw error;
        }
    },

    // Clear cache as useful for testing
    clearCache: function () {
        this.cache = null;
    },
};

window.ProductLoader = ProductLoader;
