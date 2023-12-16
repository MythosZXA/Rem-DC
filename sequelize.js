// sequelize				https://sequelize.org/

// enable environment variables
require('dotenv').config();
const fs = require('fs');
// connect to DB
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
	'sid39uidxq7spicc',														// db name
	'yo9w846giu5q1l1n',														// username
	process.env.sqlPassword, 											// password
	{
		host: 'pk1l4ihepirw9fob.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
		dialect: 'mysql',
		logging: false
	}
);

// import all the DB data into memory
const User = require('./Classes/User');
async function importDBToMemory() {
	const dir = './Models';
	const modelFiles = fs.readdirSync(dir);
	const remDB = new Map();
	for (const file of modelFiles) {
		const modelName = file.split('.')[0];
		const model = require(`./Models/${file}`)(sequelize, Sequelize.DataTypes);
		let tuplesArray;
		if (modelName === 'transactions') {
			tuplesArray = await model.findAll({ raw: true, order: [['date', 'DESC']] });
		} else {
			tuplesArray = await model.findAll({ raw: true });
		}

		switch (modelName) {
			case "users":
				let classUser = new Map();
				tuplesArray.forEach(tuple => {
					classUser.set(tuple.id, new User(tuple.id, tuple.username, tuple.birthday));
				});
				remDB.set(modelName, classUser);
				break;
			default:
				remDB.set(modelName, tuplesArray);
		}
	}

	return remDB;
}

// export all the memory data into DB
const PaliaGifts = require('./Models/palia_gifts')(sequelize, Sequelize.DataTypes);
const Timers = require('./Models/timers')(sequelize, Sequelize.DataTypes);
const Transactions = require('./Models/transactions')(sequelize, Sequelize.DataTypes);
const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);
async function exportMemoryToDB(rem) {
	// convert User class into array of obj to store in DB
	let users = [];
	rem.remDB.get('users').forEach(user => {
		users.push(user.toObj())
	});

	try {
		await PaliaGifts.bulkCreate(rem.remDB.get('palia_gifts'), { updateOnDuplicate: ['gifted', 'gift1', 'gift2', 'gift3', 'gift4'] });
		await Timers.bulkCreate(rem.remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });
		await Transactions.bulkCreate(rem.remDB.get('transactions'), { updateOnDuplicate: ['date', 'payer', 'payer', 'description'] });
		await Users.bulkCreate(users, { updateOnDuplicate: ['username', 'birthday'] });
		console.log('DB Saved');
	} catch (error) {
		console.log(error);
	}
}

function dropUser(userID) {
	try { Users.destroy({ where: { id: userID } }); }
	catch(error) { console.log(error); }
}

module.exports = {
	importDBToMemory,
	exportMemoryToDB,
	dropUser,
};