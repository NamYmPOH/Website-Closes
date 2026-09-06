import { PrismaClient, UserRole, CustomerTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu quá trình seed tài khoản người dùng...");

  // Mật khẩu mẫu
  const adminPasswordHash = await bcrypt.hash("AdminPassword@123", 10);
  const userPasswordHash = await bcrypt.hash("UserPassword@123", 10);
  const staffPasswordHash = await bcrypt.hash("StaffPassword@123", 10);

  // 1. Tài khoản Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@aurastudio.com" },
    update: {
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      customerTier: CustomerTier.VIP,
      loyaltyPointsBalance: 5000,
    },
    create: {
      email: "admin@aurastudio.com",
      name: "Quản Trị Viên (Admin)",
      phone: "0900000001",
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      customerTier: CustomerTier.VIP,
      loyaltyPointsBalance: 5000,
      cart: {
        create: {},
      },
    },
  });
  console.log(`✅ Tạo Admin thành công: ${admin.email} (${admin.role})`);

  // 2. Tài khoản User VIP: Nguyễn Văn An
  const user1 = await prisma.user.upsert({
    where: { email: "nguyenvanan@example.com" },
    update: {
      passwordHash: userPasswordHash,
      role: UserRole.CUSTOMER,
      customerTier: CustomerTier.VIP,
      loyaltyPointsBalance: 1250,
    },
    create: {
      email: "nguyenvanan@example.com",
      name: "Nguyễn Văn An",
      phone: "0912345678",
      passwordHash: userPasswordHash,
      role: UserRole.CUSTOMER,
      customerTier: CustomerTier.VIP,
      loyaltyPointsBalance: 1250,
      cart: {
        create: {},
      },
      addresses: {
        create: [
          {
            receiverName: "Nguyễn Văn An",
            phoneNumber: "0912345678",
            street: "123 Đường Nguyễn Huệ",
            ward: "Phường Bến Nghé",
            district: "Quận 1",
            city: "Hồ Chí Minh",
            province: "Hồ Chí Minh",
            country: "VN",
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Tạo User thành công: ${user1.email} (${user1.name})`);

  // 3. Tài khoản User Thường: Trần Thị Mai
  const user2 = await prisma.user.upsert({
    where: { email: "tranmai@example.com" },
    update: {
      passwordHash: userPasswordHash,
      role: UserRole.CUSTOMER,
      customerTier: CustomerTier.REGULAR,
      loyaltyPointsBalance: 300,
    },
    create: {
      email: "tranmai@example.com",
      name: "Trần Thị Mai",
      phone: "0987654321",
      passwordHash: userPasswordHash,
      role: UserRole.CUSTOMER,
      customerTier: CustomerTier.REGULAR,
      loyaltyPointsBalance: 300,
      cart: {
        create: {},
      },
      addresses: {
        create: [
          {
            receiverName: "Trần Thị Mai",
            phoneNumber: "0987654321",
            street: "45 Lê Duẩn",
            ward: "Phường Thạch Thang",
            district: "Hải Châu",
            city: "Đà Nẵng",
            province: "Đà Nẵng",
            country: "VN",
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Tạo User thành công: ${user2.email} (${user2.name})`);

  // 4. Tài khoản Nhân viên biên tập: Lê Hoàng (Staff)
  const staff = await prisma.user.upsert({
    where: { email: "staff@aurastudio.com" },
    update: {
      passwordHash: staffPasswordHash,
      role: UserRole.EDITOR,
      customerTier: CustomerTier.REGULAR,
      loyaltyPointsBalance: 500,
    },
    create: {
      email: "staff@aurastudio.com",
      name: "Lê Hoàng (Staff)",
      phone: "0900000002",
      passwordHash: staffPasswordHash,
      role: UserRole.EDITOR,
      customerTier: CustomerTier.REGULAR,
      loyaltyPointsBalance: 500,
      cart: {
        create: {},
      },
    },
  });
  console.log(`✅ Tạo Staff thành công: ${staff.email} (${staff.role})`);

  console.log("🎉 Hoàn tất quá trình seed dữ liệu người dùng!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
