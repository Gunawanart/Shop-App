const Sequelize = require('sequelize')
const sql = require('../util/database')

const Cart = sql.define('Cart', {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    }
})

module.exports = Cart
