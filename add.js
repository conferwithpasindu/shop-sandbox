// Add item to cart through the fetch API
fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        items: [
            {
                quantity: 4,
                id: '123a',
            },
        ],
    }),
})
    .then((response) => response.json())
    .then((data) => {
        console.log('Item added to cart:', data);
    })
    .catch((error) => {
        console.error('Error adding to cart:', error);
    });
