const CartUtils = {
    showNotification: function (message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
    },
};

export default CartUtils;
