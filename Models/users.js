import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      birthday: {
        type: DataTypes.STRING,
        defaultValue: null,
      }
    },
    { timestamps: false }
  );
}