const { PrismaClient } = require("@prisma/client");

const CATEGORY_IMAGES = {
  "ao-nam": [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80",
    "https://images.unsplash.com/photo-1620012253295-c15c429fbb18?w=800&q=80",
  ],
  "quan-nam": [
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
    "https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80",
    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80",
    "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=800&q=80",
  ],
  "ao-nu": [
    "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&q=80",
    "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&q=80",
    "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80",
    "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&q=80",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=80",
  ],
  "dam-vay": [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
  ],
  "quan-nu": [
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
    "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80",
    "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800&q=80",
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
  ],
  "ao-khoac-outerwear": [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80",
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80",
    "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80",
  ],
  "tui-xach-balo": [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
  ],
  "giay-dep": [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
  ],
  "phu-kien": [
    "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
    "https://images.unsplash.com/photo-1624823183493-5f63901b0f59?w=800&q=80",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
    "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
  ],
  "activewear": [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    "https://images.unsplash.com/photo-1483721074576-92cb77ef292a?w=800&q=80",
  ],
};

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Đang cập nhật ảnh sản phẩm theo danh mục chính xác...");
  const products = await prisma.product.findMany({
    select: {
      id: true,
      categoryId: true,
      category: {
        select: { slug: true }
      },
      images: {
        orderBy: { order: "asc" }
      }
    }
  });

  console.log(`Tìm thấy ${products.length} sản phẩm cần đồng bộ ảnh.`);
  let updatedCount = 0;

  for (let idx = 0; idx < products.length; idx++) {
    const product = products[idx];
    const catSlug = product.category?.slug || "ao-nam";
    const imgList = CATEGORY_IMAGES[catSlug] || CATEGORY_IMAGES["ao-nam"];

    const primaryImgUrl = imgList[idx % imgList.length];
    const secondaryImgUrl = imgList[(idx + 1) % imgList.length];

    if (product.images.length > 0) {
      // Cập nhật ảnh chính
      await prisma.productImage.update({
        where: { id: product.images[0].id },
        data: { url: primaryImgUrl, isPrimary: true }
      });

      // Cập nhật ảnh phụ nếu có
      if (product.images.length > 1) {
        await prisma.productImage.update({
          where: { id: product.images[1].id },
          data: { url: secondaryImgUrl, isPrimary: false }
        });
      }
    } else {
      // Tạo mới nếu chưa có
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: primaryImgUrl,
          order: 0,
          isPrimary: true,
          altText: "Ảnh sản phẩm chính"
        }
      });
    }

    updatedCount++;
    if (updatedCount % 200 === 0) {
      console.log(`Đã cập nhật ${updatedCount}/${products.length} sản phẩm...`);
    }
  }

  console.log(`🎉 Hoàn tất! Đã cập nhật ảnh chuẩn xác cho ${updatedCount} sản phẩm.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
