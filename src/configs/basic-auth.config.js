module.exports = {
  username: process.env.BASIC_AUTH_USERNAME
    ? process.env.BASIC_AUTH_USERNAME
    : 'admin',
  password: process.env.BASIC_AUTH_PASSWORD
    ? process.env.BASIC_AUTH_PASSWORD
    : 'password',
};
