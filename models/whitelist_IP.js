module.exports = (sequelize, DataTypes) => (
    sequelize.define('whitelist_IP', {
        IP: {
            type: DataTypes.STRING(20),
            primaryKey: true
        },
        descr: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);
