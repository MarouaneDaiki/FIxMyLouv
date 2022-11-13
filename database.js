const { Sequelize, DataTypes, Model, QueryTypes } = require('sequelize');
const crypto = require('crypto')

// Creation of database link
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: "db.sqlite"
});

class User extends Model { }
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
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { sequelize, modelName: 'users' });

class Email extends Model { }
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

class Pseudo extends Model { }
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


class Location extends Model { }
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
        allowNull: false
    },
    district: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { sequelize, modelName: 'locations' });


class Accident extends Model { }
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
        allowNull: false
    },
    locationId: {
        type: DataTypes.INTEGER,
        references: {
            model: Location,
            key: 'id'
        }
    }
}, { sequelize, modelName: 'accidents' });


class UserAccident extends Model { }
UserAccident.init({
    accId: {
        type: DataTypes.INTEGER,
        references: {
            model: Accident,
            key: 'id'
        },
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        primaryKey: true,
    }
}, { sequelize, modelName: 'user-accidents' });


async function sha256(message) {
    const hash = crypto.createHash('sha256').update(message).digest('hex');
    return hash
}

const DBOperations = {
    GetNameById: async function (id) {
        const nameFromId = await sequelize.query("SELECT name FROM users WHERE id = ?", { replacements: [id], type: QueryTypes.SELECT });

        if (typeof nameFromId !== 'undefined' && typeof nameFromId[0] !== 'undefined' && typeof nameFromId[0]['name'] !== 'undefined') {
            return nameFromId[0]["name"];
        }

        return "Connexion";
    },

    AddUser: async function (pseudo, email, name, password) {
        //check unique email and pseudo
        const existingPseudos = await sequelize.query("SELECT COUNT(*) FROM pseudos WHERE pseudo = ?", { replacements: [pseudo], type: QueryTypes.SELECT })
        const existingEmails = await sequelize.query("SELECT COUNT(*) FROM emails WHERE email = ?", { replacements: [email], type: QueryTypes.SELECT })

        let amountPseudo = JSON.stringify(existingPseudos[0]).replace(/[^0-9]*/g, '');
        let amountEmail = JSON.stringify(existingEmails[0]).replace(/[^0-9]*/g, '');

        if (parseInt(amountPseudo) !== 0) {
            return "Pseudo already used";
        }

        if (parseInt(amountEmail) !== 0) {
            return "Email already used";
        }

        let newUser = await User.create({
            name: name,
            password: await sha256(password)
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
        return newUser.id;
    },

    LoginUser: async function (email, password) {
        const passwordFromEmail = await sequelize.query("SELECT password FROM users WHERE id = (SELECT userId FROM emails WHERE email = ?)", { replacements: [email], type: QueryTypes.SELECT });

        if (typeof passwordFromEmail !== 'undefined' && typeof passwordFromEmail[0] !== 'undefined' && typeof passwordFromEmail[0]['password'] !== 'undefined') {
            if (passwordFromEmail[0]['password'] === await sha256(password)) {
                const IDuser = await sequelize.query("SELECT userId FROM emails WHERE email = ?", { replacements: [email], type: QueryTypes.SELECT });
                return IDuser[0]['userId'];
            }
        }
        return -1;
    },

    AddAccident: async function (nb, street, district, desc, date, userID) {
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

    /*GetAccidentInfoByID: async function (accID) {
        const IDs = await sequelize.query("SELECT id FROM accidents");
        let allAccIDs = [IDs[0][0]["id"]]

        for (let i = 1; i < IDs.length; i++) {
            allAccIDs.push(IDs[0][i]["id"])
        }

        if (allAccIDs.includes(Number(accID))) { //id exists in db
            let accDate = await sequelize.query("SELECT date FROM accidents where id = ?", { replacements: [accID], type: QueryTypes.SELECT });
            let accDesc = await sequelize.query("SELECT description FROM accidents where id = ?", { replacements: [accID], type: QueryTypes.SELECT });
            let accLocationID = await sequelize.query("SELECT locationId FROM accidents where id = ?", { replacements: [accID], type: QueryTypes.SELECT });

            let accLocNB = await sequelize.query("SELECT number FROM locations WHERE id = ?", { replacements: [accLocationID[0]["locationId"]], type: QueryTypes.SELECT });
            let accLocStreet = await sequelize.query("SELECT street FROM locations WHERE id = ?", { replacements: [accLocationID[0]["locationId"]], type: QueryTypes.SELECT });
            let accLocDistrict = await sequelize.query("SELECT district FROM locations WHERE id = ?", { replacements: [accLocationID[0]["locationId"]], type: QueryTypes.SELECT });

            let accUserID = await sequelize.query("SELECT userId FROM 'user-accidents' WHERE accId = ?", { replacements: [accID], type: QueryTypes.SELECT });

            let accUserPseudo = await sequelize.query("SELECT  pseudo FROM pseudos WHERE userId = ?", { replacements: [accUserID[0]["userId"]], type: QueryTypes.SELECT });

            let accLocation = `${accLocStreet[0]["street"]},${accLocNB[0]["number"]},${accLocDistrict[0]["district"]}`;

            let infos = { description: accDesc[0]["description"], location: accLocation, user: accUserPseudo[0]["pseudo"], date: accDate[0]["date"] };
            return infos;
        }
    },*/

    GetLocationInfo: async function (locationId) {
        let accLocNB = await sequelize.query("SELECT number FROM locations WHERE id = ?", { replacements: [locationId], type: QueryTypes.SELECT });
        let accLocStreet = await sequelize.query("SELECT street FROM locations WHERE id = ?", { replacements: [locationId], type: QueryTypes.SELECT });
        let accLocDistrict = await sequelize.query("SELECT district FROM locations WHERE id = ?", { replacements: [locationId], type: QueryTypes.SELECT });

        let accLocationInfo = `${accLocStreet[0]["street"]},${accLocNB[0]["number"]},${accLocDistrict[0]["district"]}`;

        return accLocationInfo
    },

    GetUserFromAccidentId: async function (accID) {
        let accUserID = await sequelize.query("SELECT userId FROM 'user-accidents' WHERE accId = ?", { replacements: [accID], type: QueryTypes.SELECT });
        let accUserPseudo = await sequelize.query("SELECT pseudo FROM 'pseudos' WHERE userId = ?", { replacements: [accUserID[0]["userId"]], type: QueryTypes.SELECT });
        return accUserPseudo[0]["pseudo"]
    },

    GetAllAccidentInfo: async function () {
        const accidentsList = await Accident.findAll();

        let allInfos = [];
        for (const accident of accidentsList) {
            const accidentInfo = accident.dataValues

            const date = accidentInfo.date
            const description = accidentInfo.description
            const user = await this.GetUserFromAccidentId(accidentInfo.id)
            const location = await this.GetLocationInfo(accidentInfo.id)

            let info = { description: description, location: location, user: user, date: date };
            allInfos.push(info)
        };
        return allInfos.reverse();
    },

    GetAccInfoFromSearchBar: async function(location) {
        let allInfos = [];

        let fromDesc = await sequelize.query("SELECT id, date, description FROM accidents WHERE description like ?", { replacements:[location], type: QueryTypes.SELECT });
        
        for(const currentID of fromDesc) {
            let desc = currentID["description"];
            let location = await this.GetLocationInfo(currentID["id"]);
            let user = await this.GetUserFromAccidentId(currentID["id"]);
            let date = currentID["date"];

            let info = { description: desc, location: location, user: user, date: date };
            if(!allInfos.includes(info)) {
                allInfos.push(info);
            } 
        }

        let fromDistrict = await sequelize.query("SELECT id FROM locations WHERE district like ?", { replacements:[location], type: QueryTypes.SELECT });
        
        for(const currentLocID of fromDistrict) {
            let accID = await sequelize.query("SELECT id, date, description FROM accidents WHERE locationId = ?", { replacements:[currentLocID["id"]], type: QueryTypes.SELECT });
            
            const desc = accID[0]["description"];
            const location = await this.GetLocationInfo(currentLocID["id"]);
            const user = await this.GetUserFromAccidentId(accID[0]["id"]);
            const date = accID[0]["date"];   

            let info = { description: desc, location: location, user: user, date: date };
            if(!allInfos.includes(info)) {
                allInfos.push(info);
            } 
        }

        let fromStreet = await sequelize.query("SELECT id FROM locations WHERE street like ?", { replacements:[location], type: QueryTypes.SELECT });
        
        for(const currentLocID of fromStreet) {
            let accID = await sequelize.query("SELECT id, date, description FROM accidents WHERE locationId = ?", { replacements:[currentLocID["id"]], type: QueryTypes.SELECT });
            
            const desc = accID[0]["description"];
            const location = await this.GetLocationInfo(currentLocID["id"]);
            const user = await this.GetUserFromAccidentId(accID[0]["id"]);
            const date = accID[0]["date"];   

            let info = { description: desc, location: location, user: user, date: date };
            if(!allInfos.includes(info)) {
                allInfos.push(info);
            } 
        }
        
        return allInfos;
    },

    CheckEmail: function (email) {
        // Voir https://stackoverflow.com/a/9204568
        return email.match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/');
    }
}

module.exports = DBOperations

sequelize.sync();
