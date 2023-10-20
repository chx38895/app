const isAuth = (req, res, next) => {
  if (req.session && req.session.userData) {
    next();
  } else {
    return;
  }
};

module.exports = isAuth;