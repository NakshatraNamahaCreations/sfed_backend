// Seeds the storefront catalogue from the SEFD 2026 printed catalogues
// (Catalogue_SEFD_2026 + ISHWARI Product Catalogue): 5 categories and their
// products with prices, descriptions and photos.
//
// Photos are the ones already in the website's /public/products folder, stored
// as site-relative URLs ("/products/…"), so no Cloudinary upload is needed.
// Their publicId starts with "local:" so the API never tries to delete them
// from Cloudinary.
//
// Safe to run again: categories and products are matched by slug and updated
// in place; a seeded product's photos are replaced, never duplicated.
// Products added later through the admin panel are left untouched.
//
//   npm run seed:catalog
import "dotenv/config";
import mongoose from "mongoose";
import Category from "./models/category.model.js";
import Product from "./models/product.model.js";
import ProductMedia from "./models/productMedia.model.js";

const DEFAULT_STOCK = 25;

const WARLI_NOTE =
  "Hand-painted in the Warli tradition — the tribal art of Maharashtra — by differently-abled artisans of the Self Esteem Foundation for Disabled (SEFD). Every piece is painted by hand, so the motifs vary slightly and no two are exactly alike.";
const JUTE_NOTE =
  "Made from natural, eco-friendly jute and stitched by differently-abled artisans at SEFD. Sturdy, reusable and plastic-free.";
const COTTON_NOTE =
  "Stitched by differently-abled artisans at SEFD from printed cotton and handloom-style fabrics. Light, washable and made for everyday use.";
const FILE_NOTE =
  "Handmade at SEFD by differently-abled artisans — a thoughtful desk accessory for offices, conferences and corporate gifting.";
const ISHWARI_NOTE =
  "From Ishwari – Divine Offerings, a special brand by SEFD: exquisite merchandise recycled and curated from sarees offered to goddesses in temples during the festive season. Each piece is handcrafted by differently-abled and disadvantaged beneficiaries — a blessing to keep, or to gift to family and friends.";

const IMPACT_NOTE =
  "Proceeds go towards the artisans' stipend, skill training and continued development.";

