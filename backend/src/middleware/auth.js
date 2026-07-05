const { verifyUser, verifyAdmin } = require("../utils/jwt");

module.exports.authUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    req.user = verifyUser(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports.authAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    req.admin = verifyAdmin(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid admin token" });
  }
};
