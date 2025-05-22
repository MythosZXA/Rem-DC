// sequelize				https://sequelize.org/

import 'dotenv/config';
import fs from 'fs';
// eslint-disable-next-line no-unused-vars
import { INET } from 'sequelize';

// connect to DB
import { Sequelize } from 'sequelize';
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
import User from './Classes/User.js';
export async function importDBToMemory() {
  const modelFiles = fs.readdirSync('./Models');
  const remDB = new Map();
  for (const fileName of modelFiles) {
    const modelConstructor = (await import(`./Models/${fileName}`)).default;
    const modelName = fileName.split('.')[0];
    const model = modelConstructor(sequelize);

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
import TimersModule from './Models/timers.js';
import TransactionsModule from './Models/transactions.js';
import UsersModule from './Models/users.js';
export const Timers = TimersModule(sequelize);
export const Transactions = TransactionsModule(sequelize);
export const Users = UsersModule(sequelize);
export async function exportMemoryToDB(rem) {
  // convert User class into array of obj to store in DB
  let users = [];
  rem.remDB.get('users').forEach(user => {
    users.push(user.toObj())
  });

  try {
    await Timers.bulkCreate(rem.remDB.get('timers'), { updateOnDuplicate: ['expiration_time', 'message', 'user_id'] });
    await Transactions.bulkCreate(rem.remDB.get('transactions'), { updateOnDuplicate: ['date', 'payer', 'payer', 'description'] });
    await Users.bulkCreate(users, { updateOnDuplicate: ['username', 'birthday'] });
    console.log('DB Saved');
  } catch (error) {
    console.log(error);
  }
}

export function dropUser(userID) {
  try { Users.destroy({ where: { id: userID } }); }
  catch(error) { console.log(error); }
}