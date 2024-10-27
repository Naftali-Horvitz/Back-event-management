const express = require("express");
const router = express.Router();
const {registerUser, loginUser} = require('../controllers/userController');

router.post("/register", registerUser);
router.post("/login", loginUser);
//router.post("/login", userController.getAllUsers);
// router.get("/users", userController.getAllUsers);
// router.get("/users/:id", userController.getUserById);
// router.put("/users/:id", userController.updateUser);
// router.delete("/users/:id", userController.deleteUser);

module.exports = router;
