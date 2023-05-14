const express = require("express");
require("./db/mongoose");
const Tag = require("./models/tag");
const User = require("./models/user");
const TagReport = require("./models/tagReport");
var bcrypt = require("bcryptjs");
const config = require("./config");
const app = express();
const port = process.env.PORT || 4000;
const jwt = require("jsonwebtoken");
app.use(express.json());

//register a tag
app.post("/tagRegister", async (req, res) => {
  const tagDetails = new Tag(req.body);
  try {
    let { token } = req.headers;
    token = jwt.verify(token, config.secret);
    await tagDetails.save();
    res.status(200).json({
      message: "Registerd Success",
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//get a tag by id and mark it scan
// app.put("/tagRegister/:tagId", (req, res) => {
//   const { tagId } = req.params; // Find the tag by tagId
//   Tag.findOneAndUpdate({ tagId }, { scanned: true }, { new: true })
//     .then((tag) => {
//       if (!tag) {
//         return res.status(404).json({ message: "Tag not found" });
//       }

//       res.status(200).json(tag);
//     })
//     .catch((error) => {
//       console.error("Error finding/updating student:", error);
//       res.status(500).json({
//         message: "An error occurred while finding/updating the tag",
//       });
//     });
// });

// POST request to mark a tag scnned and store the details in "tagReports" collection
app.post("/tags/:id", async (req, res) => {
  const { scanned, userId } = req.body;
  try {
    //const client = await mongodb.MongoClient.connect(mongoURL);
    //const db = client.db(dbName);
    //const studentsCollection = db.collection("students");
    let { token } = req.headers;
    token = jwt.verify(token, config.secret);
    const tag = await Tag.findOne({ tagId: req.params.id });
    console.log(tag, req.params.id);
    if (!tag) {
      res.status(404).json({ error: "Tag not found" });
      //client.close();
      return;
    }
    const isTagScanned = await TagReport.findOne({ tagId: req.params.id });

    if (
      isTagScanned !== null &&
      isTagScanned.scanned &&
      isTagScanned.date === new Date().toLocaleDateString()
    )
      res.status(200).json({ message: "Already Scanend" });

    var today = new Date();
    const presentDate = new Date().toLocaleDateString();
    const presentTime = today.getHours() + ":" + today.getMinutes();
    const report = {
      //studentId: tag.id,
      scannerId: userId,
      tagId: tag.tagId,
      name: tag.name,
      houseNo: tag.houseNo,
      locality: tag.locality,
      city: tag.city,
      scanned: scanned,
      date: presentDate,
      time: presentTime,
    };

    const tagReportCollection = new TagReport(report);
    await tagReportCollection.save();
    res.json(report);

    //client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//createUser
app.post("/createUser", async (req, res) => {
  const { name, adhaarNumber, firmName, city, phoneNumber, userType } =
    req.body;
  // Generate the ID based on the name, Aadhaar number, and firm name
  const generatedId =
    //parseInt(Buffer.from(name + adhaarNumber + firmName).toString("hex"), 16)
    // Date.now().toString(36) + Math.random().toString(36).substr(2)+"."+firmName
    phoneNumber + "." + firmName; // Generate a random password

  console.log(generatedId);
  const generatedPassword = Math.random().toString(36).slice(-6);
  //console.log(generatedPassword);
  try {
    // Hash the password
    //onst hashedPassword = await bcrypt.hash(generatedPassword, 10); // Create a new instance of the User model with the provided data and generated ID and password
    // let{token} = req.headers;
    // token =jwt.verify(token,config.secret);
    const user = new User({
      name,
      adhaarNumber,
      firmName,
      city,
      phoneNumber,
      userType,
      userId: generatedId,
      password: generatedPassword,
    }); // Save the user to the database
    await user.save();
    res.status(201).json({
      message: "User saved successfully",
      generatedId,
      generatedPassword,
    });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).send(error.message);
  }
});

// authenticate and generate JWT token
app.post("/login", (req, res) => {
  const { userId, password } = req.body; // Find the user in the User table by userId and password
  User.findOne({ userId, password })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      } // Generate a JWT token with the user's ID
      const userType = user.userType;
      const token = jwt.sign({ userId: user.userId }, config.secret);
      res.status(200).json({ token, userId, userType, user });
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res
        .status(500)
        .json({ message: "An error occurred while authenticating the user" });
    });
});

// Define the route to get all tags by city name
app.get("/tags/byCity", (req, res) => {
  const { city } = req.query; // Find all tags matching the provided city name
  console.log(city, typeof city);
  Tag.find({ city })
    .then((tags) => {
      let { token } = req.headers;
      token = jwt.verify(token, config.secret);
      if (tags.length === 0) {
        return res
          .status(404)
          .json({ message: "No tags found for the given city" });
      }

      res.status(200).json(tags);
    })
    .catch((error) => {
      console.error("Error finding tags:", error);
      res
        .status(500)
        //.json({ message: "An error occurred while finding the tags" });
        .json(error);
    });
});

//to get all the users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);

    //client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//to delete a user
// DELETE request to delete a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const result = await User.deleteOne({ userId: req.params.id });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
