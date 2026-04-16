const { db } = require("../services/db.service");

const Agreement = db.define("agreement", {
    'id': {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    'steamId': {
        type: db.Sequelize.STRING(64),
        allowNull: false
    },
    'active': {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    'createdAt': 'created',
    'indexes': [
        {
            'fields': [
                'steamId'
            ]
        }
    ]
});

module.exports = Agreement