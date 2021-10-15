const mysql = require("mysql");

var pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "1234",
  database: "my_db_01"
});
pool.getConnection(function (err, connection) {
  if (err) {
    console.log("建立连接失败");
  } else {
    console.log("建立连接成功");
    // console.log(pool._allConnections.length); //  1
    connection.query("select * from ev_users", function (err, rows) {
      if (err) {
        console.log("查询失败");
      } else {
        console.log(rows);
      }
      // connection.destory();
      // console.log(pool._allConnections.length); // 0
    });
  }
  // pool.end();
});

module.exports = pool;
