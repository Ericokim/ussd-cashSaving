const express = require("express");
const menu = require("../menu");

const router = express.Router();

router.post("/", async (req, res) => {
  menu(req).run(req.body, (ussdResult) => {
    res.send(ussdResult);
  });
});

module.exports = router;
