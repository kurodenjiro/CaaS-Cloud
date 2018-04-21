var mysql = require('mysql');
class MySQL {
  constructor() {
    this.con = mysql.createConnection({
      host: "159.89.234.84",
      user: "pavi",
      password: "csc547",
      database: "csc547caas"
    });
  }
}

module.exports = MySQL;
