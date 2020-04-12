const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
    });
    product
        .save()
        .then(result => {
            // console.log(result)
            console.log('Created a Product');
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findById(productId)
        // Product.findByPk(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                product: product
            });
        })
        .catch(err => {
            console.log(err)
        })
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;
    Product.findById(productId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.imageURL = updatedImageUrl;
        return product.save()
            .then(result => {
                console.log('UPDATED PRODUCT');
                res.redirect('/admin/products');
            })
    })
        .catch(err => console.log(err));

};

exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }).catch(err => {
        console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({'_id': productId, userId: req.user._id})
        .then(() => {
            console.log('Destroyed Product');
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err);
        });
};
