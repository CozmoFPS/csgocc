require("dotenv").config()
const { Sequelize } = require('sequelize');
const configDb = require('../configs/db.config');

let dbUseSSL = process.env.MODE == 'PROD' && (configDb.host != '127.0.0.1' && configDb.host != 'localhost')
console.log('DB using SSL: ', dbUseSSL)
console.log('DB config: ', configDb)

const db = new Sequelize({
    username: configDb.username,
    database: configDb.database,
    port: configDb.port || 3306,
    password: configDb.password,
    dialect: 'mysql',
    host: configDb.host,
    ssl: dbUseSSL,
    logging: false
})

module.exports = { db }