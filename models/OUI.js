module.exports = (sequelize, DataTypes) => (
    sequelize.define('OUI', {
        manf_code: {
            type: DataTypes.STRING(8),
            primaryKey: true
        },
        manf_name: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        detail_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        timestamps: false,
        paranoid: false,
    })
);
