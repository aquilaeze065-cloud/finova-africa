const router = require("express").Router();

router.get("/team", async (req, res) => {
  res.json({ team: [] });
});

module.exports = router;
