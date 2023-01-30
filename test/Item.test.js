const chai = require("chai");
const chaiHttp = require("chai-http");
let server = require("../server");

chai.should();
chai.use(chaiHttp);

const userLogin = {
  email: "testabhi@gmail.com",
  password: "testingpassword",
};

let token = "";

const item = {
  item_name: "ChiCKeN",
  quantity: 120,
  price: 200,
};

const updateItem = {
  item_name: "ChicKen",
  quantity: 10,
  price: 250,
};

const userData = {
  first_name: "test Abhiram",
  last_name: "test paidimarri",
  email: "testabhi@gmail.com",
  password: "testingpassword",
  role: "user",
};

describe("Items apis", () => {
  describe("/POST/ signup user", () => {
    it("creating user ", (done) => {
      chai
        .request(server)
        .post("/signup")
        .send(userData)
        .end((err, res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("email");
          done();
        });
    });
  });

  describe("/POST/ login user", () => {
    it("login user", (done) => {
      chai
        .request(server)
        .post("/login")
        .send(userLogin)
        .end((err, res) => {
          token = res.body.accesstoken;
          res.should.have.status(200);
          done();
        });
    });
  });

  describe("/POST/ Items", () => {
    it("it should add an item ", (done) => {
      chai
        .request(server)
        .post("/additem")
        .set("Authorization", `Bearer ${token}`)
        .send(item)
        .end((err, res) => {
          book_id = res.body._id;
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("item_name");
          res.body.should.have.property("price");
          res.body.should.have.property("quantity");
          done();
        });
    });
    it("it should throw error if item exist", (done) => {
      chai
        .request(server)
        .post("/additem")
        .set("Authorization", `Bearer ${token}`)
        .send(item)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/Update/ Item", () => {
    it("it should update an item ", (done) => {
      chai
        .request(server)
        .put("/updateItem/chicken")
        .set("Authorization", `Bearer ${token}`)
        .send(updateItem)
        .end((err, res) => {
          book_id = res.body._id;
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
    it("it should throw error if item doesnot exist", (done) => {
      chai
        .request(server)
        .put("/updateItem/chickens")
        .set("Authorization", `Bearer ${token}`)
        .send(item)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/GetItem/ Item", () => {
    it("it should get an item by name ", (done) => {
      chai
        .request(server)
        .get("/getItem/chicken")
        .set("Authorization", `Bearer ${token}`)

        .end((err, res) => {
          book_id = res.body._id;
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });
    it("it should throw error if item doesnot exist", (done) => {
      chai
        .request(server)
        .get("/getItem/chickens")
        .set("Authorization", `Bearer ${token}`)
        .send(item)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.should.have.property("message");
          done();
        });
    });
  });

  describe("/Delete/ Item", () => {
    it("it should delete an item by name ", (done) => {
      chai
        .request(server)
        .delete("/deleteItem/chicken")
        .set("Authorization", `Bearer ${token}`)

        .end((err, res) => {
          book_id = res.body._id;
          res.should.have.status(200);
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
