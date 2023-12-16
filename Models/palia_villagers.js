module.exports = (sequelize, DataTypes) => {
	return sequelize.define('palia_villagers', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		image_url: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, 
	{
		timestamps: false
	});
};