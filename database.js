const { Sequelize , DataTypes , Model, QueryTypes } = require('sequelize');

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

const DBOperations = {
    AddUser: async function(pseudo, email, name, password){ //TODO: check input type
        //check unique email and pseudo
        const existingPseudos = await sequelize.query("SELECT COUNT(*) FROM pseudos WHERE pseudo = ?", {replacements: [pseudo], type: QueryTypes.SELECT})
        const existingEmails = await sequelize.query("SELECT COUNT(*) FROM emails WHERE email = ?", {replacements: [email], type: QueryTypes.SELECT})

        let amountPseudo = JSON.stringify(existingPseudos[0]).replace(/[^0-9]*/g, '');
        let amountEmail = JSON.stringify(existingEmails[0]).replace(/[^0-9]*/g, '');

        if(parseInt(amountPseudo) !== 0){
            return "Pseudo already used";
        }

        if(parseInt(amountEmail) !== 0){
            return "Email already used";
        }

        let newUser = await User.create({
            name: name,
            password: password
        });

        Email.create({
            email: email,
            userId: newUser.id
        });

        Pseudo.create({
            pseudo: pseudo,
            userId: newUser.id
        });

        sequelize.sync();
        return "Account created";
    },

    PrintInfo: function(pseudo, email, name, password){
        console.log("pseudo: " + pseudo + " email: " + email + " name: " + name + " password: " + password);
    }
}

module.exports = DBOperations

sequelize.sync();