const { db } = require("../services/db.service");

const IP = db.define("ip", {
    'id': {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    'ipHash': {
        type: db.Sequelize.STRING(64),
        allowNull: false
    },
    'ipEncrypted': {
        type: db.Sequelize.TEXT,
        allowNull: false
    },
    'steamId': {
        type: db.Sequelize.STRING(64),
        allowNull: false
    },
    'lastSeen': {
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
    }
}, {
    'createdAt': 'firstSeen',
    'updatedAt': false,
    'indexes': [
        {
            fields: [
                'steamId'
            ]
        },
        {
            unique: true,
            fields: [
                'ipHash',
                'steamId'
            ]
        },
        {
            fields: [
                'ipHash'
            ]
        },
        {
            fields: [
                'steamId',
                'lastSeen'
            ]
        }
    ]
});

module.exports = IP