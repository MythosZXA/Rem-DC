module.exports = (sequelize, DataTypes) => {
	return sequelize.define('palia_gifts', {
		user_id: {
			type: DataTypes.STRING,
      primaryKey: true,
			allowNull: false
		},
		villager_id: {
			type: DataTypes.INTEGER,
      primaryKey: true,
			allowNull: false
		},
		gifted: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		gift1: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		gift2: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		gift3: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		gift4: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0
		}
	}, 
	{
		timestamps: false
	});
};