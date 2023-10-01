module.exports = function (app) {
  const accidentDataModel = require("../../models/accidentDataModel");

  /**
   * @swagger
   * /historic/all:
   *   get:
   *     summary: Retrieves all the data in the database.
   *     description: Retrieves all the data, for all boroughs and years.  Not useful for real application, used mainly to test calls are working.
   *     tags:
   *       - Historic
   */

  app.get("/historic/all", async (req, res) => {
    try {
      console.log("In the all data query");
      const allAccidentData = await accidentDataModel.find();
      res.json(allAccidentData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};
