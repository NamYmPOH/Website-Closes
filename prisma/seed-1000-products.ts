import { PrismaClient, ProductStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Hàm chuyển đổi tiếng Việt có dấu thành slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

import { CATEGORY_IMAGES } from "./category-images";

// Danh mục mẫu
const CATEGORIES_DATA = [
  { name: "Áo Nam", slug: "ao-nam", description: "Áo thun, sơ mi, polo và áo len nam phong cách tối giản" },
  { name: "Quần Nam", slug: "quan-nam", description: "Quần tây, quần jeans, chino và quần short nam" },
  { name: "Áo Nữ", slug: "ao-nu", description: "Áo kiểu, sơ mi lụa, áo croptop và thun nữ hiện đại" },
  { name: "Đầm & Váy", slug: "dam-vay", description: "Đầm maxi, đầm suông, đầm xòe và chân váy thanh lịch" },
  { name: "Quần Nữ", slug: "quan-nu", description: "Quần ống rộng, culottes, quần tây và jeans nữ tôn dáng" },
  { name: "Áo Khoác & Outerwear", slug: "ao-khoac-outerwear", description: "Blazer, trench coat, áo khoác gió và dạ mùa đông" },
  { name: "Túi Xách & Balo", slug: "tui-xach-balo", description: "Túi xách da, túi đeo chéo, túi tote và balo canvas" },
  { name: "Giày Dép Thời Trang", slug: "giay-dep", description: "Giày sneaker, loafer, mule và boots phong cách tối giản" },
  { name: "Phụ Kiện & Trang Sức", slug: "phu-kien", description: "Thắt lưng da, kính mát, nón và trang sức bạc tinh xảo" },
  { name: "Đồ Thể Thao & Activewear", slug: "activewear", description: "Trang phục thể thao thoáng khí, co giãn 4 chiều đa năng" },
];

// Thương hiệu mẫu
const BRANDS_DATA = [
  { name: "AURA Studio", slug: "aura-studio", description: "Thương hiệu thiết kế tối giản cao cấp" },
  { name: "Minimalist Co.", slug: "minimalist-co", description: "Trang phục thường nhật chuẩn phong cách Bắc Âu" },
  { name: "Nordic Line", slug: "nordic-line", description: "Đường nét tinh giản, chất liệu bền vững" },
  { name: "Urban Stitch", slug: "urban-stitch", description: "Thời trang đường phố hiện đại, trẻ trung" },
  { name: "Silk & Linen", slug: "silk-linen", description: "Chuyên các dòng sợi tự nhiên lụa và đũi cao cấp" },
  { name: "Luxe Essence", slug: "luxe-essence", description: "Thời trang công sở và dạ tiệc sang trọng" },
  { name: "Monochrome", slug: "monochrome", description: "Bộ sưu tập đơn sắc đen, trắng, xám bất hủ" },
  { name: "Zen Atelier", slug: "zen-atelier", description: "Sự hòa quyện giữa phong cách Nhật Bản và tối giản" },
];

// Bộ từ vựng để sinh 1000 sản phẩm đa dạng và độc đáo
const PRODUCT_TEMPLATES: Record<string, { baseNames: string[]; materials: string[]; fits: string[] }> = {
  "ao-nam": {
    baseNames: [
      "Áo Thun Cổ Tròn", "Áo Sơ Mi Oxford Dài Tay", "Áo Polo Dệt Pique", "Áo Sơ Mi Cổ Cubana",
      "Áo Thun Heavyweight", "Áo Len Cổ Lọ Dệt Kim", "Áo Hoodie Nỉ Bông", "Áo Sweatshirt Form Rộng",
      "Áo Sơ Mi Vải Linen", "Áo Tank Top Thể Thao", "Áo Thun Cotton Mercerized", "Áo Sơ Mi Họa Tiết Kẻ",
    ],
    materials: ["100% Cotton Organic", "Linen Pháp Tự Nhiên", "Cotton Compact 260GSM", "Modal Pha Lụa", "Wool Pha Acrylic"],
    fits: ["Relaxed Fit", "Slim-Fit", "Oversized", "Regular Fit", "Boxy Cut"],
  },
  "quan-nam": {
    baseNames: [
      "Quần Tây Xếp Ly 1 Ly", "Quần Chino Co Giãn", "Quần Jeans Dáng Suông", "Quần Short Kaki",
      "Quần Jogger Nỉ Cao Cấp", "Quần Linen Dáng Rộng", "Quần Âu Co Giãn Công Sở", "Quần Cargo Túi Hộp",
      "Quần Kaki Ống Đứng", "Quần Đũi Thắt Dây", "Quần Jeans Đen Nhám", "Quần Short Thể Thao Chạy Bộ",
    ],
    materials: ["Vải Kháng Nhăn Tuyết Mưa", "Cotton Twill Co Giãn", "Denim 12oz Không Phai", "Linen Thô Tự Nhiên", "Kaki Cotton 100%"],
    fits: ["Straight Leg", "Tapered Fit", "Relaxed Fit", "Slim Straight", "Wide Leg"],
  },
  "ao-nu": {
    baseNames: [
      "Áo Blouse Lụa Cổ V", "Áo Croptop Dệt Kim Gân", "Áo Sơ Mi Tay Bồng", "Áo Thun Cổ Vuông Retro",
      "Áo Hai Dây Satin", "Áo Cardigan Mỏng Dệt Kim", "Áo Peplum Tôn Dáng", "Áo Sơ Mi Dáng Rộng",
      "Áo Thun Trơn Basic", "Áo Yếm Cổ Tàu", "Áo Kiểu Nhún Bèo", "Áo Len Cổ Tim Dáng Lửng",
    ],
    materials: ["Lụa Tơ Tằm Nhân Tạo", "Cotton Spandex Co Giãn", "Voan Hàn Siêu Mềm", "Len Dệt Kim Mùa Thu", "Satin Bóng Nhẹ"],
    fits: ["Fitted", "Relaxed Fit", "Cropped Cut", "Loose Fit", "A-Line Cut"],
  },
  "dam-vay": {
    baseNames: [
      "Đầm Maxi Xếp Ly Xoè Nhẹ", "Đầm Suông Tencel Tối Giản", "Đầm Dự Tiệc Dáng Ôm", "Đầm Hai Dây Xẻ Tà",
      "Chân Váy Chữ A Xếp Ly", "Chân Váy Midi Lụa Satin", "Đầm Sơ Mi Thắt Đai", "Chân Váy Bút Chì Xẻ Sau",
      "Đầm Cổ Yếm Hở Lưng", "Đầm Babydoll Xòe Bồng", "Chân Váy Xòe Xếp Nếp", "Đầm Ôm Bodycon Thun Gân",
    ],
    materials: ["Vải Tencel Mềm Mát", "Satin Cao Cấp", "Vải Đũi Tự Nhiên", "Thun Ribbed Co Giãn", "Lụa Gấm Họa Tiết Chìm"],
    fits: ["Fit & Flare", "Empire Waist", "Straight Column", "Flared Hem", "Bodycon"],
  },
  "quan-nu": {
    baseNames: [
      "Quần Ống Rộng Lưng Cao", "Quần Culottes Linen", "Quần Tây Nữ Dáng Suông", "Quần Jeans Ống Đứng",
      "Quần Short Kaki Cạp Cao", "Quần Legging Co Giãn 4 Chiều", "Quần Suông Cạp Chun", "Quần Jeans Lưng Cao",
      "Quần Short Vải Linen", "Quần Loe Nhẹ Cổ Điển", "Quần Ống Túm Jogger Nữ", "Quần Kaki Túi Chéo",
    ],
    materials: ["Vải Trượt Hàn Cao Cấp", "Denim Cotton 100%", "Linen Mềm Rủ", "Thun Bamboo Siêu Co Giãn", "Kaki Cotton Dệt Chéo"],
    fits: ["High-Waisted", "Wide-Leg", "Ankle Cut", "Flared", "Bootcut"],
  },
  "ao-khoac-outerwear": {
    baseNames: [
      "Áo Blazer 2 Lớp Form Rộng", "Áo Trench Coat Dáng Dài", "Áo Khoác Gió Chống Nước", "Áo Khoác Dạ Wool Pha Len",
      "Áo Bomber Jacket Thể Thao", "Áo Khoác Bò Denim Classic", "Áo Cardigan Dày Vặn Thừng", "Áo Vest Gile Thanh Lịch",
      "Áo Khoác Phao Siêu Nhẹ", "Áo Khoác Da Biker Jacket", "Áo Blazer Đơn Sắc 1 Khuy", "Áo Măng Tô Kèm Đai",
    ],
    materials: ["Wool Blend 60% Dạ Len", "Poly Chống Thấm Nước Siêu Nhẹ", "Denim 14oz Cổ Điển", "Da PU Thuần Chay", "Vải Tuyết Mưa Lót Lụa"],
    fits: ["Structured Fit", "Oversized Silhouette", "Classic Cut", "Relaxed Draped", "Tailored"],
  },
  "tui-xach-balo": {
    baseNames: [
      "Túi Tote Canvas Hữu Cơ", "Túi Đeo Chéo Da Thuần Chay", "Balo Laptop Chống Thấm 15.6 Inch", "Túi Kẹp Nách Da Mềm",
      "Ví Cầm Tay Da Thật Tối Giản", "Túi Du Lịch Weekender Canvas", "Túi Đeo Vai Phom Vuông", "Balo Mini Dạo Phố",
      "Túi Hộp Tròn Cầm Tay", "Túi Đeo Bụng Fanny Pack", "Túi Bao Tử Unisex", "Ví Đựng Thẻ Cardholder Da Bò",
    ],
    materials: ["Da Thuần Chay Cao Cấp", "Canvas Cotton 16oz Dày Dặn", "Vải Oxford 900D Kháng Nước", "Da Bò Sáp Nguyên Tấm", "Nylon Tái Chế Cordura"],
    fits: ["One Size", "Tiêu chuẩn", "Compact", "Đa ngăn tiện ích", "Dung tích lớn"],
  },
  "giay-dep": {
    baseNames: [
      "Giày Sneaker Da Tối Giản Trắng", "Giày Loafer Da Bóng Đế Bằng", "Giày Mule Da Mềm Hở Gót", "Dép Quai Ngang Da Thật",
      "Giày Cao Gót Mũi Nhọn 5cm", "Giày Chelsea Boots Cổ Thấp", "Giày Sandal Dây Mảnh", "Giày Derby Da Buộc Dây",
      "Dép Xỏ Ngón Đúc Nguyên Khối", "Giày Búp Bê Mũi Tròn", "Giày Slip-on Vải Canvas", "Giày Oxford Đế Cao Su",
    ],
    materials: ["Da Bò Thật 100%", "Da PU Chống Thấm", "Đế Cao Su Đúc Chống Trượt", "Lót Mút Bọt Biển Êm Chân", "Canvas Thoáng Khí"],
    fits: ["True to Size", "Form Tiêu Chuẩn Châu Á", "Form Rộng Thoải Mái", "Đế Cao 3-5cm", "Đế Bằng Bền Chắc"],
  },
  "phu-kien": {
    baseNames: [
      "Thắt Lưng Da Khóa Kim Loại Tối Giản", "Kính Mát Polarized Chống UV400", "Khăn Choàng Lụa Họa Tiết Hình Học",
      "Mũ Bucket Vải Kaki Thêu Chữ", "Vòng Cổ Bạc Ý S925 Tối Giản", "Khuyên Tai Bạc Tròn Mini",
      "Vòng Đeo Tay Chuỗi Xích Mảnh", "Mũ Lưỡi Trai Classic Washed", "Ví Đựng Hộ Chiếu Da Thật", "Cà Vạt Lụa Dệt Tinh Xảo",
      "Kẹp Cà Vạt Kim Loại Mạ Bạc", "Khăn Bandana Cotton Phối Màu",
    ],
    materials: ["Bạc Ý S925 Mạ Bạch Kim", "Da Bò Nhập Khẩu", "Tròng Kính Polycarbonate Chống Chói", "Lụa Tơ Tằm Tự Nhiên", "Hợp Kim Chống Rỉ"],
    fits: ["Free Size", "Có thể điều chỉnh", "Tiêu chuẩn", "Tối giản hiện đại", "Thanh lịch"],
  },
  "activewear": {
    baseNames: [
      "Áo Thun Thể Thao Quick-Dry", "Quần Biker Short Nâng Mông", "Áo Bra Thể Thao Nâng Đỡ Tối Đa", "Quần Track Pants Ống Suông",
      "Áo Khoác Chạy Bộ Gió Siêu Nhẹ", "Quần Legging Cạp Cao Tập Yoga", "Áo Tank Top Thể Thao Khoét Nách", "Bộ Đồ Tập Gym Liền Thân",
      "Quần Short 2 Lớp Chạy Bộ", "Áo Thun Dài Tay Giữ Nhiệt", "Băng Đô Thể Thao Thấm Mồ Hôi", "Tất Thể Thao Cổ Cao Dệt Đệm",
    ],
    materials: ["Polyester Tái Chế Khô Nhanh", "Nylon Spandex Co Giãn 4 Chiều", "Vải Dệt Kháng Khuẩn Khử Mùi", "CoolMax Thoáng Khí Siêu Tốc", "Sợi Giữ Nhiệt Heattech"],
    fits: ["Compression Fit", "Athletic Cut", "High Support", "Breathable Fit", "Ultra Stretch"],
  },
};

const ADJECTIVES = [
  "Signature", "Minimalist", "Essential", "Modern", "Classic", "Premium Line",
  "Eco-Conscious", "Relaxed Fit", "Nordic Pure", "Urban Chic", "Timeless",
  "Bespoke Series", "Airy Lightweight", "Tailored Elegance", "Luxe Edition",
  "All-Day Comfort", "Soft Touch", "Monochrome", "Clean Cut", "Versatile"
];

const COLORS = [
  { name: "Đen Tuyền (Midnight Black)", hex: "#111111" },
  { name: "Trắng Tinh Khôi (Pure White)", hex: "#FFFFFF" },
  { name: "Be Tự Nhiên (Oatmeal Beige)", hex: "#E3DAC9" },
  { name: "Xám Khói (Heather Grey)", hex: "#8E9297" },
  { name: "Xanh Navy Đậm (Deep Navy)", hex: "#001F3F" },
  { name: "Xanh Rêu (Earthy Olive)", hex: "#556B2F" },
  { name: "Nâu Cà Phê (Espresso Brown)", hex: "#4A3525" },
  { name: "Hồng Phấn (Soft Blush)", hex: "#FFD1DC" },
];

const SIZES = ["S", "M", "L", "XL"];

async function main() {
  console.log("🚀 Bắt đầu quá trình nạp 1,000 sản phẩm vào cơ sở dữ liệu Supabase...");

  // 1. Tạo hoặc Cập nhật 10 Danh Mục
  console.log("📁 Đang kiểm tra và tạo 10 Danh mục...");
  const categories: Record<string, string> = {};
  for (const cat of CATEGORIES_DATA) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isPopular: true,
      },
    });
    categories[cat.slug] = record.id;
  }
  console.log("✅ Đã chuẩn bị sẵn 10 Danh mục.");

  // 2. Tạo hoặc Cập nhật 8 Thương Hiệu
  console.log("🏷️ Đang kiểm tra và tạo 8 Thương hiệu...");
  const brandIds: string[] = [];
  for (const brand of BRANDS_DATA) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, description: brand.description },
      create: {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
      },
    });
    brandIds.push(record.id);
  }
  console.log("✅ Đã chuẩn bị sẵn 8 Thương hiệu.");

  // 3. Sinh dữ liệu 1,000 sản phẩm (10 danh mục x 100 sản phẩm = 1,000)
  console.log("⚡ Đang sinh dữ liệu 1,000 sản phẩm thời trang phong cách tối giản...");

  const productsToInsert: any[] = [];
  const imagesToInsert: any[] = [];
  const variantsToInsert: any[] = [];

  let productCounter = 0;
  const targetPerCategory = 100; // 10 danh mục * 100 = 1,000 sản phẩm

  for (const cat of CATEGORIES_DATA) {
    const template = PRODUCT_TEMPLATES[cat.slug];
    const categoryId = categories[cat.slug];

    for (let i = 0; i < targetPerCategory; i++) {
      productCounter++;
      const productId = `prod_${crypto.randomBytes(8).toString("hex")}`;

      const baseName = template.baseNames[i % template.baseNames.length];
      const adj = ADJECTIVES[(i + productCounter) % ADJECTIVES.length];
      const material = template.materials[i % template.materials.length];
      const fit = template.fits[i % template.fits.length];
      const brandId = brandIds[i % brandIds.length];

      // Đặt tên sản phẩm ấn tượng, chuẩn thời trang cao cấp
      const title = `${baseName} ${adj} (${material.split(" ")[0]})`;
      const uniqueSlug = `${slugify(title)}-${productCounter}`;

      // Giá tiền logic thực tế (từ 250,000 VND đến 2,850,000 VND)
      const rawPrice = 250000 + (productCounter * 17937) % 2400000;
      const basePrice = Math.round(rawPrice / 10000) * 10000; // Làm tròn đến hàng chục nghìn
      const hasDiscount = i % 3 === 0;
      const compareAtPrice = hasDiscount ? Math.round((basePrice * 1.25) / 10000) * 10000 : null;

      const salesCount = (productCounter * 7) % 450 + 10;
      const rating = 4.2 + ((productCounter * 3) % 8) / 10;
      const reviewCount = (productCounter * 4) % 85 + 5;

      const shortDesc = `${title} với thiết kế tối giản tinh tế, chuẩn phom ${fit}, may đo từ sợi ${material} mang lại cảm giác thoải mái suốt cả ngày.`;

      const descriptionHtml = `
        <div class="product-description space-y-4">
          <p class="lead">${shortDesc}</p>
          <h3>Điểm nổi bật của sản phẩm:</h3>
          <ul>
            <li><strong>Chất liệu:</strong> ${material} chọn lọc cao cấp, bền màu và thoáng mát tối đa.</li>
            <li><strong>Phom dáng:</strong> ${fit} tôn lên nét thanh lịch, hiện đại theo phong cách tối giản Bắc Âu.</li>
            <li><strong>Đường may:</strong> Tỉ mỉ 5 mũi/cm, đường chỉ may đôi gia cố chắc chắn ở các điểm chịu lực.</li>
            <li><strong>Ứng dụng:</strong> Dễ dàng phối trang phục cho cả ngày đi làm, dạo phố hoặc gặp gỡ đối tác.</li>
          </ul>
          <h3>Hướng dẫn bảo quản:</h3>
          <p>Giặt máy ở chế độ nhẹ nhàng với nước lạnh. Tránh sấy nhiệt độ cao và không dùng chất tẩy mạnh.</p>
        </div>
      `;

      productsToInsert.push({
        id: productId,
        title,
        slug: uniqueSlug,
        shortDescription: shortDesc,
        descriptionHtml,
        basePrice,
        compareAtPrice,
        status: ProductStatus.PUBLISHED,
        isFeatured: i % 8 === 0,
        isTrending: i % 6 === 0,
        isNewArrival: i % 4 === 0,
        salesCount,
        averageRating: Number(rating.toFixed(1)),
        reviewCount,
        categoryId,
        brandId,
        keywords: [cat.name, adj, fit, "thời trang tối giản", "AURA", "cao cấp"],
        specifications: {
          "Chất liệu": material,
          "Kiểu dáng": fit,
          "Xuất xứ": "Việt Nam",
          "Thương hiệu": BRANDS_DATA[i % BRANDS_DATA.length].name,
          "Bảo hành": "Đổi trả miễn phí 30 ngày",
        },
      });

      // Ảnh sản phẩm chuẩn xác theo danh mục (1 ảnh chính + 1-2 ảnh phụ)
      const catImages = CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES["ao-nam"];
      const primaryImgIdx = i % catImages.length;
      const secondaryImgIdx = (i + 1) % catImages.length;
      const thirdImgIdx = (i + 2) % catImages.length;

      imagesToInsert.push({
        id: `img_${crypto.randomBytes(8).toString("hex")}`,
        productId,
        url: catImages[primaryImgIdx],
        altText: `${title} - Mặt trước`,
        order: 0,
        isPrimary: true,
      });

      imagesToInsert.push({
        id: `img_${crypto.randomBytes(8).toString("hex")}`,
        productId,
        url: catImages[secondaryImgIdx],
        altText: `${title} - Chi tiết chất liệu`,
        order: 1,
        isPrimary: false,
      });

      if (i % 2 === 0) {
        imagesToInsert.push({
          id: `img_${crypto.randomBytes(8).toString("hex")}`,
          productId,
          url: catImages[thirdImgIdx],
          altText: `${title} - Phối cảnh người mẫu`,
          order: 2,
          isPrimary: false,
        });
      }

      // Biến thể (Variants: kết hợp Màu sắc & Size)
      const selectedColors = [
        COLORS[(i + 1) % COLORS.length],
        COLORS[(i + 2) % COLORS.length],
      ];

      for (let c = 0; c < selectedColors.length; c++) {
        const col = selectedColors[c];
        for (let s = 0; s < SIZES.length; s++) {
          const sz = SIZES[s];
          const sku = `SKU-${productCounter.toString().padStart(4, "0")}-${c === 0 ? "A" : "B"}-${sz}`;
          const stock = (productCounter * 3 + s * 7) % 60 + 10;

          variantsToInsert.push({
            id: `var_${crypto.randomBytes(8).toString("hex")}`,
            productId,
            sku,
            price: basePrice,
            compareAtPrice,
            stockQuantity: stock,
            lowStockThreshold: 5,
            attributes: {
              color: col.name,
              size: sz,
            },
            image: c === 0 ? catImages[primaryImgIdx] : catImages[secondaryImgIdx],
          });
        }
      }
    }
  }

  console.log(`📦 Đã tạo sẵn cấu trúc dữ liệu cho:`);
  console.log(`   - ${productsToInsert.length} Sản phẩm`);
  console.log(`   - ${imagesToInsert.length} Ảnh chi tiết`);
  console.log(`   - ${variantsToInsert.length} Biến thể tồn kho`);

  // 4. Batch Insert theo Chunks tuân thủ Supabase Postgres Best Practices
  const BATCH_SIZE = 250;

  console.log("\n📥 Đang thực hiện Batch Insert Products vào cơ sở dữ liệu...");
  for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
    const chunk = productsToInsert.slice(i, i + BATCH_SIZE);
    await prisma.product.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`   ➜ Đã chèn sản phẩm: ${Math.min(i + BATCH_SIZE, productsToInsert.length)}/${productsToInsert.length}`);
  }

  console.log("\n🖼️ Đang thực hiện Batch Insert Product Images...");
  for (let i = 0; i < imagesToInsert.length; i += 500) {
    const chunk = imagesToInsert.slice(i, i + 500);
    await prisma.productImage.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`   ➜ Đã chèn hình ảnh: ${Math.min(i + 500, imagesToInsert.length)}/${imagesToInsert.length}`);
  }

  console.log("\n🎨 Đang thực hiện Batch Insert Product Variants...");
  for (let i = 0; i < variantsToInsert.length; i += 500) {
    const chunk = variantsToInsert.slice(i, i + 500);
    await prisma.productVariant.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`   ➜ Đã chèn biến thể: ${Math.min(i + 500, variantsToInsert.length)}/${variantsToInsert.length}`);
  }

  // 5. Kiểm đếm kết quả thực tế từ Database
  const finalCount = await prisma.product.count();
  const finalImages = await prisma.productImage.count();
  const finalVariants = await prisma.productVariant.count();

  console.log("\n=======================================================");
  console.log("🎉 HOÀN TẤT THÊM 1,000 SẢN PHẨM VÀO DATABASE THÀNH CÔNG!");
  console.log(`   - Tổng số sản phẩm trong DB: ${finalCount.toLocaleString()} sản phẩm`);
  console.log(`   - Tổng số hình ảnh trong DB: ${finalImages.toLocaleString()} ảnh`);
  console.log(`   - Tổng số biến thể trong DB: ${finalVariants.toLocaleString()} SKU`);
  console.log("=======================================================");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi chèn 1,000 sản phẩm:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
