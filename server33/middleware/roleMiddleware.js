const tokenService = require("../services/token.service");

module.exports = function (roles) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      return next();
    }

    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { roles: userRoles } = tokenService.validateAccess(token);
      let hasRole = false;
      userRoles.forEach((role) => {
        if (roles.includes(role)) {
          hasRole = true;
        }
      });
      if(!hasRole) {
        return res.status(401).json({ message: "Access denied" });
      }
      next();
    } catch (e) {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
};
