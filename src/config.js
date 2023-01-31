var saltRounds = 10;

var constant = {
  //Http status codes
  HTTP_404_CODE: 404,
  HTTP_403_CODE: 403,
  HTTP_401_CODE: 401,
  HTTP_400_CODE: 400,
  HTTP_409_CODE: 409,
  HTTP_201_CODE: 201,
  HTTP_200_CODE: 200,
  HTTP_500_CODE: 500,
  HTTP_498_CODE: 498,
  HTTP_499_CODE: 499,
};

var expiration_time = "10000s";

module.exports = { saltRounds, constant, expiration_time };
