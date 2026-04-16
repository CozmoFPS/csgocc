const { db } = require("../services/db.service");

const Notification = db.define("notification", {
    'steamId': {
        type: db.Sequelize.STRING(64),
        allowNull: false,
        unique: false
    },
    'title': {
        type: db.Sequelize.TEXT,
        allowNull: false
    },
    'description': {
        type: db.Sequelize.TEXT,
        allowNull: true
    },
    'icon': {
        type: db.Sequelize.STRING,
        allowNull: true 
    },
    'url': {
        type: db.Sequelize.STRING,
        allowNull: true
    },
    'read': {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    'createdAt': 'created',
    'updatedAt': 'updated',
    'indexes': [ 
        {
            unique: false,
            fields: [
                {
                    name: 'steamId', order: 'ASC' 
                },
                {
                    name: 'read', order: 'ASC'
                },
                {
                    name: 'updated', order: 'DESC'
                }
            ]
        }
    ]
});

module.exports = Notification