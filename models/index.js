const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize({
    dialect: config.dialect,
    storage: config.storage,
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);

// db.User.hasMany(db.Post);
// db.Post.belongsTo(db.User);
// db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'});
// db.Hashtag.belongsToMany(db.Post, {through: 'PostHashtag'});
// db.User.belongsToMany(db.User, {
//     foreignKey: 'followingId',
//     as: 'Followers',
//     through: 'Follow',
// });
// db.User.belongsToMany(db.User, {
//     foreignKey: 'followerId',
//     as: 'Followings',
//     through: 'Follow',
// });

module.exports = db;
