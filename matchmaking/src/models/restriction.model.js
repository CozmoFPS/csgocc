const { db } = require("../services/db.service");

const Restriction = db.define("restriction", {
    'id': {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    'expires': {
        type: db.Sequelize.DATE,
        allowNull: true
    },
    'subject': {
        type: db.Sequelize.STRING(100), // format: 'ip/steamid/deviceid:(subject)'
        allowNull: false
    },
    'adminNote': {
        type: db.Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
    },
    'type': {
        type: db.Sequelize.ENUM('IPBan', 'DeviceBan', 'CheatingBan', 'MOSSReportPending', 'MOSSReportNeeded', 'GriefingBan', 'ToxicityBan', 'AbandonCooldown', 'TeamDamageCooldown'),
        allowNull: false
    },
}, {
    'createdAt': 'created',
    'indexes': [
        {
            'fields': [
                'expires'
            ],
        },
        {
            'fields': [
                'subject'
            ]
        },
        {
            'fields': [
                'subject',
                'type'
            ]
        },
    ]
});

module.exports = Restriction