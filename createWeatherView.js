const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

// TODO
// we will use this to avoid many users overwriting each other
async function createWeatherView(year, newVieName) {
  try {
    console.log("Creating temporary weather view");
    console.log(
      `-->Weather view name will be uhi-assignment-1.assignment.weatherView-${newVieName}`
    );
    const viewName = `uhi-assignment-1.assignment.${newVieName}`;
    const query = `
      CREATE OR REPLACE VIEW \`${viewName}\` AS
      SELECT
        DATE(CAST(year AS INT64), CAST(mo AS INT64), CAST(da AS INT64)) AS date,
        year, mo, da, temp, dewp, slp, visib, wdsp, mxpsd, gust, max, min, prcp, sndp, fog
      FROM
        \`bigquery-public-data.noaa_gsod.gsod${year}\`
      WHERE
        stn = '725060'
      ORDER BY
        year, mo, da;
    `;

    const options = {
      query: query,
      location: "US", // Specify your desired location
    };

    // Run the query to create the view
    const [job] = await bigquery.createQueryJob(options);
    console.log(`-->Job ${job.id} started.`);

    // Wait for the query to finish
    await job.getQueryResults();

    console.log(`-->Weather view ${viewName} created successfully.`);
  } catch (error) {
    console.error("Error:", error);
  }
}
module.exports = { createWeatherView };
