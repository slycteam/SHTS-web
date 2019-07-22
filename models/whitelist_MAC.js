module.exports = (sequelize, DataTypes) => (
    sequelize.define('whitelist_MAC', {
        MAC: {
            type: DataTypes.STRING(20),
            primaryKey: true
        },
        desc: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);
