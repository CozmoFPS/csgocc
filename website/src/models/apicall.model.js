const { db } = require("../services/db.service");

const APICall = db.define("apicall", {
    'id': {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    'endpoint': {
        type: db.Sequelize.STRING(64),
        allowNull: false,
    },
    'method': {
        type: db.Sequelize.STRING(64),
        allowNull: true,
        defaultValue: null
    },
    'identifier': {
        type: db.Sequelize.STRING(64),
        allowNull: true,
        defaultValue: null
    },
    'expires': {
        type: db.Sequelize.DATE,
        allowNull: false,
    }
}, {
    'createdAt': 'created',
    'indexes': [
        {
            'unique': false,
            'fields': [
                'identifier',
                'endpoint',
                'method'
            ]
        },
        {
            'unique': false,
            'fields': [
                'expires'
            ]
        }
    ]
});

module.exports = APICall