const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

async function createInitialCollisionsView(tableName, borough, year, month) {
  try {
    console.log("Creating temporary initial collision data view");
    console.log(
      `-->View name will be uhi-assignment-1.assignment.${tableName}`
    );
    const viewName = `uhi-assignment-1.assignment.${tableName}`;
    const query = `
        CREATE OR REPLACE VIEW \`uhi-assignment-1.assignment.${tableName}\` AS
        SELECT
        CAST(timestamp AS DATE) AS collision_date,
        COUNT(CAST(timestamp AS DATE)) AS NUM_COLLISIONS,
        CASE
            WHEN ds.borough IS NOT NULL THEN CAST(borough AS STRING) -- when the borough is set
            WHEN ((ds.latitude IS NOT NULL or ds.longitude IS NOT NULL) AND ds.borough IS NULL) THEN "BB"
            WHEN (ds.latitude IS NULL OR ds.longitude IS NULL OR ds.borough IS NULL) THEN "Unknown"
        END
        AS NEIGHBORHOOD,
        CAST(ds.latitude AS FLOAT64) AS LAT,
        CAST(ds.longitude AS FLOAT64)  AS LONG,
        SUM(CAST(number_of_cyclist_killed AS INT64)) AS CYCLISTS_KILLED,
        SUM(CAST(number_of_cyclist_injured AS INT64)) AS CYCLISTS_INJURED,
        SUM(CAST(number_of_motorist_killed AS INT64)) AS MOTORISTS_KILLED,
        SUM(CAST(number_of_motorist_injured AS INT64)) AS MOTORISTS_INJURED,
        SUM(CAST(number_of_pedestrians_killed AS INT64)) AS PEDS_KILLED,
        SUM(CAST(number_of_pedestrians_injured AS INT64)) AS PEDS_INJURED,
        SUM(CAST(number_of_persons_killed AS INT64)) AS PERSONS_KILLED,
        SUM(CAST(number_of_persons_injured AS INT64)) AS PERSONS_INJURED,
        FROM
        bigquery-public-data.new_york_mv_collisions.nypd_mv_collisions ds 
        where EXTRACT(YEAR FROM timestamp) = ${year}
        AND EXTRACT(MONTH FROM timestamp) = ${month}
        AND borough = '${borough}'
        GROUP BY
        collision_date,
        NEIGHBORHOOD,
        LAT, 
        LONG
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

    console.log(`-->Initial collision view ${viewName} created successfully.`);
  } catch (error) {
    console.error("Error:", error);
  }
}
module.exports = { createInitialCollisionsView };
