const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

async function cleanupTable(table) {
  console.log("Cleaning up temp view called - ", table);

  const query = `DROP TABLE ${table}`;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
    //   // Location must match that of the dataset(s) referenced in the query.
    location: "US",
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`-->Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();
  console.log(`--> Dropped table ${table}`);
}
module.exports = { cleanupTable };
