const chai = require("chai");
const chaiHttp = require("chai-http");
let server = require("../server");
chai.should();
chai.use(chaiHttp);

const userData = {
  first_name: "test Abhiram",
  last_name: "test paidimarri",
  email: "testabhi@gmail.com",
  password: "testingpassword",
  role: "user",
};
const userLogin = {
  email: "testabhi@gmail.com",
  password: "testingpassword",
};
const userWrongEmail = {
  email: "testabhiram@gmail.com",
  password: "testingpassword",
};
const userWrongPassword = {
  email: "testabhi@gmail.com",
  password: "testingpasswordwrong",
};

describe("User APIs", () => {
  describe("SIGNIN/ user", () => {
    before("It should create new user", (done) => {
      chai
        .request(server)
        .post("/signup")
        .send(userData)
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("first_name");
          res.body.should.have.property("last_name");
          res.body.should.have.property("password");
          res.body.should.have.property("email");
          res.body.should.have.property("role");
          done();
        });
    });
    it("It should send error message as user is created already", (done) => {
      chai
        .request(server)
        .post("/signup")
        .send(userData)
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("LOGIN/ user", () => {
    it("It should login user", (done) => {
      chai
        .request(server)
        .post("/login")
        .send(userLogin)
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("accesstoken");
          res.body.should.have.property("refreshtoken");
          res.body.should.have.property("email");
          res.body.should.have.property("first_name");
          res.body.should.have.property("accesstoken");
          res.body.should.have.property("role");
          done();
        });
    });
    it("It should won't login user as email is wrong", (done) => {
      chai
        .request(server)
        .post("/login")
        .send(userWrongEmail)
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
    it("It should won't login user as password is wrong", (done) => {
      chai
        .request(server)
        .post("/login")
        .send(userWrongPassword)
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/DELETE/ user", () => {
    it("It should delete user", (done) => {
      chai
        .request(server)
        .delete("/deleteuser")
        .send({ email: userData.email })
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
  });
});
