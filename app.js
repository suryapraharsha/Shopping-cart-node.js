const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const app = express();
//setting view engine as ejs 
app.set('view engine', 'ejs');
app.set('views', 'views');

//importing routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
//importing models 
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    User.findByPk(1)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  });
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);


//defining relations between the tables 
Product.belongsTo(User , {constraints : true,onDelete : 'CASCADE'});
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product,{through : CartItem});
Product.belongsToMany(Cart,{through : CartItem});

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product,{through : OrderItem});

sequelize
//.sync({force : true}) // this forcing is only done in development 
.sync()
.then(result =>{
    return User.findByPk(1);

}).then(user=>{
    if(!user){
        User.create({name : 'surya',email : 'suryapraharsha@gmail.com'});      
    }
    return user;
    }).then(user=>{
        return user.createCart();
        //console.log(user);
        
    }).then(cart=>{
        app.listen(3000);
    })
.catch(err=>{
    console.log(err);

});

