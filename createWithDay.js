const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

// TODO
// we will use this to avoid many users overwriting each other
async function createViewWithDayField(tableName, sourceView) {
  try {
    console.log("Creating temporary view to add days");
    console.log(
      `-->View name will be uhi-assignment-1.assignment.${tableName}`
    );
    const query = `CREATE OR REPLACE VIEW \`uhi-assignment-1.assignment.${tableName}\` 
        AS SELECT FORMAT_DATE("%u", collision_date) as day, collision_date, NEIGHBORHOOD, LAT, LONG, NUM_COLLISIONS, CYCLISTS_KILLED, CYCLISTS_INJURED, MOTORISTS_KILLED, MOTORISTS_INJURED, PEDS_KILLED, PEDS_INJURED, PERSONS_KILLED, PERSONS_INJURED
        FROM \`uhi-assignment-1.assignment.${sourceView}\`;
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

    console.log(`-->Initial collision view ${tableName} created successfully.`);
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { createViewWithDayField };
