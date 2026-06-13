import pg from "pg";

const { Client } = pg;

const host = "db.uifiwjhibihenjavubls.supabase.co";
const port = 6543;
const user = "postgres";
const database = "postgres";

const passwords = [
  "uifiwjhibihenjavubls",
  "adwallet",
  "adswallet",
  "postgres",
  "password"
];

async function tryConnect() {
  for (const password of passwords) {
    console.log(`Trying password: ${password}...`);
    const client = new Client({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log(`SUCCESS! Password is: ${password}`);
      const res = await client.query("SELECT NOW()");
      console.log("Query result:", res.rows[0]);
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed with password: ${password}. Error: ${err.message}`);
    }
  }
  console.log("None of the common passwords worked.");
}

tryConnect();