const categories = [
  {
    slug: "warli-art",
    name: "Warli Art",
    image: "/products/warli-art/page-02-01.jpeg",
    note: WARLI_NOTE,
    products: [
      ["Warli Tea Coaster Set — Black", 520, "warli-art/page-02-01.jpeg", "Set of square tea coasters with a matching stand, hand-painted with white Warli figures on black."],
      ["Warli Tea Coaster Set — Green", 520, "warli-art/page-02-02.png", "Square tea coasters in a holder, painted with Warli village scenes on a deep green base."],
      ["Warli Round Tea Coasters with Holder", 520, "warli-art/page-02-03.jpeg", "Round coasters that stand in a curved terracotta-red holder decorated with Warli birds and figures."],
      ["Warli Tea Coaster Stand — Hand Cart", 750, "warli-art/page-02-04.jpeg", "A set of coasters held in a charming hand-cart stand, painted black with Warli motifs."],
      ["Warli Mobile Stand", 270, "warli-art/page-02-05.jpeg", "A slim green mobile stand painted with Warli dancers — keeps your phone upright on the desk."],
      ["Warli Mobile Stand 2-in-1 with Pen Holder", 450, "warli-art/page-02-06.jpeg", "A mobile stand and pen holder in one, in rich brown with white Warli figures."],
      ["Warli Gift Box — Button Lid", 400, "warli-art/page-03-01.jpeg", "A dark wooden gift box with a sliding button lid, painted with a row of Warli figures."],
      ["Warli Gift Box", 270, "warli-art/page-03-02.jpeg", "A compact painted gift box for dry fruits, sweets or small keepsakes."],
      ["Warli Gift Box with Lock", 280, "warli-art/page-03-03.jpeg", "A green hinged gift box with a metal latch, painted all over with Warli patterns."],
      ["Warli Jewellery Box", 750, "warli-art/page-03-04.jpeg", "A black jewellery box with compartments inside and a Warli-painted lid — a lovely gift."],
      ["Warli Dry Fruit Box — Small", 400, "warli-art/page-03-05.png", "A green four-compartment dry fruit box with a painted Warli lid. Small size."],
      ["Warli Dry Fruit Box — Big", 600, "warli-art/page-03-05.png", "A green four-compartment dry fruit box with a painted Warli lid. Big size."],
      ["Warli Serving Tray — Small", 400, "warli-art/page-03-06.jpeg", "A green serving tray with handles, painted with Warli scenes along the rim. Small size."],
      ["Warli Serving Tray — Big", 600, "warli-art/page-03-06.jpeg", "A green serving tray with handles, painted with Warli scenes along the rim. Big size."],
      ["Warli Key Holder — Hut", 250, "warli-art/page-04-01.png", "A hut-shaped wall key holder with hooks, painted with a Warli tree and figures."],
      ["Warli Tissue Box", 500, "warli-art/page-04-02.jpeg", "A terracotta-red tissue box painted with white Warli motifs."],
      ["Warli Key Holder — House", 350, "warli-art/page-04-03.png", "A house-shaped key holder with hooks, available in green, red and black."],
      ["Warli Key Chain", 50, "warli-art/page-04-04.png", "A small wooden key chain with a hand-painted Warli figure — ideal as a return gift."],
      ["Warli Hot Pot Mats", 480, "warli-art/page-04-05.png", "Round black hot-pot mats with a circular Warli dance motif."],
      ["Warli Bullock Cart Tea Coaster", 750, "warli-art/page-04-06.png", "Tea coasters held in a bullock-cart stand — a festive table piece in Warli art."],
      ["Warli Pen Stand — Hexagon", 220, "warli-art/page-05-01.jpeg", "A black hexagonal pen stand with Warli figures painted around it."],
      ["Warli Pen Stand — Square", 180, "warli-art/page-05-02.jpeg", "A green square pen stand with a band of Warli dancers."],
      ["Warli Tissue Holder — Round", 200, "warli-art/page-05-03.jpeg", "A half-moon napkin holder in terracotta pink with Warli figures."],
      ["Warli Tissue Holder — Rectangle", 200, "warli-art/page-05-04.jpeg", "A green rectangular napkin holder painted with a Warli village hut."],
      ["Warli Tissue Holder — Triangle", 200, "warli-art/page-05-05.jpeg", "A black triangular napkin holder with Warli birds and figures."],
      ["Warli Pen Stand", 180, "warli-art/page-05-06.jpeg", "A tall black pen stand on a base, painted with a Warli figure."],
    ],
  },
  {
    slug: "jute",
    name: "Jute Bags",
    image: "/products/jute/page-07-01.png",
    note: JUTE_NOTE,
    products: [
      ["Jute Fancy Bag with Flap", 300, "jute/page-06-07.png", "A purple jute tote with a zari border and an inner flap pocket."],
      ["Jute Fancy Bag with Flap & Zip", 350, "jute/page-06-08.jpeg", "A red jute handbag with a zari band, a flap and a zipped compartment."],
      ["Ganesha Jute Bag — Small", 100, "jute/page-06-03.jpeg", "A small black jute bag with a hand-painted Ganesha — perfect for festive gifting."],
      ["Ganesha Jute Bag — Big with Zip", 500, "jute/page-06-04.jpeg", "A large natural jute bag with a Ganesha motif, piped edges and a zip."],
      ["Tiffin Jute Bag — Paisley", 180, "jute/page-06-05.png", "A natural jute tiffin bag printed with a pink paisley motif."],
      ["Jute Shopping Bag with Zip", 270, "jute/page-06-09.png", "A mustard-yellow jute shopping bag with sturdy handles and a zip."],
      ["Warli Jute Bag", 350, "jute/page-07-01.png", "A black and natural jute bag with a band of hand-painted Warli dancers and a front pocket."],
      ["Warli Jute Shopping Bag", 500, "jute/page-07-02.png", "A large natural jute shopping bag with a Warli-painted panel and black piping."],
      ["Jute Comb Pouch", 70, "jute/page-07-06.jpeg", "A slim zipped jute pouch for combs, pens or brushes, in assorted colours."],
      ["Jute Money Purse", 120, "jute/page-07-07.jpeg", "A zipped jute purse with a woven ribbon trim, in assorted colours."],
      ["Jute Bag for Water Bottle", 200, "jute/page-07-04.png", "A tall jute bottle bag with rope handles — carries a 1-litre bottle."],
      ["Jute Tiffin Bag", 120, "jute/page-07-05.jpeg", "A compact jute lunch bag with cane handles, in assorted colours."],
    ],
  },
  {
    slug: "cotton",
    name: "Cotton Bags",
    image: "/products/cotton/page-09-01.png",
    note: COTTON_NOTE,
    products: [
      ["Cotton Sling Bag — Printed", 150, "cotton/page-08-01.jpeg", "A bright printed cotton sling bag with a long strap and zip pockets."],
      ["Cotton Sling Bag — Black", 270, "cotton/page-08-02.jpeg", "A black sling bag with three zipped pockets and an adjustable strap."],
      ["Cotton Shoulder Bag — Black Floral", 300, "cotton/page-08-03.png", "A roomy black floral-print shoulder bag with zipped pockets."],
      ["Cotton Shoulder Tote — Floral Print", 500, "cotton/page-08-04.png", "A structured floral-print tote with shoulder straps."],
      ["Cotton Shoulder Bag — Printed Box Bag", 400, "cotton/page-08-05.png", "A compact printed box bag with a flap and a long shoulder strap."],
      ["Cotton Shoulder Bag — Paisley", 500, "cotton/page-08-06.png", "A black-and-white paisley shoulder bag with side pockets."],
      ["Batwa / Potli", 100, "cotton/page-09-01.png", "A drawstring potli bag in festive brocade — for gifts, shagun or jewellery."],
      ["Samosa Coin Pouch", 60, "cotton/page-09-02.png", "A tiny triangular coin pouch in brocade. Prices from ₹60 depending on fabric."],
      ["Cotton Fancy Bag", 400, "cotton/page-09-03.png", "A printed handbag with top handles and a detachable strap."],
      ["Money Purse — Multi-pocket", 180, "cotton/page-09-04.png", "A zipped purse with several compartments, in handloom-style fabric. Also available in a larger size (₹220)."],
      ["Jhola Bag", 400, "cotton/page-09-05.png", "A classic jhola shoulder bag in checks and brocade."],
      ["Money Purse — Zip Pouch", 120, "cotton/page-09-06.png", "A flat zipped pouch in handloom-border fabric, in assorted colours."],
    ],
  },
  {
    slug: "file-notepad",
    name: "File & Stationery",
    image: "/products/file-notepad/page-10-07.png",
    note: FILE_NOTE,
    products: [
      ["Cloth Folder — Warli", 275, "file-notepad/page-10-01.png", "A cloth-covered document folder printed with a Warli pattern."],
      ["Cloth Notepad Holder", 150, "file-notepad/page-10-02.jpeg", "A fold-over notepad holder with a printed cloth flap."],
      ["Jute Folder", 300, "file-notepad/page-10-03.jpeg", "A natural jute document folder with a Warli-painted panel and inner pockets."],
      ["Jute Notepad Holder — Warli", 200, "file-notepad/page-10-06.jpeg", "A jute notepad holder with a hand-painted Warli panel."],
      ["Jute Folder with Zip", 350, "file-notepad/page-10-07.png", "A zipped jute folder with a Warli-painted panel — keeps papers secure."],
      ["Jute Notepad Holder", 150, "file-notepad/page-10-05.jpeg", "A plain natural jute notepad holder with a pen loop."],
    ],
  },
  {
    slug: "ishwari",
    name: "Ishwari",
    image: "/products/catalogue/gudi1.png",
    note: ISHWARI_NOTE,
    products: [
      ["Mango Leaf Toran", 200, "catalogue/mangoleaf.png", "A door toran of fabric mango leaves, made from temple-offered sarees."],
      ["Gudhi Vastra", 400, ["catalogue/gudi.png", "catalogue/gudi1.png"], "A festive vastra to dress the Gudhi for Gudi Padwa."],
      ["Toran", 350, "catalogue/toran.png", "A festive door toran crafted from recycled temple sarees."],
      ["Naivedya Paan", 299, "catalogue/naivedyapaan.png", "A decorative paan for the naivedya thali during puja."],
      ["Samai Stand Cover", 195, "catalogue/samaistand.png", "A fabric cover for the samai (oil lamp) stand."],
      ["Chaurang Cover", 450, "catalogue/chaurangcover.png", "A cover for the chaurang (low puja stool) with a saree border."],
      ["Cushion Cover", 200, "catalogue/cushioncover.png", "A cushion cover made from rich saree fabric."],
      ["Book Cover", 150, "catalogue/bookcover.png", "A fabric book cover for diaries and holy books."],
      ["Knot Bag", 150, "catalogue/knotbag.png", "A soft knot-handle bag in saree fabric."],
      ["Money Purse — Small", 180, "catalogue/moneypurse.png", "A zipped money purse in saree-border fabric. Small size."],
      ["Money Purse — Big", 240, "catalogue/moneypurse1.png", "A three-compartment money purse with a wrist loop. Big size."],
      ["Cloth Bag", 150, "catalogue/clothbag.png", "An everyday cloth tote with a saree-border band."],
      ["Shoulder Bag", 220, "catalogue/shoulderbag.png", "A sling shoulder bag with zipped pockets in saree fabric."],
      ["Single Saree Cover", 250, "catalogue/singlesareecover.png", "A zipped cover to store a single saree."],
      ["Quilted Bag", 350, "catalogue/quiltedbag.png", "A quilted handbag in saree fabric."],
      ["Table Mat", 150, "catalogue/tablematte.png", "A table mat made from saree fabric."],
      ["Table Runner with 4 Mats", 1025, "catalogue/tablerunnerwith4mattes.png", "A table runner with four matching mats — a complete festive table set."],
      ["Mini Gudhi", 200, "catalogue/minigudhi.png", "A small decorative Gudhi on a stand, in assorted colours."],
    ],
  },
];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SKU_PREFIX = { "warli-art": "WA", jute: "JU", cotton: "CO", "file-notepad": "FN", ishwari: "IS" };

