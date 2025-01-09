export class User {
    constructor(id, username, password, level_on=0) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.level_on = level_on;
    }
};