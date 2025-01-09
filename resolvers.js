
import {User} from './model/user';
import {Level, Coin, LevelList} from './model/level'

const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || "TRAJECTORY_TUNER_KEY";

const db = new sqlite3.Database('./var/ttuner.sqlite3');

function generateToken(user) {
    const payload = {
        userId: user.id,
        username: user.username
    };
    const options = {
        expiresIn: '24h'
    };
    const token = jwt.sign(payload, SECRET_KEY, options);
    return token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded;
    } catch (err) {
        return null;
    }
}

async function hashPassword(plainTextPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    return hashedPassword;
}

function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM users WHERE username=(?)", [username], (err, rows) => {
            if (err) {
                return reject(err);
            }
        
            if(rows && rows.length > 0) {
                const data = rows[0];

                let user = new User(data["ID"], data["username"], data["pass"], data["level"]);
                return resolve(user);
            }
            else {
                return resolve(null);
            }
        });
    });
}

function incrementLevel(user) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE users SET level = (?) WHERE username = (?)", [user.level_on + 1, user.username], (err) => {
            if(err) {
                return reject(err);
            }
            return resolve(null);
        });
    });
}

function registerUser(username, password) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM users WHERE username=(?)", [username], (err, rows) => {
            if(err) {
                return reject(err);
            }

            if(rows && rows.length > 0) {
                return reject(new Error("User account already exists"));
            }

            db.run("INSERT INTO users(username, pass) VALUES ( (?), (?))", [username, password], (err, rows) => {
                if(err) {
                    return reject(err);
                }
                return resolve(null);
            })
        })
    });
}

export var resolvers = {
    async register({username, password}) {
        try {
            await registerUser(username, await hashPassword(password));
            return await getUserByUsername(username);
        }
        catch(error) {
            return error;
        }
    },

    async login({username, password}) {
        const user_data = await getUserByUsername(username);
        if(await bcrypt.compare(password, user_data.password)) {
            return generateToken(user_data);
        }
        return new Error("Invalid username or password");
    },

    async getLevel({jwt, level}) {
        const payload = verifyToken(jwt);

        if(payload) {
            const user = await getUserByUsername(payload.username);
            if (user.level_on >= level) {
                return LevelList[level];
            }
        }
        return new Error("You do not have access to that");
    },

    async submitSolution({jwt, level, expression}) {
        const payload = verifyToken(jwt);

        if(payload) {
            const user = await getUserByUsername(payload.username);
            console.log(user);
            if (user.level_on >= level) {
                const level_data = LevelList[level];
                const result = level_data.checkWin(expression);
                if(result) {
                    if(user.level_on == level) {
                        await incrementLevel(user);
                    }
                }
                return result;
            }
        }
        return new Error("You do not have access to that");
    }
};