import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await sb.auth.admin.generateLink({
    type: "magiclink",
    email: "obalanatosin16@gmail.com",
    options: { redirectTo: "http://localhost:3001/auth/callback" }
  });
  if (error) console.error(error.message);
  else console.log(data.properties?.action_link);
}
main().catch(console.error);
