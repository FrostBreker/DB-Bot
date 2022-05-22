const router = require("express").Router();
const authController = require("../controllers/auth.controller");

// auth
router.post("/login", authController.signInWithDiscord);
router.get("/logout", authController.logout);
router.get("/:id", authController.getUserData);

module.exports = router;
