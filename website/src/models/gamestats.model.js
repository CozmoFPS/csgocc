const { db } = require("../services/db.service");

const Gamestats = db.define("gamestat", {
    'steamId': {
        type: db.Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false
    },
    'elo': {
        type: db.Sequelize.INTEGER,
        allowNull: true 
    },
    'wins': {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    'losses': {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0 
    },
    'total': {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    'kd': {
        type: db.Sequelize.FLOAT,
        allowNull: true
    },
    'kr': {
        type: db.Sequelize.FLOAT,
        allowNull: true
    },
    'hs': {
        type: db.Sequelize.FLOAT,
        allowNull: true
    },
    'adr': {
        type: db.Sequelize.FLOAT,
        allowNull: true
    },
    'lowestElo': {
        type: db.Sequelize.INTEGER,
        allowNull: true
    },
    'highestElo': {
        type: db.Sequelize.INTEGER,
        allowNull: true
    },
    'winStreak': {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    'highestWinStreak': {
        type: db.Sequelize.INTEGER,
        allowNull: true
    },
}, {
    'createdAt': 'created',
    'updatedAt': 'updated',
    'indexes': [ 
        
    ]
});

module.exports = Gamestats