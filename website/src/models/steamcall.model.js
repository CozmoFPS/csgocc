const { db } = require("../services/db.service");

const SteamCall = db.define("steamcall", {
    'expires': {
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(Date.now() + (259200000 / 3)) // 1 day
    },
    'description': {
        type: db.Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
    }
}, {
    'createdAt': 'created',
    'indexes': [
        {
            'fields': [
                'expires'
            ]
        }
    ]
});

module.exports = SteamCall