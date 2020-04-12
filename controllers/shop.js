const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products'
            });
        }).catch(err => {
        console.log(err)
    });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    }).catch(err => {
        console.log(err)
    });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products
            })
        })
        .catch(err => console.log(err))
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId).then(product => {
        return req.user.addToCart(product)
    })
        .then(() => res.redirect('/cart'))
    // let fetchedCart;
    // let newQuantity = 1;
    // req.user.getCart()
    //     .then(cart => {
    //         fetchedCart = cart;
    //         return cart.getProducts({where: {id: productId}})
    //     })
    //     .then(products => {
    //         let product;
    //         if (products.length > 0) {
    //             product = products[0];
    //         }
    //         // if product already exists
    //         if (product) {
    //             const oldQuantity = product.cartItem.quantity;
    //             newQuantity += 1;
    //             return product
    //         }
    //         return Product.findByPk(productId)
    //     })
    //     .then(product => {
    //         return fetchedCart.addProduct(product, {
    //             through: {quantity: newQuantity}
    //         });
    //     })
    //     .then(() => {
    //         res.redirect('/cart')
    //     })
    //     .catch(err => console.log(err))
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user
        .removeFromCart(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {quantity: item.quantity, product: {...item.productId._doc}}
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(err => console.log(err))
};

exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders
            })
        }).catch(err => console.log(err));

};
