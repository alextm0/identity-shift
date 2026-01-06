const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
    const sql = neon(DATABASE_URL);
    console.log('Verifying Database Connection and Schema...');

    try {
        // 1. Check connection
        const result = await sql`SELECT 1 as connection_test`;
        console.log('Connection: SUCCESS');

        // 2. Check users table
        const usersCount = await sql`SELECT count(*) FROM users`;
        console.log(`Users count: ${usersCount[0].count}`);

        // 3. Check planning table
        const planningCount = await sql`SELECT count(*) FROM planning`;
        console.log(`Planning records count: ${planningCount[0].count}`);

        // 4. Check for any UUID vs TEXT mismatches in columns again
        const columns = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (column_name = 'userId' OR column_name = 'id')
    `;
        console.log('Column Types:');
        columns.forEach(c => {
            console.log(`- ${c.table_name}.${c.column_name}: ${c.data_type}`);
        });

        console.log('Verification COMPLETED.');
    } catch (err) {
        console.error('VERIFICATION FAILED:', err.message);
        process.exit(1);
    }
}

main();
