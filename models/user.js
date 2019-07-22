module.exports = (sequelize, DataTypes) => (
    sequelize.define('user', {
        email: {
            type: DataTypes.STRING(40),
            primaryKey: true
        },
        displayName: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        provider: {
            type: DataTypes.STRING(10),
            allowNull: true,
            defaultValue: 'local',
        },
        snsId: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);
