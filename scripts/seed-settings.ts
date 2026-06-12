import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const portraits = [
  { cloudinary_public_id: "fisayoview/about/IMG_9296", url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9296", sort_order: 0 },
  { cloudinary_public_id: "fisayoview/about/IMG_9297_copy", url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9297_copy", sort_order: 1 },
  { cloudinary_public_id: "fisayoview/about/IMG_9309", url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9309", sort_order: 2 },
  { cloudinary_public_id: "fisayoview/about/IMG_9322_copy", url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9322_copy", sort_order: 3 },
  { cloudinary_public_id: "fisayoview/about/S_PX1005_copy", url: "https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/S_PX1005_copy", sort_order: 4 },
];

const bio = `I'm Obalana Fisayo — the lead photographer, creative and the mind behind fisayoview.\n\nWhat you see on this page isn't just photography.\nIts intention, It's detail, It's understanding people beyond the surface. Every frame I create is built on one thing and that's making you feel seen not just photographed.\n\nFrom portraits to events, I focus on capturing moments in a way that actually means something because anyone can take a picture but not everyone can tell your story properly.\n\nIf you're new here, you're in the right place. Let's create something timeless.`;

async function main() {
  const { error } = await sb.from("site_settings").update({
    about_heading: "FISAYOVIEW",
    about_text: bio,
    instagram_url: "https://www.instagram.com/fisayoview/",
    whatsapp: "+2348136404224",
    email: "bookfisayoview@gmail.com",
    about_portraits: portraits,
    seo_title: "FISAYOVIEW — Photography by Fisayo Obalana",
    seo_description: "FISAYOVIEW is the photography portfolio of Fisayo Obalana — capturing birthdays, weddings, graduations, studio sessions and portraits across Nigeria with intention and detail.",
    seo_keywords: "fisayoview, Fisayo Obalana, photographer Nigeria, portrait photographer Lagos, birthday photographer Nigeria, wedding photographer Lagos",
  }).eq("id", 1);

  if (error) console.error("Error:", error.message);
  else console.log("site_settings seeded");
}

main().catch(console.error);
