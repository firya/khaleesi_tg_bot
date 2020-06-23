import mysql from 'mysql2';

class DB {
  constructor() {
    this.connection = mysql.createConnection({
      host: "statibot_maksimlebedev_db",
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE,
      password: process.env.MYSQL_PASSWORD
    });

    this.connection.connect(function (err) {
      if (err) {
        return console.error("Ошибка: " + err.message);
      }
      else {
        console.log("Подключение к серверу MySQL успешно установлено");
      }
    });
  }

  query = (query) => {
    return new Promise((resolve, reject) => {
      this.connection.query(
        query,
        function (err, results, fields) {
          if (err) {
            reject(err);
          }

          resolve(results);
        }
      );
    });
  }
}

export default new DB();