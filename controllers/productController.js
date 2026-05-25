/* eslint-env node */




var fs = require('fs');
var mime = require('mime');
var multer = require('multer');
var path = require('path');


// -----






var Product = require('../models/product');

// Display list of all Products.
exports.product_list = function (req, res) {
    Product.find({})
        //.populate('categories')
        .exec(function (err, list_products) {
            if (err) {
                throw err;
            }
            //Successful, so render
            res.render('shop', {
                products: list_products
            });
            //res.send(list_products);
        });
};

exports.product_edit = function (req, res) {
    Product.find({})
        //.populate('categories')
        .exec(function (err, list_products) {
            if (err) {
                throw err;
            }
            //Successful, so render
            res.render('edit-products', {
                products: list_products
            });
            //res.send(list_products);
        });
};

// Display detail page for a specific Product.
exports.product_detail = function (req, res) {
    Product.findById(req.params.id)
        //.populate('categories')
        .exec(function (err, product) {
            if (err) {
                throw err;
            }
            //Successful, so render
            //console.log(product)
            res.send(product);
            //res.send(list_products);
        });
    //res.send('NOT IMPLEMENTED: Product detail: ' + String(req.params.id));
};


// Handle Product create on POST.
exports.product_create_post = function (req, res) {
    // Create a Book object with escaped and trimmed data.
    var product = new Product({});


    var storage = multer.diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
            cb(null, product._id + '.' + mime.getExtension(file.mimetype));
        }
    });

    var upload = multer({
        storage: storage
    }).any();


    upload(req, res, function (err) {
        if (err) {
            throw err;
        } else {
            product.name = req.body.product_name;
            product.description = req.body.product_description;
            product.cost = req.body.product_cost;

            if (req.files && req.files.length > 0) {
                product.image.data = fs.readFileSync(req.files[0].path);
                product.image.contentType = req.files[0].mimetype;
            }

            product.save(function (err) {
                if (err) {
                    throw err;
                }
                res.redirect('/dashboard/products');

                if (req.files && req.files.length > 0) {
                    fs.unlink(req.files[0].path, function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            });
        }
    });

    /*

    */

    //console.log(req.body);
    //res.send('request recieved for product' + product.name);
};


// Handle Product delete on POST.
exports.product_delete_post = function (req, res) {
    Product.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            throw err;
        }
        // Success - go to author list
        res.redirect('/dashboard/products');
    });

    //es.send('NOT IMPLEMENTED: Product delete POST');
};


// Handle Product update on POST.
exports.product_update_post = function (req, res) {
    var product = new Product();


    var storage = multer.diskStorage({
        destination: './www/catalog/product',
        filename: function (req, file, cb) {

            cb(null, req.params.id + '.' + mime.getExtension(file.mimetype));
        }
    });

    var upload = multer({
        storage: storage
    }).any();

    upload(req, res, function (err) {
        if (err) {
            throw err;
        } else {
            product.name = req.body.product_name;
            product.description = req.body.product_description;
            product.cost = req.body.product_cost;
            product._id = req.params.id;

            if (req.files && req.files.length > 0) {
                product.imagetype = mime.getExtension(req.files[0].mimetype);
                product.image = {
                    data: fs.readFileSync(req.files[0].path),
                    contentType: req.files[0].mimetype
                };
            }

            Product.findByIdAndUpdate(req.params.id, product, {}, function (err) {
                if (err) {
                    throw err;
                }
                res.redirect('/dashboard/products');

                if (req.files && req.files.length > 0) {
                    fs.unlink(req.files[0].path, function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            });
        }
    });

};




// Display detail image for a specific Enquiry.
exports.product_image_get = function (req, res) {
    Product.findById(req.params.id)
        .exec(function (err, product) {
            if (err) {
                throw err;
            }

            if (product && product.image && product.image.data && product.image.data.length > 0) {
                res.contentType(product.image.contentType || 'image/png');
                res.send(product.image.data);
            } else {
                res.sendFile(path.join(__dirname, '../www/images/background1.jpg'));
            }
        });
};
