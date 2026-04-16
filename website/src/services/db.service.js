require("dotenv").config()
require('pg')
const { Sequelize } = require('sequelize');
const configDb = require('../configs/db.config');

/*
const db = 
process.env.MODE == "DEV" ? 
new Sequelize(
    configDb.database,
    configDb.username,
    configDb.password,
    {
        host: configDb.host,
        port: configDb.port,
        dialect: 'postgres',
        logging: false,
        ssl: false,
    }
) :
 new Sequelize(configDb.host, {
    'dialect': 'postgres',
    'dialectOptions': {
        'ssl': {
            'require': false,
            'rejectUnauthorized': false,
        }
    },
    'logging': false,
});
*/

/*
const db = new Sequelize(
    configDb.database,
    configDb.username,
    configDb.password,
    {
        host: configDb.host,
        port: configDb.port,
        dialect: 'mysql',
        logging: false,
        ssl: false
        //ssl: process.env.MODE == 'PROD',
    }
)
*/

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