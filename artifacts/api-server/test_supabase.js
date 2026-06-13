import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error(".env file not found at", envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.substring(0, idx).trim();
    const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = val;
  });
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const tables = ["users", "wallets", "transactions", "campaigns", "activity", "social_accounts", "oauth_tokens", "kora_deposits", "kora_virtual_cards", "card_ad_accounts", "kora_webhooks"];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`Table '${table}' query failed:`, error.message);
    } else {
      console.log(`Table '${table}' exists.`);
    }
  }
}

check();
