const { Sequelize , DataTypes , Model, Deferrable } = require('sequelize');

// Creation of database link
const sequelize = new Sequelize ({
    dialect: 'sqlite',
    storage : "db.sqlite"
});

class User extends Model {}
User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    password:{
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {sequelize , modelName: 'users' });

class Email extends Model {}
Email.init({
    email: {
      type: DataTypes.TEXT,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: User,
        key: 'id'
      }
    },
}, { sequelize, modelName: 'emails' });

class Pseudo extends Model {}
Pseudo.init({
    pseudo: {
      type: DataTypes.TEXT,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: User,
        key: 'id'
      }
    },
}, { sequelize, modelName: 'pseudos' });


class Location extends Model {}
Location.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    street: {
        type: DataTypes.TEXT,
        allowNull:false
    },
    district: {
        type: DataTypes.TEXT,
        allowNull:false
    }
}, { sequelize, modelName: 'locations' });


class Accident extends Model {}
Accident.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull:false
    },
    locationId: {
        type: DataTypes.INTEGER,
        references: {
        model: Location,
        key: 'id'
        }
    }
}, { sequelize, modelName: 'accidents' });


class UserAccident extends Model {}
UserAccident.init({
    accId: {
            type: DataTypes.INTEGER,
            references: {
            model: Accident,
            key: 'id'
        },
        primaryKey:true,
    },
    userId: {
            type: DataTypes.INTEGER,
            references: {
            model: User,
            key: 'id'
        },
        primaryKey:true,
    }
}, { sequelize, modelName: 'user-accidents' });

/*User.create({
    pseudo: "Me",
    email: "this@gmail.com",
    name: "Sir Me",
    password: "GuessMe"
});

function AddUser(pseudo, email, name, password){
    User.create({
        pseudo: pseudo,
        email: email,
        name: name,
        password: password
    });

    sequelize.sync();
}*/

sequelize.sync();
