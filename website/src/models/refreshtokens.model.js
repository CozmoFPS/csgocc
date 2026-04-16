const ms = require("../helpers/ms.helper");
const { db } = require("../services/db.service");

const RefreshToken = db.define("refreshtoken", {
    'token': {
        type: db.Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    'revoked': {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    'identifier': {
        type: db.Sequelize.STRING,
        allowNull: false,
    },
    'expires': {
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(Date.now() + 2592000000)
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

module.exports = RefreshToken