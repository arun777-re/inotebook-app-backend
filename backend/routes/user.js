const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require("../models/User");
const fetchuser =require('../middleware/fetchUser');
 const JWT_SECRET = "arunrekha"
const { body, validationResult } = require("express-validator");
router.post("/", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});
// Create a user using Post://'/api/user' no login required
router.post(
  "/createuser",
  [
    body("name", "enter a valid name").isLength({ min: 3 }),
    body("email", "enter a valid email").isEmail(),
    body("password","enter password with minimum 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      console.log(user);
      if (user) {
        return res
          .status(400)
          .json({ error: "user already exists with the same email" });
      }
      const salt = await bcrypt.genSalt(10);
      let secPass = await bcrypt.hash(req.body.password,salt);
      // const secPass = req.body.password
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password:secPass
      });

      const data = {
        user:{
          id:user.id
        }
      }
      const authtoken = jwt.sign(data,JWT_SECRET);
      
      res.json(authtoken);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("some error occured");
    }
  }
);

// POST : user login using "api/user/" no login required
router.post('/loginuser',[
  body("email","enter the correct email").isEmail(),
  body("password","enter the correct password").exists()
],async(req,res)=>{
  //  if there are errors related to validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,password} = req.body;
  try {
    let user =await User.findOne({email});
    if(!user){
      res.status(400).json("please try to login with correct credentials")
    }

    const passwordCompare =await bcrypt.compare(password,user.password);
    if(!passwordCompare){
      res.status(400).json("please try to login with correct credentials")
    }
    const data = {
      user:{
        id:user.id
      }
    };
    const authtoken = jwt.sign(data,JWT_SECRET);
    
    res.json(authtoken);

  } catch (error) {
    console.error(err.message);
      res.status(500).send("Internal server error");
  }
});

// POST :get loggedin user details using "api/auth/getuser"  login required
router.post('/getuser',fetchuser,async(req,res)=>{
try {
 const userId = req.user.id;
  const user =await User.findById(userId).select('-password');
  res.send(user);
} catch (error) {
  console.log(error);
  res.status(500).send("Internal server error");
}
})

module.exports = router;
