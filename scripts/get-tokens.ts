import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Create a session for the admin user directly
  const { data, error } = await sb.auth.admin.createUser({
    email: "obalanatosin16@gmail.com",
    email_confirm: true,
  });
  
  // Sign in via admin to get tokens
  const { data: linkData, error: linkError } = await sb.auth.admin.generateLink({
    type: "magiclink",
    email: "obalanatosin16@gmail.com",
  });
  
  if (linkError) { console.error(linkError.message); return; }
  
  // Extract hashed_token from the link
  console.log("LINK:", linkData.properties?.action_link);
  console.log("TOKEN:", linkData.properties?.hashed_token);
}
main().catch(console.error);