async function run() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set in .env");
  await mongoose.connect(process.env.MONGODB_URI);

  let created = 0;
  let updated = 0;
  for (const cat of categories) {
    const category = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { name: cat.name, slug: cat.slug, isActive: true }, $setOnInsert: { image: cat.image } },
      { upsert: true, new: true }
    );

    for (const [i, [name, price, photos, blurb]] of cat.products.entries()) {
      const slug = slugify(name);
      const sku = `SEFD-${SKU_PREFIX[cat.slug]}-${String(i + 1).padStart(3, "0")}`;
      const existed = await Product.exists({ slug });
      const product = await Product.findOneAndUpdate(
        { slug },
        {
          $set: {
            category: category._id,
            name,
            slug,
            sku,
            price,
            shortDescription: blurb,
            longDescription: `${blurb}\n\n${cat.note}\n\n${IMPACT_NOTE}`,
            isActive: true,
          },
          $setOnInsert: { stock: DEFAULT_STOCK },
        },
        { upsert: true, new: true, runValidators: true }
      );
      existed ? updated++ : created++;

      // replace only the photos this script owns ("local:" ids)
      await ProductMedia.deleteMany({ product: product._id, publicId: /^local:/ });
      const list = Array.isArray(photos) ? photos : [photos];
      await ProductMedia.insertMany(
        list.map((p, n) => ({
          product: product._id,
          url: `/products/${p}`,
          publicId: `local:products/${p}`,
          sortOrder: n,
          isPrimary: n === 0,
        }))
      );
    }
    console.log(`✓ ${cat.name}: ${cat.products.length} products`);
  }

  // The shop's "Featured" order and the home page's featured strip are
  // newest-first. Stagger createdAt round-robin across categories so they show
  // a mix (Warli, Jute, Cotton, File, Ishwari, Warli, …) instead of one category.
  const base = Date.now();
  const longest = Math.max(...categories.map((c) => c.products.length));
  let rank = 0;
  for (let i = 0; i < longest; i++) {
    for (const cat of categories) {
      const item = cat.products[i];
      if (!item) continue;
      await Product.collection.updateOne(
        { slug: slugify(item[0]) },
        { $set: { createdAt: new Date(base - rank++ * 1000) } }
      );
    }
  }

  console.log(`Done — ${created} products created, ${updated} updated.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seeding failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
