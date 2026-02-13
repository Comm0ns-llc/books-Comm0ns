import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function readEnvFile(filepath) {
  const content = fs.readFileSync(filepath, "utf8");
  const env = {};
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return env;
}

const env = readEnvFile(path.join(process.cwd(), ".env.local"));
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const users = [
  { name: "佐々木 玲奈", location: "東京・世田谷", bio: "読書会が好きです。" },
  { name: "中村 颯太", location: "横浜・みなとみらい", bio: "歴史とSFをよく読みます。" },
  { name: "小林 由衣", location: "川崎・中原", bio: "デザインとエッセイ中心。" },
  { name: "松本 拓海", location: "東京・杉並", bio: "ビジネス書と技術書が多め。" },
  { name: "伊藤 菜月", location: "東京・中野", bio: "コミュニティ運営をしています。" }
];

const seedTag = Date.now();
const password = "TestUser123!";

for (let i = 0; i < users.length; i++) {
  const item = users[i];
  const email = `seed.user.${seedTag}.${i + 1}@books-commons.local`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: item.name }
  });

  if (error || !data.user) {
    console.error(`createUser failed: ${email}`, error?.message ?? "unknown error");
    continue;
  }

  const { error: profileError } = await admin.from("users").upsert(
    {
      id: data.user.id,
      display_name: item.name,
      location: item.location,
      bio: item.bio,
      status: "active"
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error(`profile upsert failed: ${email}`, profileError.message);
    continue;
  }

  console.log(`created: ${item.name} <${email}> / password: ${password}`);
}
