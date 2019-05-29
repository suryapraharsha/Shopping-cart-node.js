const Sequelize = require('sequelize'); // for the type definitions

const sequelize = require('../util/database'); // for defining a product 

const User = sequelize.define('user',{
    id  : {
        type : Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true     
    },
    name :{
        type : Sequelize.STRING,
        allowNull : false,

    },
    email :{
        type :  Sequelize.STRING,
        allowNull : false
    }
    
    

});

module.exports  = User;