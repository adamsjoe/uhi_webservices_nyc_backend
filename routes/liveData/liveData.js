const {
  createWeatherView,
} = require("../../helperFunctions/createWeatherView");
const {
  createInitialCollisionsView,
} = require("../../helperFunctions/createInitialCollisionsView");
const {
  handleMissingBorough,
} = require("../../helperFunctions/handleMissingBoroughs");

const {
  createViewWithDayField,
} = require("../../helperFunctions/createWithDay");
const { consolodateViews } = require("../../helperFunctions/consolodateView");
const {
  returnAggregatedView,
} = require("../../helperFunctions/returnAggregatedView");

const { cleanupView } = require("../../helperFunctions/cleanupView");
const { cleanupTable } = require("../../helperFunctions/cleanupTable");

module.exports = function (app) {
  app.get("/liveData/borough/:name/:year/:month", async (req, res) => {
    console.log(
      `in live query for ${req.params.name} ${req.params.year} ${req.params.month}`
    );

    const BOROUGH = req.params.name;
    const YEAR = req.params.year;
    const MONTH = req.params.month;
    const qualifierName = "uhi-assignment-1.assignment.";

    // Call with the temp table name - we will delete this later
    const tempWeatherView = `x1-tempWeatherFor-${YEAR}`;
    await createWeatherView(YEAR, tempWeatherView);

    // create a temp view for initial collisions
    const nameForTempInitialCollisionsView = `x2-initial_colison_data_${BOROUGH}-${MONTH}-${YEAR}`;
    await createInitialCollisionsView(
      nameForTempInitialCollisionsView,
      BOROUGH,
      YEAR,
      MONTH
    );

    // now handle the missing boroughs, need to ensure our data is as spot on as possible
    // await handleMissingBorough(nameForTempInitialCollisionsView);

    // // now we need to add in a day (well we don't but if we accomplish
    // // stretch goals it will be needed, so may as well do it here)
    const nameForViewWithDay = `x3-${BOROUGH}-${MONTH}-${YEAR}-final`;
    await createViewWithDayField(
      nameForViewWithDay,
      nameForTempInitialCollisionsView
    );

    const consolodatedViewName = `x4-${BOROUGH}-${MONTH}-${YEAR}-consolodated`;

    await consolodateViews(
      consolodatedViewName,
      qualifierName + nameForViewWithDay,
      qualifierName + tempWeatherView
    );

    const results = await returnAggregatedView(consolodatedViewName);

    // cleanup
    await cleanupView(`\`${qualifierName}${tempWeatherView}\``);
    await cleanupView(
      `\`${qualifierName}${nameForTempInitialCollisionsView}\``
    );
    await cleanupView(`\`${qualifierName}${nameForViewWithDay}\``);
    await cleanupTable(`\`${qualifierName}${consolodatedViewName}\``);

    res.json(results[0]);
  });
};
