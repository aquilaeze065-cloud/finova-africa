const jwt = require("jsonwebtoken");
const SECRET       = process.env.JWT_SECRET       || "finova_secret_2024";
const ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || "finova_admin_2024";

module.exports = {
  signUser:    (p) => jwt.sign(p, SECRET,       { expiresIn: "30d" }),
  signAdmin:   (p) => jwt.sign(p, ADMIN_SECRET, { expiresIn: "8h"  }),
  verifyUser:  (t) => jwt.verify(t, SECRET),
  verifyAdmin: (t) => jwt.verify(t, ADMIN_SECRET),
};
