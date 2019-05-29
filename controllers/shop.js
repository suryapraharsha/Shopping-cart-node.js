const Product = require('../models/product');
const Cart = require('../models/cart');//dont need
const Order = require('../models/order');//dont need 


exports.getProducts = (req, res, next) => {
  Product.findAll().then((products)=>{
    //console.log(fieldData);
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All products',
      path: '/products'
    });
  }).catch(err=>{
    console.log(err);

  });
    

};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findByPk(prodId)
  // .then((product)=>{
  //   res.render('shop/product-detail', {
  //     product: product,
  //     pageTitle: product.title,
  //     path: '/products'
  //   });
  // })
  Product.findAll({
    where : {
      id : prodId
    }
  }).then(product=>{
    res.render('shop/product-detail', {
          product: product[0],
          pageTitle: product[0].title,
          path: '/products'
        });
  })
  .catch(err=>{
    console.log(err);
  });

    

};

exports.getIndex = (req, res, next) => {
  Product.findAll()//sequelize method for Product model 
  .then((products)=>{
    //console.log(fieldData);
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });

  })
  .catch(err=>{
    console.log(err);

  });

  
};

exports.getCart = (req, res, next) => {

  req.user
  .getCart()
  .then(cart=>{
      return cart.getProducts().then(products=>{
      res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products
          })
  })
  .catch(err=>{
    console.log(err);
  });
  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         prod => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   });
   });


  };

  exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user
      .getCart()
      .then(cart => {
        fetchedCart = cart;
        // console.log(cart);
        // cart {
        //   dataValues:
        //            { id: 1, createdAt: 2019-05-28T22:34:11.000Z,updatedAt: 2019-05-28T22:34:11.000Z,userId: 1 }
        
        return cart.getProducts({ where: { id: prodId } }); //return a promise 
      })
      .then(products => {
              let product;
              

              if (products.length > 0) {
                product = products[0];
                //console.log('product is ',product);
                //product is  product {
                    // dataValues:
                    // { id: 1,
                    //   title: 'surya ',
                    //   price: 200,
                    //   imageUrl:
                    //   'https://maas.museum/app/uploads/2015/09/leonardo-da-vinci-the-codex-leicester-book-cover.jpg',
                    //   description: 'afd',
                    //   createdAt: 2019-05-28T22:30:06.000Z,
                    //   updatedAt: 2019-05-28T22:30:06.000Z,
                    //   userId: 1,
                    //   cartItem:
                    //   cartItem {
                    //     dataValues: [Object],
                    //     _previousDataValues: [Object],
                    //     _changed: {},
                    //     _modelOptions: [Object],
                    //     _options: [Object],
                    //     isNewRecord: false } },
              }
              
              if (product) {
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
              }
              return Product.findByPk(prodId);
      })
        .then(product => {

          return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity }
          });
        })
      .then(() => {
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
  };

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user //always request a user first
  .getCart()
  .then(cart=>{
    return cart.getProducts({where : {id : prodId}});
  }).then(products=>{
    const product = products[0];
    console.log('products are ',product); 
    // products are  [ product {
    //   dataValues:
    //    { id: 2,
    //      title: 'second book',
    //      price: 12,
    //      imageUrl:
    //       'https://cdn.vox-cdn.com/thumbor/J6XXXTlyLcBtViC6c1OVi8oJGtA=/0x0:2000x3000/1200x800/filters:focal(757x510:1077x830)/cdn.vox-cdn.com/uploads/chorus_image/image/51096913/90957259.0.jpg',
    //      description: 'afa',
    //      createdAt: 2019-05-28T22:30:15.000Z,
    //      updatedAt: 2019-05-28T22:30:15.000Z,
    //      userId: 1,
    //      cartItem: [cartItem] }
    return product.cartItem.destroy();
  }).then((result)=>{
    res.redirect('/cart');
  })

  .catch(err =>{
    console.log(err);
  });

 
};
exports.postOrder =(req,res,next)=>{
  let fetchedCart;

  req.user
  .getCart()
  .then(cart=>{
    //console.log('cart is ',cart);
    fetchedCart = cart ;

    return cart.getProducts();
    })
    .then(products=>{
    //console.log(products); // logs output like product{ {id :1 ,title : ...,cartItem : Object of cartItem},{id : 2, title : ,.... ,cartItem, Object}} which are in the cart 
      return req.user.
          createOrder()
          .then(order=>{
            return order.addProducts(
              products.map(product=>{
                product.OrderItem={ quantity: product.cartItem.quantity};
                return product;
              })
            );
          })
          .catch(err=>{console.log(err);});
  })

  .then(result=>{
    return fetchedCart.setProducts(null);
    
  }).then(result=>{
    res.redirect('/orders');
  })
  .catch(err=>{console.log(err);});


}
exports.getOrders = (req, res, next) => {
  req.user
  .getOrders({include : ['products']})
  .then(orders=>{
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'orders',
      orders : orders
    });

  })
  .catch(err=>{
    console.log(err);
  });
  
};

