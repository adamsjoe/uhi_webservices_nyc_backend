const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();

async function handleMissingBorough(tableName) {
  try {
    // Query the tempTable to retrieve rows where NEIGHBORHOOD is 'BB'
    const query = `
      SELECT *
      FROM \`uhi-assignment-1.assignment.${tableName}\`
      WHERE NEIGHBORHOOD = 'BB';
    `;

    const options = {
      query: query,
      location: "US",
    };

    const [rows] = await bigquery.query(options);

    // Iterate over the rows
    for (const row of rows) {
      // Calculate the borough value based on the spatial condition
      const boroughQuery = `
        SELECT UPPER(borough)
        FROM bigquery-public-data.new_york_taxi_trips.taxi_zone_geom tz_loc
        WHERE ST_DWithin(tz_loc.zone_geom, ST_GeogPoint(${row.LONG}, ${row.LAT}), 0);
      `;

      const [boroughResult] = await bigquery.query({
        query: boroughQuery,
        location: "US", // Change to your preferred location
      });

      // Update the NEIGHBORHOOD value in the row
      if (boroughResult.length > 0) {
        row.NEIGHBORHOOD = boroughResult[0].borough;
        console.log(`Updated NEIGHBORHOOD for row with ID ${row.id}`);
      } else {
        console.log(`No matching borough found for row with ID ${row.id}`);
      }

      // Save the updated row back to the tempTable
      await bigquery
        .dataset("your_dataset_id")
        .table("tempTable")
        .update([row]);
    }

    console.log("Update completed.");
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { handleMissingBorough };
