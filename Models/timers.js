module.exports = (sequelize, DataTypes) => {
	return sequelize.define('timers', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		expiration_time: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		message: {
			type: DataTypes.STRING,
		},
		user_id: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, 
	{
		timestamps: false
	});
};