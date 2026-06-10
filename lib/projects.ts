export type Category = "ALL" | "WEDDING" | "BIRTHDAY" | "GRADUATION" | "LAW";

export interface Project {
  id: number;
  name: string;
  /** Display slug used in URLs */
  slug: string;
  /** Exact folder name inside /Volumes/FV 1/WEBSITE */
  folderName: string;
  /** Cover image from Figma (used as placeholder until local images load) */
  image: string;
  /** Specific filename to use as cover (overrides alphabetical first). Also becomes first image on detail page. */
  coverFile?: string;
  /** Used only for the ABIODUN card — photo clipped into the label text */
  labelBgImage?: string;
  category: Category;
  instagramUrl?: string;
  /** Handle shown on the detail page back-link */
  handle?: string;
  /** Caption shown below photos on detail page */
  caption?: string;
}

export const categories: { label: string; value: Category; count: number }[] =
  [
    { label: "ALL PROJECT", value: "ALL", count: 40 },
    { label: "WEDDING", value: "WEDDING", count: 10 },
    { label: "BIRTHDAY", value: "BIRTHDAY", count: 9 },
    { label: "GRADUATION", value: "GRADUATION", count: 7 },
    { label: "LAW", value: "LAW", count: 7 },
  ];

export const projects: Project[] = [
  {
    id: 1,
    name: "SEYI",
    slug: "seyi",
    folderName: "SEYI",
    image:
      "https://www.figma.com/api/mcp/asset/935a22dd-8bf6-47d5-8158-8aaffa22d9ef",
    category: "BIRTHDAY",
  },
  {
    id: 2,
    name: "BELLO",
    slug: "bello",
    folderName: "BELLO",
    coverFile: "IMG_1455.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/4b1676ba-cbcb-475d-a63b-0c08653ffe16",
    category: "WEDDING",
  },
  {
    id: 3,
    name: "TEMILADE",
    slug: "temilade",
    folderName: "TEMILADE",
    image:
      "https://www.figma.com/api/mcp/asset/bee9120f-fa8a-428a-8e1b-148003738f83",
    category: "GRADUATION",
  },
  {
    id: 4,
    name: "GABRIEL OGHOSA",
    slug: "gabriel-oghosa",
    folderName: "GABRIEL OGHOSA",
    image:
      "https://www.figma.com/api/mcp/asset/bd045215-bbb5-41b6-821b-524e949c13b6",
    category: "BIRTHDAY",
  },
  {
    id: 5,
    name: "KEVWE",
    slug: "kevwe",
    folderName: "KEVWE",
    image:
      "https://www.figma.com/api/mcp/asset/9beca0d5-187a-471b-816d-334d6d7b064a",
    category: "BIRTHDAY",
    instagramUrl: "https://www.instagram.com/r_i.nah/",
    handle: "r_i.nah",
  },
  {
    id: 6,
    name: "PRECIOUS TRAD",
    slug: "precious-trad",
    folderName: "PRECIOUS TRAD ",
    image:
      "https://www.figma.com/api/mcp/asset/264ec26d-dd37-4ab1-8916-86e1319c2b4b",
    category: "WEDDING",
  },
  {
    id: 7,
    name: "ABIODUN",
    slug: "abiodun",
    folderName: "ARI ABIODUN",
    image:
      "https://www.figma.com/api/mcp/asset/b0701bb4-765a-47b7-ad90-d7447bf3190c",
    labelBgImage:
      "https://www.figma.com/api/mcp/asset/e07f6ae0-fa26-4fd2-8818-affe3980d1f6",
    category: "GRADUATION",
    handle: "ari.abiodun",
  },
  {
    id: 8,
    name: "STARR",
    slug: "starr",
    folderName: "STARR",
    image:
      "https://www.figma.com/api/mcp/asset/ec5abdf4-6ff0-4bc6-b95b-bc071c7a725f",
    category: "BIRTHDAY",
    instagramUrl: "https://www.instagram.com/unusual_star_/",
    handle: "unusual_star_",
  },
  {
    id: 9,
    name: "TOMI",
    slug: "tomi",
    folderName: "TOMI",
    image:
      "https://www.figma.com/api/mcp/asset/a7502fa2-f669-4cc3-9c31-a7d50b91cd26",
    category: "GRADUATION",
  },
  {
    id: 10,
    name: "BLOSSOM",
    slug: "blossom",
    folderName: "BLOSSOM CALL TO BAR",
    image:
      "https://www.figma.com/api/mcp/asset/e5c90c84-a895-4ee9-b959-53d6c1bfe303",
    category: "LAW",
  },
  {
    id: 11,
    name: "DEMOLA",
    slug: "demola",
    folderName: "DEMOLA",
    image:
      "https://www.figma.com/api/mcp/asset/d232b4b2-ff37-4362-895b-e78d73c0f297",
    category: "BIRTHDAY",
  },
  {
    id: 12,
    name: "PROSPER",
    slug: "prosper",
    folderName: "PROSPER'S PRE WEDDING/2",
    image:
      "https://www.figma.com/api/mcp/asset/4cfe964d-9b73-498a-b73c-20e873233b9f",
    category: "WEDDING",
  },
  {
    id: 13,
    name: "MIDEY",
    slug: "midey",
    folderName: "MIDEY",
    coverFile: "IMG_2295 copy.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/3db72941-d03f-485c-bd2c-7e470486dd9f",
    category: "BIRTHDAY",
  },
  {
    id: 14,
    name: "TIANA",
    slug: "tiana",
    folderName: "TIANA",
    image:
      "https://www.figma.com/api/mcp/asset/6488013e-3a06-4c7d-96ef-3fcae7454150",
    category: "GRADUATION",
  },
  {
    id: 15,
    name: "SEYI CONVO",
    slug: "seyi-convo",
    folderName: "SEYI CONVOCATION",
    image:
      "https://www.figma.com/api/mcp/asset/0939f19c-e482-4ea0-a945-ccb0e5733b75",
    category: "GRADUATION",
  },
  {
    id: 16,
    name: "PRECIOUS",
    slug: "precious",
    folderName: "PRECIOUS",
    coverFile: "IMG_8564.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/382b2ba7-0a6c-4f6c-91e1-b306674f71a8",
    category: "BIRTHDAY",
  },
  {
    id: 17,
    name: "PECULIAR TRAD",
    slug: "peculiar-trad",
    folderName: "PECULIAR WEDDING/TRAD WEDDING",
    image:
      "https://www.figma.com/api/mcp/asset/46cc8855-6e35-4655-8164-716ceeaf7100",
    category: "WEDDING",
  },
  {
    id: 18,
    name: "OYERONKE",
    slug: "oyeronke",
    folderName: "OYERONKE",
    coverFile: "IMG_9856.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/335b3732-5460-4951-8a4c-2e04bb6a2f61",
    category: "GRADUATION",
  },
  {
    id: 19,
    name: "OLABANJI",
    slug: "olabanji",
    folderName: "OLABANJI",
    image:
      "https://www.figma.com/api/mcp/asset/a02531ae-511b-4ce4-a437-615537948aee",
    category: "WEDDING",
  },
  {
    id: 20,
    name: "OMOLOLA PRE",
    slug: "omolola-pre",
    folderName: "OMOLOLA PRE WEDDING/PRE",
    image:
      "https://www.figma.com/api/mcp/asset/9997e1b1-97be-499d-a914-1bff7676c4f6",
    category: "WEDDING",
  },
  {
    id: 21,
    name: "CHRISTMAS",
    slug: "christmas",
    folderName: "CHRISTMAS",
    image:
      "https://www.figma.com/api/mcp/asset/7d868792-08ad-4112-b7a7-a06ac64cbd21",
    category: "BIRTHDAY",
  },
  {
    id: 22,
    name: "NIMI BL",
    slug: "nimi",
    folderName: "NIMI/BL",
    coverFile: "S_PX1442.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/f983ea39-eb5e-4ab9-9483-fcb5893bbd9b",
    category: "BIRTHDAY",
  },
  {
    id: 23,
    name: "PROSPER TRAD",
    slug: "prosper-trad",
    folderName: "PROSPER'S PRE WEDDING/TRAD",
    image:
      "https://www.figma.com/api/mcp/asset/7682113e-b273-48bf-9ef8-f2a2e2e1141e",
    category: "WEDDING",
  },
  {
    id: 24,
    name: "ARAMIDE",
    slug: "aramide",
    folderName: "ARAMIDE",
    coverFile: "IMG_7496 copy.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/f6409732-f243-4960-b3ae-946f2ad88e33",
    category: "GRADUATION",
  },
  {
    id: 25,
    name: "DAMILOLA",
    slug: "damilola",
    folderName: "DAMILOLA",
    image:
      "https://www.figma.com/api/mcp/asset/2be2149b-abdf-4365-878d-c08244702f30",
    category: "BIRTHDAY",
  },
  {
    id: 26,
    name: "FAVOUR",
    slug: "favour",
    folderName: "FAVOUR",
    image:
      "https://www.figma.com/api/mcp/asset/abd60537-0710-4588-81df-e8feb1423570",
    category: "WEDDING",
  },
  {
    id: 27,
    name: "ELIJAH",
    slug: "elijah",
    folderName: "ELIJAH CONVOCATION",
    image:
      "https://www.figma.com/api/mcp/asset/33d9b854-fd50-4299-a16f-dd5f9f3dec65",
    category: "LAW",
  },
  {
    id: 28,
    name: "EZEKIEL",
    slug: "ezekiel",
    folderName: "EZEKIEL CALL TO BAR",
    image:
      "https://www.figma.com/api/mcp/asset/fd009c10-da83-4063-b5ac-f253460f697d",
    category: "LAW",
  },
  {
    id: 29,
    name: "FEHIN",
    slug: "fehin",
    folderName: "FEHIN",
    image:
      "https://www.figma.com/api/mcp/asset/67ecf919-4424-4741-8e7c-934452e71fc2",
    category: "WEDDING",
  },
  {
    id: 30,
    name: "IBIFUBARA",
    slug: "ibifubara",
    folderName: "IBIFUBARA",
    image:
      "https://www.figma.com/api/mcp/asset/3c7419db-a75d-412d-a181-8ca1e91ada52",
    category: "BIRTHDAY",
  },
  {
    id: 31,
    name: "JULIET",
    slug: "juliet",
    folderName: "JULIET IBRAHIM",
    image:
      "https://www.figma.com/api/mcp/asset/61586de8-8105-49b9-8fd4-d791ae217211",
    category: "WEDDING",
  },
  {
    id: 32,
    name: "KINDESS",
    slug: "kindess",
    folderName: "KINDNNESS CONVOCATION",
    image:
      "https://www.figma.com/api/mcp/asset/44b401d3-113d-44e8-9f77-6d80357188b3",
    category: "GRADUATION",
  },
  {
    id: 33,
    name: "MAYOWA",
    slug: "mayowa",
    folderName: "MAYOWA",
    image:
      "https://www.figma.com/api/mcp/asset/3f5dbb52-55e1-4787-9cde-456e4a42d249",
    category: "BIRTHDAY",
  },
  {
    id: 34,
    name: "MIDE",
    slug: "mide",
    folderName: "MIDE ",
    image:
      "https://www.figma.com/api/mcp/asset/185bf725-d578-4a7a-a575-2d14b8fdfcff",
    category: "WEDDING",
  },
  {
    id: 35,
    name: "MINAT",
    slug: "minat",
    folderName: "MINAT",
    image:
      "https://www.figma.com/api/mcp/asset/a971c60a-7169-4a49-9e88-e22ab96d6185",
    category: "BIRTHDAY",
  },
  {
    id: 36,
    name: "MOYIN 01",
    slug: "moyin-01",
    folderName: "MOYIN PRE WEDDING/1",
    image:
      "https://www.figma.com/api/mcp/asset/d61f27f8-664b-4489-8cb7-76b4f212c62c",
    category: "LAW",
  },
  {
    id: 37,
    name: "NIMI",
    slug: "nimi-2",
    folderName: "NIMI/2",
    coverFile: "S_PX1605.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/f983ea39-eb5e-4ab9-9483-fcb5893bbd9b",
    category: "BIRTHDAY",
  },
  {
    id: 38,
    name: "PECULIAR WHITE",
    slug: "peculiar-white",
    folderName: "PECULIAR WEDDING/WHITE WEDDING",
    image:
      "https://www.figma.com/api/mcp/asset/7a5e3c4b-4f91-4f01-b1ef-702dd647246e",
    category: "WEDDING",
  },
  {
    id: 39,
    name: "MRS AKODU",
    slug: "mrs-akodu",
    folderName: "MRS AKODU ",
    image:
      "https://www.figma.com/api/mcp/asset/c0b494a1-6e7e-45d0-b605-f7e0105869b4",
    category: "BIRTHDAY",
  },
  {
    id: 40,
    name: "AMANI",
    slug: "amani",
    folderName: "AMANI'S BBRIDAL BRUNCH ",
    coverFile: "IMG_5660.jpg",
    image:
      "https://www.figma.com/api/mcp/asset/cf5476ba-bf90-4a4e-99ed-b4c342a95a35",
    category: "LAW",
  },
  {
    id: 41,
    name: "MRS OSEZUA",
    slug: "mrs-osezua",
    folderName: "MRS OSEZUA",
    image:
      "https://www.figma.com/api/mcp/asset/b4312352-672a-4cc0-9d54-05edc3a5ea1e",
    category: "WEDDING",
  },
  {
    id: 42,
    name: "FISAYO",
    slug: "fisayo",
    folderName: "FISAYO",
    image:
      "https://www.figma.com/api/mcp/asset/3e93d6f8-4bae-4c32-aced-baf7a9bfac78",
    category: "BIRTHDAY",
  },
  {
    id: 43,
    name: "MOYIN YOR",
    slug: "moyin-yor",
    folderName: "MOYIN PRE WEDDING/YOR",
    image:
      "https://www.figma.com/api/mcp/asset/1bb2a4b2-d5ef-45df-bfb4-72fd254117a5",
    category: "GRADUATION",
  },
  {
    id: 44,
    name: "OMOLOLA 02",
    slug: "omolola-02",
    folderName: "OMOLOLA PRE WEDDING/2",
    image:
      "https://www.figma.com/api/mcp/asset/1e2326c5-23bf-4f06-bca6-2b3f5d9ddb13",
    category: "LAW",
  },
  {
    id: 45,
    name: "DOYIN",
    slug: "doyin",
    folderName: "DOYIN",
    image:
      "https://www.figma.com/api/mcp/asset/81b84860-9ff0-4171-b75b-ac6ce717e9ad",
    category: "WEDDING",
  },
];

export function getProjectById(id: number): Project | undefined {
  return projects.find((p) => p.id === id);
}
