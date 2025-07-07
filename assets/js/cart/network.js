const CartNetwork = {
    apiEndpoint: '/api/cart', // Relative URL to avoid CORS issues
    networkRequestsInProgress: 0,

    // Make actual network request to a non-existent endpoint (will show in Network tab)
    simulateNetworkRequest: function (endpoint, method, data) {
        console.log(`Sending ${method} request to ${endpoint} with data:`, data);

        // Increment network requests counter and show indicator
        this.networkRequestsInProgress++;
        this.updateNetworkIndicator();

        // The actual URL we'll request - this will show in Network tab
        // Use a fake endpoint that will 404 but still show in Network panel
        const requestUrl = `${this.apiEndpoint}/${Date.now()}`;

        // Create fetch options
        const fetchOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            // For GET requests, don't include body
            ...(method !== 'GET' && { body: JSON.stringify(data) }),
        };

        return new Promise((resolve, reject) => {
            // Add a small random delay to make it feel more realistic
            const delay = 100 + Math.random() * 300;

            // Simulate occasional network failures (10% chance)
            const shouldFail = Math.random() < 0.1;

            setTimeout(() => {
                // Make an actual network request that will show in Network tab
                fetch(requestUrl, fetchOptions)
                    .then(() => {
                        // We don't care about the actual response since this is a simulation
                        // We just want the request to appear in the Network tab
                    })
                    .catch(() => {
                        // Expected to fail since endpoint doesn't exist
                    })
                    .finally(() => {
                        // Decrement counter and hide indicator if no more requests
                        this.networkRequestsInProgress--;
                        this.updateNetworkIndicator();

                        if (shouldFail) {
                            console.log(`Network request to ${endpoint} failed`);
                            reject({
                                status: 'error',
                                code: 503,
                                message: 'Service temporarily unavailable',
                            });
                        } else {
                            console.log(`Network request to ${endpoint} succeeded`);
                            resolve({
                                status: 'success',
                                data: data,
                            });
                        }
                    });
            }, delay);
        });
    },

    // Setup tracking for all network requests to show the network indicator
    setupNetworkTracking: function () {
        const self = this;
        const originalFetch = window.fetch;

        // Track our cart-related requests to show the indicator
        window.fetch = function (url, options) {
            // Only track requests to our API endpoints
            if (typeof url === 'string' && url.includes('/api/cart')) {
                self.networkRequestsInProgress++;
                self.updateNetworkIndicator();

                // Return the fetch promise but add handlers to track completion
                return originalFetch.apply(this, arguments).finally(() => {
                    self.networkRequestsInProgress--;
                    self.updateNetworkIndicator();
                });
            }

            // Pass through all other requests unchanged
            return originalFetch.apply(this, arguments);
        };
    },

    // Override global fetch to intercept cart API calls
    overrideFetch: function () {
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = function (url, options) {
            // Check if this is a cart API call
            if (typeof url === 'string' && (url.endsWith('/cart/add.js') || url.includes('/cart/add.js'))) {
                return new Promise((resolve) => {
                    // Extract items from request body
                    let items = [];

                    try {
                        const body = JSON.parse(options.body);

                        // Handle different payload formats
                        if (body.items) {
                            // Multiple items format
                            items = body.items.map((item) => ({
                                variantId: item.variantId || item.id, // Always store variantId
                                quantity: item.quantity || 1,
                            }));
                        } else if (body.id || body.variantId) {
                            // Single item format - ensure we use variantId as the primary identifier
                            const variantId = body.variantId || body.id;
                            const quantity = body.quantity || 1;

                            items = [
                                {
                                    variantId: variantId,
                                    quantity: quantity,
                                },
                            ];
                        }

                        // Fetch additional product data from feed.json for these items
                        // This would typically be an API call, but for this demo we'll load the feed
                        fetch('/data/feed.json')
                            .then((response) => response.json())
                            .then((products) => {
                                // Process cart locally - don't call addToCart since that would
                                // trigger another network request and cause a loop
                                const currentCart = window.Cart.getCartItems();
                                const updatedCart = [...currentCart];

                                // Track valid and invalid items
                                const validItems = [];
                                const invalidItems = [];

                                // Process each item with product data from feed
                                items.forEach((newItem) => {
                                    // Find product data in feed by variantId
                                    const productData = products.find((p) => p.variantId === newItem.variantId);

                                    if (productData) {
                                        // Add product data to item
                                        newItem.title = productData.title;
                                        newItem.price = productData.price;
                                        newItem.image = productData.featuredImage;
                                        // Ensure we're using the correct variantId
                                        newItem.variantId = productData.variantId;

                                        // Add to valid items
                                        validItems.push(newItem);

                                        const existingItemIndex = updatedCart.findIndex(
                                            (item) => item.variantId === newItem.variantId
                                        );

                                        if (existingItemIndex >= 0) {
                                            updatedCart[existingItemIndex].quantity += newItem.quantity;
                                        } else {
                                            updatedCart.push({ ...newItem });
                                        }
                                    } else {
                                        console.warn(`Product not found for variantId: ${newItem.variantId}`);
                                        invalidItems.push(newItem.variantId);
                                    }
                                });

                                // Only proceed if we have valid items
                                if (validItems.length > 0) {
                                    // Make an actual network request so it shows in Network tab
                                    // Use simulateNetworkRequest instead of direct fetch to avoid 405 error
                                    self.simulateNetworkRequest('/api/cart/add', 'POST', {
                                        items: validItems.map((item) => ({
                                            variantId: item.variantId, // Use the actual variantId from product data
                                            quantity: item.quantity,
                                        })),
                                    }).catch(() => {
                                        // We handle both success and failure in the simulateNetworkRequest
                                    });

                                    // Update local storage
                                    localStorage.setItem(window.Cart.storageKey, JSON.stringify(updatedCart));

                                    // Update UI
                                    window.Cart.updateCartUI();

                                    // Show notification
                                    if (invalidItems.length > 0) {
                                        window.Cart.showNotification(
                                            `Some items were added to cart. ${invalidItems.length} invalid item(s) were ignored.`,
                                            'warning'
                                        );
                                    } else {
                                        window.Cart.showNotification('Items added to cart successfully!', 'success');
                                    }
                                } else if (invalidItems.length > 0) {
                                    // No valid items were found
                                    window.Cart.showNotification(
                                        'No items added to cart. All product IDs were invalid.',
                                        'error'
                                    );
                                }

                                // Create a proper Response object that conforms to the fetch API
                                const responseData = {
                                    status: validItems.length > 0 ? 'success' : 'error',
                                    added: validItems,
                                    invalidItems: invalidItems,
                                    cart: updatedCart,
                                };

                                // Resolve with a Response object
                                resolve(
                                    new Response(JSON.stringify(responseData), {
                                        status: 200,
                                        headers: { 'Content-Type': 'application/json' },
                                    })
                                );
                            })
                            .catch((error) => {
                                console.error('Error loading product data:', error);
                                // Resolve with an error response
                                resolve(
                                    new Response(
                                        JSON.stringify({
                                            status: 'error',
                                            message: 'Failed to load product data',
                                        }),
                                        {
                                            status: 500,
                                            headers: { 'Content-Type': 'application/json' },
                                        }
                                    )
                                );
                            });
                    } catch (e) {
                        console.error('Failed to parse request body:', e);
                        resolve(
                            new Response(
                                JSON.stringify({
                                    status: 'error',
                                    message: 'Invalid request format',
                                }),
                                {
                                    status: 400,
                                    headers: { 'Content-Type': 'application/json' },
                                }
                            )
                        );
                    }
                });
            } else {
                // If not a cart API call, use original fetch
                return originalFetch.apply(window, arguments);
            }
        };
    },

    // Placeholder for updateNetworkIndicator used by simulateNetworkRequest
    updateNetworkIndicator: function () {
        // Network indicator UI removed for cleaner dev experience
        // Network requests still work and show in Network tab
    },
};

export default CartNetwork;
