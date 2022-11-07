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
    GetNameById: async function(id){
        const nameFromId = await sequelize.query("SELECT name FROM users WHERE id = ?", {replacements: [id], type: QueryTypes.SELECT});

        if(typeof nameFromId !== 'undefined' && typeof nameFromId[0] !== 'undefined' && typeof nameFromId[0]['name'] !== 'undefined'){
            return nameFromId[0]["name"];
        }

        return "Connexion";
    },

    AddUser: async function(pseudo, email, name, password){ //TODO: HASH PASSWORD
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

        if(typeof passwordFromEmail !== 'undefined' && typeof passwordFromEmail[0] !== 'undefined' && typeof passwordFromEmail[0]['password'] !== 'undefined'){
            if(passwordFromEmail[0]['password'] === password){
                const IDuser = await sequelize.query("SELECT userId FROM emails WHERE email = ?", {replacements: [email], type: QueryTypes.SELECT});
                return IDuser[0]['userId'];
            }
        }

        return "Invalid email or password !";
    }, 

    AddAccident: async function(nb, street, district, desc, date, userID){
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

    GetAccidentInfoByID: async function(accID){
        const IDs = await sequelize.query("SELECT id FROM accidents");
        let allAccIDs = [IDs[0][0]["id"]]
        
        for (let i = 1; i < IDs.length; i++) {
            allAccIDs.push(IDs[0][i]["id"])
        }

        if(allAccIDs.includes(Number(accID))){ //id exists in db
            let accDate = await sequelize.query("SELECT date FROM accidents where id = ?", {replacements: [accID], type: QueryTypes.SELECT});
            let accDesc = await sequelize.query("SELECT description FROM accidents where id = ?", {replacements: [accID], type: QueryTypes.SELECT});
            let accLocationID = await sequelize.query("SELECT locationId FROM accidents where id = ?", {replacements: [accID], type: QueryTypes.SELECT});

            let accLocNB = await sequelize.query("SELECT number FROM locations WHERE id = ?", {replacements: [accLocationID[0]["locationId"]], type: QueryTypes.SELECT});
            let accLocStreet = await sequelize.query("SELECT street FROM locations WHERE id = ?", {replacements: [accLocationID[0]["locationId"]], type: QueryTypes.SELECT});
            let accLocDistrict = await sequelize.query("SELECT district FROM locations WHERE id = ?", {replacements: [accLocationID[0]["locationId"]], type: QueryTypes.SELECT});

            let accUserID = await sequelize.query("SELECT userId FROM 'user-accidents' WHERE accId = ?", {replacements: [accID], type: QueryTypes.SELECT});
            
            let accUserPseudo = await sequelize.query("SELECT  pseudo FROM pseudos WHERE userId = ?", {replacements: [accUserID[0]["userId"]], type: QueryTypes.SELECT});
            
            let accLocation =  `${accLocStreet[0]["street"]},${accLocNB[0]["number"]},${accLocDistrict[0]["district"]}`;

            let infos = [accDesc[0]["description"], accLocation, accUserPseudo[0]["pseudo"], accDate[0]["date"]];
            return infos;
        }
    },

    GetAllAccidentInfo: async function(){
        const IDs = await sequelize.query("SELECT id FROM accidents");
        let allAccIDReverse = [IDs[0][0]["id"]]
        
        for (let i = 1; i < IDs.length; i++) {
            allAccIDReverse.push(IDs[0][i]["id"])
        }

        let allInfos = [];
        for (let i = 0; i < allAccIDReverse.length; i++) {
            allInfos.push(this.GetAccidentInfoByID(allAccIDReverse[i]));
        }

        console.log(allInfos);
    },

    CheckEmail: function(email){
        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
          
        if (email.match(validRegex))        
            return true;
        return false;
    }
}

module.exports = DBOperations

sequelize.sync();
