const { db } = require("../services/db.service");

const SteamData = db.define("steamdata", {
    'steamId': {
        type: db.Sequelize.STRING(64),
        primaryKey: true,
        autoIncrement: false
    },
    'customSteamId': {
        type: db.Sequelize.STRING(64),
        allowNull: true,
        defaultValue: null
    },
    'avatarURL': {
        type: db.Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
    },
    'nickname': {
        type: db.Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
    },
    'expires': {
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(Date.now() + (604800000 * 2)) // 2 weeks
    }
}, {
    'createdAt': 'created',
    'indexes': [
        {
            'fields': [
                'steamId',
                'expires'
            ]
        },
        {
            'fields': [
                'expires'
            ]
        },
        {
            'fields': [
                'customSteamId',
                'expires'
            ]
        }
    ]
});

module.exports = SteamData