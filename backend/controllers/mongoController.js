const mongoClient = require("./mongoConnect");
const _client = mongoClient.connect();

const Users = {
  login: async (loginInfo) => {
    const client = await _client;
    const db = client.db("login").collection("users");
    const findUser = await db.findOne({ email: loginInfo.email });
    if (findUser) {
      if (findUser.password === loginInfo.password) {
        return {
          result: true,
          email: findUser.email,
          msg: "로그인 성공!",
        };
      } else {
        return {
          result: false,
          msg: "비밀 번호가 다릅니다!",
        };
      }
    } else {
      return {
        result: false,
        msg: "해당 Email 을 찾을 수 없습니다!",
      };
    }
  },
  register: async (registerInfo) => {
    const client = await _client;
    const db = client.db("login").collection("users");
    const duplicated = await db.findOne({ email: registerInfo.email });
    if (!duplicated) {
      const registerUser = {
        type: registerInfo.type,
        email: registerInfo.email,
      };

      const registerResult = await db.insertOne(registerUser);

      if (registerResult.acknowledged) {
        return {
          duplicated: false,
          msg: "회원 가입 완료!",
        };
      } else {
        throw new Error("DB 문제 발생");
      }
    } else {
      return {
        duplicated: true,
        msg: "이미 가입 된 회원입니다!",
      };
    }
  },
};

module.exports = Users;
