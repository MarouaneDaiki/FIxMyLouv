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
        type: DataTypes.TEXT,
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
    AddUser: async function(pseudo, email, name, password){ //TODO: check input type HASH PASSWORD
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

    LoginUser: async function(email, password){ //HASH PASSWORD
        const passwordFromEmail = await sequelize.query("SELECT password FROM users WHERE id = (SELECT userId FROM emails WHERE email = ?)", {replacements: [email], type: QueryTypes.SELECT});

        console.log(passwordFromEmail);
        console.log(passwordFromEmail[0]);

        if(typeof passwordFromEmail !== 'undefined' && typeof passwordFromEmail[0] !== 'undefined' && typeof passwordFromEmail[0]['password'] !== 'undefined'){
            if(passwordFromEmail[0]['password'] === password){
                return "LOGINED";
            }
        }

        console.log("HERE");
        return "Invalid email or password !";
    }, 

    AddAccident: async function(nb, street, district, desc, date, userID){//CHECK INFO
        let newLocation = await Location.create({
            number: nb,
            street: street,
            district: district
        });

        let newAccident = await Accident.create({
            date: date,
            description: desc,
            locationId: newLocation.id
        });

        UserAccident.create({
            accId: newAccident.id,
            userId: userID
        });

        sequelize.sync();
    },

    PrintInfo: function(pseudo, email, name, password){
        console.log("pseudo: " + pseudo + " email: " + email + " name: " + name + " password: " + password);
    }
}

module.exports = DBOperations

sequelize.sync();
