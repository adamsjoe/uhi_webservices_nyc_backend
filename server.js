const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

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

app.get("/historic/borough/:name/summary", async (req, res) => {
  console.log("in summary for " + req.params.name);
  class BoroughSummary {
    constructor(
      year,
      month,
      CYC_KILL,
      CYC_INJD,
      MOTO_KILL,
      MOTO_INJD,
      PEDS_KILL,
      PEDS_INJD,
      PERS_KILL,
      PERS_INJD,
      NUM_COLS
    ) {
      this.year = year;
      this.month = month;
      this.CYC_KILL = CYC_KILL;
      this.CYC_INJD = CYC_INJD;
      this.MOTO_KILL = MOTO_KILL;
      this.MOTO_INJD = MOTO_INJD;
      this.PEDS_KILL = PEDS_KILL;
      this.PEDS_INJD = PEDS_INJD;
      this.PERS_KILL = PERS_KILL;
      this.PERS_INJD = PERS_INJD;
      this.NUM_COLS = NUM_COLS;
    }
  }

  const summaries = {};
  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
    });

    boroughData.forEach((item) => {
      const year = item.YEAR;
      const month = item.MONTH;
      const key = `${year}=${month}`;

      if (!summaries[key]) {
        summaries[key] = new BoroughSummary(
          year,
          month,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ); // Initialize with zeros
      }

      // Aggregate the values
      summaries[key].CYC_KILL += item.CYC_KILL;
      summaries[key].CYC_INJD += item.CYC_INJD;
      summaries[key].MOTO_KILL += item.MOTO_KILL;
      summaries[key].MOTO_INJD += item.MOTO_INJD;
      summaries[key].PEDS_KILL += item.PEDS_KILL;
      summaries[key].PEDS_INJD += item.PEDS_INJD;
      summaries[key].PERS_KILL += item.PERS_KILL;
      summaries[key].PERS_INJD += item.PERS_INJD;
      summaries[key].NUM_COLS += item.NUM_COLS;
    });

    const summaryArray = Object.values(summaries);

    res.json(summaryArray);
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

app.get("/historic/borough/:name/:year/summary", async (req, res) => {
  class BoroughSummary {
    constructor(
      month,
      CYC_KILL,
      CYC_INJD,
      MOTO_KILL,
      MOTO_INJD,
      PEDS_KILL,
      PEDS_INJD,
      PERS_KILL,
      PERS_INJD,
      NUM_COLS
    ) {
      this.month = month;
      this.CYC_KILL = CYC_KILL;
      this.CYC_INJD = CYC_INJD;
      this.MOTO_KILL = MOTO_KILL;
      this.MOTO_INJD = MOTO_INJD;
      this.PEDS_KILL = PEDS_KILL;
      this.PEDS_INJD = PEDS_INJD;
      this.PERS_KILL = PERS_KILL;
      this.PERS_INJD = PERS_INJD;
      this.NUM_COLS = NUM_COLS;
    }
  }

  const summaries = {};

  try {
    const boroughData = await accidentDataModel.find({
      BOROUGH: req.params.name,
      YEAR: req.params.year,
    });

    boroughData.forEach((item) => {
      const month = item.MONTH;
      if (!summaries[month]) {
        summaries[month] = new BoroughSummary(month, 0, 0, 0, 0, 0, 0, 0, 0, 0); // Initialize with zeros
      }

      // Aggregate the values
      summaries[month].CYC_KILL += item.CYC_KILL;
      summaries[month].CYC_INJD += item.CYC_INJD;
      summaries[month].MOTO_KILL += item.MOTO_KILL;
      summaries[month].MOTO_INJD += item.MOTO_INJD;
      summaries[month].PEDS_KILL += item.PEDS_KILL;
      summaries[month].PEDS_INJD += item.PEDS_INJD;
      summaries[month].PERS_KILL += item.PERS_KILL;
      summaries[month].PERS_INJD += item.PERS_INJD;
      summaries[month].NUM_COLS += item.NUM_COLS;
    });

    const summaryArray = Object.values(summaries);

    res.json(summaryArray);
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
