const mongoose = require("mongoose");

const accidentSchema = new mongoose.Schema(
  {
    _id: {
      required: true,
      type: Object,
    },
    DATE: {
      required: true,
      type: Date,
    },
    BOROUGH: {
      required: true,
      type: String,
    },
    WEEKDAY: { type: Number },
    YEAR: { type: Number },
    MONTH: { type: Number },
    DAY: { type: Number },
    COLLISION_DATE: { type: String },
    TEMP: { type: Number },
    DEWP: { type: Number },
    SLP: { type: Number },
    VISIB: { type: Number },
    WDSP: { type: Number },
    MXPSD: { type: Number },
    GUST: { type: Number },
    MAX: { type: Number },
    MIN: { type: Number },
    PRCP: { type: Number },
    SNDP: { type: Number },
    FOG: { type: Number },
    CYC_KILL: { type: Number },
    CYC_INJD: { type: Number },
    MOTO_KILL: { type: Number },
    MOTO_INJD: { type: Number },
    PEDS_KILL: { type: Number },
    PEDS_INJD: { type: Number },
    PERS_KILL: { type: Number },
    PERS_INJD: { type: Number },
    NUM_COLS: { type: Number },
  },
  { collection: "Historic" }
);

module.exports = mongoose.model("Historic", accidentSchema);
