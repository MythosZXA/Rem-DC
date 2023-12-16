module.exports = (sequelize, DataTypes) => {
	return sequelize.define('transactions', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		date: {
			type: DataTypes.STRING,
			allowNull: false
		},
		payer: {
			type: DataTypes.STRING,
			allowNull: false
		},
		payee: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, 
	{
		timestamps: false
	});
};