// 导入数据库操作模块
const db = require("../db/index");
// 导入 bcryptjs 这个包  用于判断密码是否正确
const bcrypt = require("bcryptjs");
// 导入生成 Token 的包
const jwt = require("jsonwebtoken");
// 导入全局的配置文件   导入秘钥
const config = require("../config");

// 注册新用户的处理函数
exports.regUser = (req, res) => {
  // 获取客户端提交到服务器的用户信息
  const userinfo = req.body;
  // 对表单中的数据，进行合法性的校验
  // if (!userinfo.username || !userinfo.password) {
  //   return res.send({ status: 1, message: '用户名或密码不合法！' })
  // }

  // 定义 SQL 语句，查询用户名是否被占用
  const sqlStr = "select * from ev_users where username=?";
  db.query(sqlStr, userinfo.username, (err, results) => {
    // 执行 SQL 语句失败
    if (err) {
      // return res.send({ status: 1, message: err.message })
      return res.cc(err);
    }
    // 判断用户名是否被占用
    if (results.length > 0) {
      // return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
      return res.cc("用户名被占用，请更换其他用户名！");
    }
    // 调用 bcrypt.hashSync() 对密码进行加密
    userinfo.password = bcrypt.hashSync(userinfo.password, 10);
    // 定义插入新用户的 SQL 语句
    const sql = "insert into ev_users set ?";
    // 调用 db.query() 执行 SQL 语句
    db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
      // 判断 SQL 语句是否执行成功
      // if (err) return res.send({ status: 1, message: err.message })
      if (err) return res.cc(err);
      // 判断影响行数是否为 1
      // if (results.affectedRows !== 1) return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
      if (results.affectedRows !== 1) return res.cc("注册用户失败，请稍后再试！");
      // 注册用户成功
      // res.send({ status: 0, message: '注册成功！' })
      res.cc("注册成功！", 0);
    });
  });
};

// 登录的处理函数
exports.login = (req, res) => {
  // 接收表单的数据
  const userinfo = req.body;
  // 定义 SQL 语句
  const sql = `select * from ev_users where username=?`;
  // 执行 SQL 语句，根据用户名查询用户的信息
  db.query(sql, userinfo.username, (err, results) => {
    // 执行 SQL 语句失败
    if (err) return res.cc(err);
    console.log(results.length, "results");
    // 执行 SQL 语句成功，但是获取到的数据条数不等于 1
    if (results.length !== 1) return res.cc("登录失败！");

    // TODO：判断密码是否正确
		console.log(userinfo.password, results[0].password);
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password);
		if (!compareResult) return res.cc("登录失败！");
		console.log('登录成功')

    // TODO：在服务器端生成 Token 的字符串，
    // 清空用户的密码和头像对应的值，用空格代替
    const user = { ...results[0], password: "", user_pic: "" };
    // 对用户的信息进行加密，生成 Token 字符串    加密秘钥的值config.jwtSecretKey    加密时间expiresIn
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn });
    // 调用 res.send() 将 Token 响应给客户端
    res.send({
      status: 0,
      message: "登录成功！",
      // 加上前缀还有空格
      token: "Bearer " + tokenStr
    });
  });
};
