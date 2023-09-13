const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(
  "mongodb+srv://testDBUser:gd5R7PJ75MJXqrXN@webervice.yhwacfo.mongodb.net/AccidentData?retryWrites=true&w=majority"
);
const connection = mongoose.connection;

connection.on("error", () => {
  console.error.bind(console, "error");
});

connection.once("open", () => {
  console.log("Mongoose Connected");
});

const accidentDataModel = require("./models/accidentDataModel");

app.get("/historic/all", async (req, res) => {
  try {
    const allAccidentData = await accidentDataModel.find();
    res.json(allAccidentData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/historic/boroughs", async (req, res) => {
  try {
    const allBoroughs = await accidentDataModel.find().distinct("BOROUGH");

    res.json(allBoroughs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/historic/borough/:name", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/historic/borough/:name/:year", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/historic/borough/:name/:year/:month", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
      MONTH: req.params.month,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/historic/borough/:name/:year/:month/:day", async (req, res) => {
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
      MONTH: req.params.month,
      DAY: req.params.day,
    });
    res.json(boroughData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log("Wating for connection...");
});
