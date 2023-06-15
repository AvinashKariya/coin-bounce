const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");

//testing purpose

router.get("/", (req, res) => {
  res.json({ msg: "working" });
});

//For User Routes

// Register route - post route
router.post("/register", authController.register);
module.exports = router;

// Login route - post route
router.post("/login", authController.login);

//logout route - post route
router.post("/logout", auth, authController.logout);
module.exports = router;

//refresh
router.get("/refresh", authController.refresh);

// For Blog Routes

//create blog route - protected
router.post("/blog", auth, blogController.create);

//get all blog - protected
router.get("/blog/all", auth, blogController.getAll);

//get blog by id - protected
router.get("/blog/:id", auth, blogController.getById);

//update blog
router.put("/blog", auth, blogController.update);

//delete
router.delete("/blog/:id", auth, blogController.delete);
