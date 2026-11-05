(function () {
  const memoryStore = window.__KAT_MEMORY_STORE || (window.__KAT_MEMORY_STORE = {});
  function storageRead(key) {
    if (Object.prototype.hasOwnProperty.call(memoryStore, key)) return memoryStore[key];
    try { return localStorage.getItem(key); }
    catch (error) { return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null; }
  }
  function storageWrite(key, value) {
    try { localStorage.setItem(key, value); delete memoryStore[key]; return true; }
    catch (error) { memoryStore[key] = value; return false; }
  }
  window.KAT_STORES = [
    { id: "store-1", name: "Cơ sở chính (Trụ sở chính)", shortLabel: "Cơ sở chính", address: "273 An Dương Vương, Phường Chợ Quán (Quận 5 cũ), TP. HCM", hours: "8:00–18:00", mapUrl: "https://www.google.com/search?kgmid=%2Fg%2F11pkgcpdtw" },
    { id: "store-2", name: "Cơ sở 1", shortLabel: "Cơ sở 1", address: "105 Bà Huyện Thanh Quan, Phường Xuân Hòa (Quận 3 cũ), TP. HCM", hours: "8:00–18:00", mapUrl: "https://www.google.com/search?kgmid=%2Fg%2F11ckr49q08" }
  ];
  window.KAT_CONTACT = {
    phone: "0901 234 567",
    phoneHref: "+84901234567",
    email: "hello@kat.example",
    zaloUrl: "https://zalo.me/kat-anvat-demo",
    facebookUrl: "https://www.facebook.com/kat.anvat.page.demo.2026",
    hours: "8:00–18:00"
  };
  const seed = {
    categories: [
      { id: "cat_all", name: "Tất cả món", icon: "mon-an" },
      { id: "cat_banhtrang", name: "Bánh tráng & món trộn", icon: "mon-an" },
      { id: "cat_fried", name: "Gà rán & đồ chiên", icon: "mon-an" },
      { id: "cat_savoury", name: "Món mặn ăn vặt", icon: "mon-an" },
      { id: "cat_dessert", name: "Đồ ngọt & tráng miệng", icon: "mon-an" },
      { id: "cat_drink", name: "Trà sữa & trà pha", icon: "mon-an" },
      { id: "cat_soda", name: "Nước ngọt lon", icon: "mon-an" }
    ],
    foodOptions: {
      spice: ["Không cay", "Cay vừa (Tiêu chuẩn)", "Siêu cay xé lưỡi"],
      toppings: [
        { name: "Thêm phô mai sợi", price: 5000 },
        { name: "Thêm khô bò xé cay", price: 7000 },
        { name: "Thêm trứng cút 3 quả", price: 5000 },
        { name: "Thêm xúc xích nướng", price: 6000 },
        { name: "Tép rim mỡ hành", price: 5000 }
      ]
    },
    drinkOptions: {
      sweetness: ["30% Đường", "50% Đường (Tiêu chuẩn)", "100% Đường"],
      ice: ["Ít đá", "Đá bình thường (Tiêu chuẩn)", "Không đá"],
      toppings: [
        { name: "Trân châu đường đen", price: 5000 },
        { name: "Thạch phô mai tươi", price: 7000 },
        { name: "Kem cheese béo mặn", price: 8000 },
        { name: "Pudding trứng mịn", price: 6000 }
      ]
    },
    products: [
      { id: "PROD_101", name: "Bánh tráng", categoryId: "cat_banhtrang", categoryType: "food", price: 15000, image: "images/banh-trang-tron.jpg", description: "Bánh tráng giòn dai, trộn sốt me chua ngọt và rau thơm.", customization: "food", variants: [{ id: "tron", name: "Bánh tráng trộn", price: 25000, image: "images/banh-trang-tron.jpg" }, { id: "cuon-bo-me", name: "Bánh tráng cuốn bơ me", price: 20000, image: "images/banh-trang-cuon-bo-me.jpg" }, { id: "cham-tac-bo", name: "Bánh tráng chấm tắc bơ", price: 15000, image: "images/banh-trang-cuon-tac-bo.jpg" }, { id: "chien-muoi-ot", name: "Bánh tráng chiên muối ớt", price: 15000, image: "images/banh-trang-chien-muoi-ot.png" }, { id: "phoi-suong", name: "Bánh tráng phơi sương hành phi", price: 15000, image: "images/banh-trang-phoi-suong-hanh-phi.jpg" }, { id: "cuon-tom-hanh", name: "Bánh tráng cuộn tôm hành", price: 15000, image: "images/banh-trang-cuon-tom-hanh.jpg" }], rating: 0, reviewsCount: 0, status: true, isHot: true },
      { id: "PROD_102", name: "Chân gà sả tắc", categoryId: "cat_savoury", categoryType: "food", price: 45000, image: "images/chan-ga-sa-tac.jpg", description: "Chân gà giòn dai, thấm vị sả tắc chua cay.", rating: 0, reviewsCount: 0, status: true, isHot: true },
      { id: "PROD_103", name: "Cơm cháy chà bông mắm hành", categoryId: "cat_savoury", categoryType: "food", price: 20000, image: "images/com-chay-cha-bong-mam-hanh.jpg", description: "Cơm cháy giòn rụm, phủ chà bông và mắm hành thơm.", rating: 0, reviewsCount: 0, status: true, isHot: true },
      { id: "PROD_104", name: "Gà rán", categoryId: "cat_fried", categoryType: "food", price: 30000, image: "images/ga-ran-truyen-thong.jpg", description: "Gà vàng giòn bên ngoài, mềm ngọt bên trong.", variants: [{ id: "truyen-thong", name: "Gà rán truyền thống", price: 30000, image: "images/ga-ran-truyen-thong.jpg" }, { id: "dui-sot-cay", name: "Đùi gà sốt cay", price: 35000, image: "images/dui-ga-sot-cay.jpg" }, { id: "canh-mam-toi", name: "Cánh gà mắm tỏi", price: 35000, image: "images/canh-ga-mam-toi.webp" }], rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_105", name: "Gà viên lắc phô mai", categoryId: "cat_fried", categoryType: "food", price: 25000, image: "images/ga-vien-lac-pho-mai.jpg", description: "Gà viên giòn thơm, áo phô mai béo mặn.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_106", name: "Khoai tây", categoryId: "cat_fried", categoryType: "food", price: 18000, image: "images/khoai-tay-chien.webp", description: "Khoai tây vàng giòn, thơm vị phô mai.", variants: [{ id: "chien", name: "Khoai tây chiên", price: 18000, image: "images/khoai-tay-chien.webp" }, { id: "lac-pho-mai", name: "Khoai tây lắc phô mai", price: 18000, image: "images/khoai-tay-lac-pho-mai.jpeg" }, { id: "loc-xoay", name: "Khoai tây lốc xoáy", price: 18000, image: "images/khoai-tay-loc-xoay.jpeg" }], rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_107", name: "Xúc xích Đức", categoryId: "cat_fried", categoryType: "food", price: 15000, image: "images/xuc-xich-duc.jpg", description: "Xúc xích Đức dai giòn, thơm vị thịt nướng.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_108", name: "Mẹt viên chiên", categoryId: "cat_fried", categoryType: "food", price: 35000, image: "images/met-vien-chien-nho.jpg", description: "Mẹt viên chiên nóng giòn, đủ vị chấm tương.", variants: [{ id: "nho", name: "Mẹt viên chiên nhỏ", price: 35000, image: "images/met-vien-chien-nho.jpg" }, { id: "lon", name: "Mẹt viên chiên lớn", price: 55000, image: "images/met-vien-chien-lon.jpg" }], rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_109", name: "Nem chua rán", categoryId: "cat_fried", categoryType: "food", price: 30000, image: "images/nem-chua-ran.jpg", description: "Nem chua rán chua nhẹ, lớp vỏ vàng giòn.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_110", name: "Phô mai que", categoryId: "cat_fried", categoryType: "food", price: 20000, image: "images/pho-mai-que.jpg", description: "Vỏ giòn rụm, phô mai bên trong kéo sợi.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_111", name: "Hồ lô chiên", categoryId: "cat_fried", categoryType: "food", price: 20000, image: "images/ca-vien-chien-4-vien.webp", description: "Hồ lô chiên thơm ngọt, vàng giòn nóng hổi.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_112", name: "Mì trộn tóp mỡ lòng đào", categoryId: "cat_banhtrang", categoryType: "food", price: 25000, image: "images/mi-tron-top-mo-long-dao.jpg", description: "Mì trộn đậm đà, tóp mỡ giòn và trứng lòng đào.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_113", name: "Gỏi xoài khô bò", categoryId: "cat_banhtrang", categoryType: "food", price: 25000, image: "images/banh-trang-tron.jpg", description: "Xoài xanh chua giòn, trộn khô bò cay và rau thơm.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_114", name: "Phá lấu tai heo kèm bánh mì", categoryId: "cat_savoury", categoryType: "food", price: 35000, image: "images/pha-lau-tai-heo-kem-banh-mi.jpg", description: "Phá lấu tai heo béo thơm, chấm bánh mì giòn.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_115", name: "Bánh flan cốt dừa", categoryId: "cat_dessert", categoryType: "food", price: 12000, image: "images/banh-flan.jpg", description: "Bánh flan mềm mịn, thơm béo vị cốt dừa.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_116", name: "Sữa chua", categoryId: "cat_dessert", categoryType: "food", price: 10000, image: "images/sua-chua-deo-sot-trai-cay.webp", description: "Sữa chua mát dịu, chọn trái cây hoặc phô mai.", variants: [{ id: "deo-trai-cay", name: "Sữa chua dẻo sốt trái cây", price: 15000, image: "images/sua-chua-deo-sot-trai-cay.webp" }, { id: "pho-mai", name: "Sữa chua phô mai", price: 10000, image: "images/sua-chua-pho-mai.jpg" }], rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_117", name: "Chè khúc bạch", categoryId: "cat_dessert", categoryType: "food", price: 20000, image: "images/che-khuc-bach.webp", description: "Chè khúc bạch mềm mát, ngọt thanh hạnh nhân.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_118", name: "Tàu hũ trân châu đường đen", categoryId: "cat_dessert", categoryType: "food", price: 15000, image: "images/tau-hu-chan-chau-duong-den.webp", description: "Tàu hũ mềm mịn, ăn cùng trân châu đường đen.", rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_119", name: "Trà sữa & sữa tươi", categoryId: "cat_drink", categoryType: "drink", price: 20000, image: "images/tra-sua-truyen-thong.jpg", description: "Trà sữa thơm béo, chọn Thái xanh, Thái đỏ hoặc truyền thống.", customization: "drink", variants: [{ id: "truyen-thong", name: "Trà sữa truyền thống", price: 20000, image: "images/tra-sua-truyen-thong.jpg" }, { id: "thai-xanh", name: "Trà sữa Thái xanh", price: 20000, image: "images/tra-sua-thai-xanh.jpg" }, { id: "thai-do", name: "Trà sữa Thái đỏ", price: 20000, image: "images/tra-sua-thai-do.jpg" }, { id: "sua-tuoi", name: "Sữa tươi trân châu đường đen", price: 20000, image: "images/sua-tuoi-tran-chau-duong-den.jpg" }], rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_120", name: "Trà pha tại quán", categoryId: "cat_drink", categoryType: "drink", price: 12000, image: "images/hong-tra-tac-mat-ong.jpg", description: "Trà tắc mật ong chua ngọt, trà đào thơm cam sả.", variants: [{ id: "hong-tra-tac", name: "Hồng trà tắc mật ong", price: 12000, image: "images/hong-tra-tac-mat-ong.jpg" }, { id: "chanh-sa", name: "Trà chanh sả đá xay", price: 15000, image: "images/tra-chanh-sa-da-xay.jpg" }, { id: "dao-cam-sa", name: "Trà đào cam sả", price: 20000, image: "images/tra-dao-cam-sa.jpg" }], rating: 0, reviewsCount: 0, status: true, isHot: false },
      { id: "PROD_121", name: "Nước ngọt lon", categoryId: "cat_soda", categoryType: "drink", price: 12000, image: "images/cola-vi-nguyen-ban.webp", description: "Nước ngọt mát lạnh, nhiều thương hiệu và vị không đường.", variants: [{ id: "coca", name: "Coca Cola vị nguyên bản", price: 12000, image: "images/cola-vi-nguyen-ban.webp" }, { id: "coca-zero", name: "Coca Cola Zero (không đường)", price: 12000, image: "images/cola-zero.webp" }, { id: "pepsi", name: "Pepsi vị nguyên bản", price: 12000, image: "images/pepsi-nguyen-ban.jpg" }, { id: "pepsi-zero", name: "Pepsi Không Calo", price: 12000, image: "images/pepsi-khong-calo.jpg" }, { id: "7up", name: "7Up vị chanh", price: 12000, image: "images/7up-chanh.jpg" }, { id: "sprite", name: "Sprite vị chanh", price: 12000, image: "images/sprite-chanh.webp" }, { id: "mirinda-cam", name: "Mirinda vị cam", price: 12000, image: "images/mirinda-cam.webp" }, { id: "mirinda-xa-xi", name: "Mirinda vị xá xị", price: 12000, image: "images/mirinda-xa-xi.jpg" }, { id: "sting", name: "Sting dâu đỏ", price: 12000, image: "images/sting-dau.webp" }, { id: "khong-do", name: "Trà xanh Không Độ", price: 12000, image: "images/tra-xanh-khong-do.jpg" }, { id: "c2", name: "Trà xanh C2 vị chanh", price: 12000, image: "images/tra-xanh-c2.webp" }, { id: "redbull", name: "Nước tăng lực Redbull", price: 15000, image: "images/red-bull.webp" }], rating: 0, reviewsCount: 0, status: true, isHot: false }
    ],
    combos: [
      { id: "COMBO_001", group: "solo", name: "Combo Đơn Độc", price: 32000, originalPrice: 40000, drinkCount: 1, image: "images/banh-trang-tron.jpg", items: ["1 Bánh tráng trộn", "1 Nước tự chọn"] },
      { id: "COMBO_002", group: "solo", name: "Combo Điểm Tâm Vặt", price: 40000, originalPrice: 48000, drinkCount: 1, image: "images/khoai-tay-lac-pho-mai.jpeg", items: ["1 Xúc xích Đức", "1 Khoai tây lắc phô mai", "1 Nước tự chọn"] },
      { id: "COMBO_003", group: "solo", name: "Combo Đói Bụng", price: 34000, originalPrice: 40000, drinkCount: 1, image: "images/mi-tron-top-mo-long-dao.jpg", items: ["1 Mì trộn tóp mỡ lòng đào", "1 Nước tự chọn"] },
      { id: "COMBO_004", group: "friends", name: "Combo Bạn Thân", price: 72000, originalPrice: 90000, drinkCount: 2, image: "images/met-vien-chien-nho.jpg", items: ["1 Bánh tráng trộn", "1 Mẹt viên chiên nhỏ", "2 Nước tự chọn"] },
      { id: "COMBO_005", group: "friends", name: "Combo Ăn Ý", price: 78000, originalPrice: 108000, drinkCount: 2, image: "images/ga-ran-truyen-thong.jpg", items: ["1 Gà rán truyền thống", "1 Khoai tây chiên", "1 Nem chua rán", "2 Nước tự chọn"] },
      { id: "COMBO_006", group: "friends", name: "Combo Ngọt Ngào", price: 58000, originalPrice: 59000, drinkCount: 1, image: "images/banh-flan.jpg", items: ["1 Bánh tráng cuốn bơ me", "2 Bánh flan cốt dừa", "1 Nước tự chọn"] },
      { id: "COMBO_007", group: "party", name: "Combo Đã Đời", serving: "3–4 người", price: 125000, originalPrice: 155000, drinkCount: 2, image: "images/met-vien-chien-lon.jpg", items: ["1 Chân gà sả tắc", "1 Bánh tráng trộn", "1 Mẹt viên chiên lớn", "2 Nước tự chọn"] },
      { id: "COMBO_008", group: "party", name: "Combo Gà Rán Phủ Phê", serving: "3–4 người", price: 92000, originalPrice: 133000, drinkCount: 0, image: "images/ga-ran-truyen-thong.jpg", items: ["2 Gà rán truyền thống", "2 Xúc xích Đức", "1 Gà viên lắc phô mai", "1 Khoai tây chiên"] },
      { id: "COMBO_009", group: "party", name: "Combo Quét Sạch Menu", serving: "5–6 người", price: 215000, originalPrice: 235000, drinkCount: 4, image: "images/banh-trang-tron.jpg", items: ["1 Chân gà sả tắc", "1 Mẹt viên chiên lớn", "1 Mì trộn tóp mỡ lòng đào", "1 Gỏi xoài khô bò", "2 Bánh tráng trộn", "4 Nước tự chọn"] }
    ],
    cart: [],
    vouchers: [
      { code: "KATKHAITRUONG", name: "Mừng Kat khai trương", type: "percent", value: 15, maxDiscount: 20000, minOrder: 50000, description: "Giảm 15% cho đơn ăn vặt đầu tiên tại Kat.", isActive: true, isPublic: true },
      { code: "QUANMOICUA", name: "Ưu đãi quán mới", type: "fixed", value: 10000, maxDiscount: 0, minOrder: 40000, description: "Bớt 10.000đ khi đơn hàng đạt mức tối thiểu.", isActive: true, isPublic: true },
      { code: "ANVATMOI", name: "Mừng ngày mở quán", type: "shipping", value: 20000, maxDiscount: 0, minOrder: 35000, description: "Hỗ trợ phí giao hàng cho đơn khai trương.", isActive: true, isPublic: true }
    ],
    orders: [],
    reviews: [],
    feedback: [],
    users: [
      { id: "USR_ADMIN_01", username: "0900000000", password: "admin123", fullname: "Quản trị viên Kat", phone: "0900000000", address: "", role: "admin", isActive: true },
      { id: "USR_USER_01", username: "0912345678", password: "123456", fullname: "Khách hàng mẫu", phone: "0912345678", address: "", role: "user", isActive: true }
    ]
  };

  seed.products.forEach(function (product) {
    if (["cat_banhtrang", "cat_fried", "cat_savoury"].includes(product.categoryId)) product.customization = "food";
    if (product.categoryId === "cat_drink" && product.id !== "PROD_121") product.customization = "drink";
  });

  const previousProducts = (function () {
    try { return JSON.parse(storageRead("products") || "null"); }
    catch (error) { return null; }
  })();
  const previousCategories = (function () {
    try { return JSON.parse(storageRead("categories") || "null"); }
    catch (error) { return null; }
  })();
  const previousCombos = (function () {
    try { return JSON.parse(storageRead("combos") || "null"); }
    catch (error) { return null; }
  })();
  const previousUsers = (function () {
    try { return JSON.parse(storageRead("users") || "null"); }
    catch (error) { return null; }
  })();
  const legacyProductIds = ["PROD_001", "PROD_002", "PROD_003", "PROD_004", "PROD_005", "PROD_006", "PROD_007", "PROD_008", "PROD_009", "PROD_010"];
  const seedProductIds = seed.products.map(function (product) { return product.id; });
  const defaultProductIds = legacyProductIds.concat(seedProductIds);
  const defaultCategoryIds = ["cat_all", "cat_banhtrang", "cat_chicken", "cat_fried", "cat_savoury", "cat_dessert", "cat_drink", "cat_soda", "cat_chiennuong", "cat_monno", "cat_nuocuong", "cat_combo"];
  const legacyCategoryMap = { cat_chicken: "cat_fried", cat_chiennuong: "cat_fried", cat_monno: "cat_savoury", cat_nuocuong: "cat_drink" };
  Object.keys(seed).forEach(function (key) {
    if (storageRead(key) === null) storageWrite(key, JSON.stringify(seed[key]));
  });
  if (storageRead("katMenuVersion") !== "6") {
    const existingProducts = Array.isArray(previousProducts) ? previousProducts : [];
    const seededProducts = seed.products.map(function (product) {
      const existing = existingProducts.find(function (item) { return item.id === product.id; });
      if (!existing) return product;
      return Object.assign({}, product, {
        image: existing.image || product.image,
        status: existing.status === undefined ? product.status : existing.status,
        isVisible: existing.isVisible === undefined ? product.isVisible : existing.isVisible,
        rating: existing.rating === undefined ? product.rating : existing.rating,
        reviewsCount: existing.reviewsCount === undefined ? product.reviewsCount : existing.reviewsCount
      });
    });
    const customProducts = existingProducts.filter(function (product) { return !defaultProductIds.includes(product.id); }).map(function (product) {
      if (legacyCategoryMap[product.categoryId]) return Object.assign({}, product, { categoryId: legacyCategoryMap[product.categoryId] });
      return product;
    });
    const customCategories = Array.isArray(previousCategories) ? previousCategories.filter(function (category) { return !defaultCategoryIds.includes(category.id); }) : [];
    storageWrite("categories", JSON.stringify(seed.categories.concat(customCategories)));
    storageWrite("products", JSON.stringify(seededProducts.concat(customProducts)));

    const existingCombos = Array.isArray(previousCombos) ? previousCombos : [];
    const seedComboIds = seed.combos.map(function (combo) { return combo.id; });
    const seededCombos = seed.combos.map(function (combo) {
      const existing = existingCombos.find(function (item) { return item.id === combo.id; });
      return existing && existing.isActive === false ? Object.assign({}, combo, { isActive: false }) : combo;
    });
    const customCombos = existingCombos.filter(function (combo) { return !seedComboIds.includes(combo.id); });
    storageWrite("combos", JSON.stringify(seededCombos.concat(customCombos)));

    const existingUsers = Array.isArray(previousUsers) ? previousUsers : [];
    const seedUserIds = seed.users.map(function (user) { return user.id; });
    const preservedSeedUsers = seed.users.map(function (user) { return existingUsers.find(function (existing) { return existing.id === user.id; }) || user; });
    storageWrite("users", JSON.stringify(preservedSeedUsers.concat(existingUsers.filter(function (user) { return !seedUserIds.includes(user.id); }))));

    try {
      const savedVouchers = JSON.parse(storageRead("vouchers") || "[]");
      const sampleCodes = ["GIAM10", "BANHMOI", "FREESHIP"];
      if (Array.isArray(savedVouchers)) storageWrite("vouchers", JSON.stringify(savedVouchers.filter(function (voucher) { return !sampleCodes.includes(String(voucher.code || "").toUpperCase()); })));
    } catch (error) { storageWrite("vouchers", JSON.stringify([])); }
    storageWrite("katMenuVersion", "6");
  }
  if (storageRead("katContentVersion") !== "1") {
    const storedProducts = (function () { try { return JSON.parse(storageRead("products") || "[]"); } catch (error) { return []; } })();
    const refreshedProducts = storedProducts.map(function (product) {
      const seeded = seed.products.find(function (item) { return item.id === product.id; });
      return seeded ? Object.assign({}, product, { description: seeded.description }) : product;
    });
    storageWrite("products", JSON.stringify(refreshedProducts));

    const storedUsers = (function () { try { return JSON.parse(storageRead("users") || "[]"); } catch (error) { return []; } })();
    const refreshedUsers = storedUsers.map(function (user) {
      return ["USR_ADMIN_01", "USR_USER_01"].includes(user.id) ? Object.assign({}, user, { username: String(user.phone || "").replace(/\D/g, "") }) : user;
    });
    storageWrite("users", JSON.stringify(refreshedUsers));
    const storedCurrentUser = (function () { try { return JSON.parse(storageRead("currentUser") || "null"); } catch (error) { return null; } })();
    if (storedCurrentUser && ["USR_ADMIN_01", "USR_USER_01"].includes(storedCurrentUser.id)) {
      storedCurrentUser.username = String(storedCurrentUser.phone || "").replace(/\D/g, "");
      storageWrite("currentUser", JSON.stringify(storedCurrentUser));
    }
    storageWrite("katContentVersion", "1");
  }
  if (storageRead("katProductImageVersion") !== "1") {
    const legacyMenuImages = ["images/fried-snacks.jpg", "images/spring-rolls.jpg", "images/milk-tea.jpg"];
    const storedProducts = (function () { try { return JSON.parse(storageRead("products") || "[]"); } catch (error) { return []; } })();
    const refreshedProducts = storedProducts.map(function (product) {
      const seeded = seed.products.find(function (item) { return item.id === product.id; });
      if (!seeded) return product;
      const variants = Array.isArray(product.variants) ? product.variants.map(function (variant) {
        const seededVariant = (seeded.variants || []).find(function (item) { return String(item.id || item.name) === String(variant.id || variant.name); });
        if (!seededVariant || (variant.image && !legacyMenuImages.includes(variant.image))) return variant;
        return Object.assign({}, variant, { image: seededVariant.image || seeded.image });
      }) : product.variants;
      return Object.assign({}, product, {
        image: !product.image || legacyMenuImages.includes(product.image) ? seeded.image : product.image,
        variants: variants
      });
    });
    storageWrite("products", JSON.stringify(refreshedProducts));

    const storedCombos = (function () { try { return JSON.parse(storageRead("combos") || "[]"); } catch (error) { return []; } })();
    const refreshedCombos = storedCombos.map(function (combo) {
      const seeded = seed.combos.find(function (item) { return item.id === combo.id; });
      if (!seeded || (combo.image && !legacyMenuImages.includes(combo.image))) return combo;
      return Object.assign({}, combo, { image: seeded.image });
    });
    storageWrite("combos", JSON.stringify(refreshedCombos));
    storageWrite("katProductImageVersion", "1");
  }
  if (storageRead("katNamedProductImageVersion") !== "1") {
    const productImageByName = {
      "ca vien chien 1 xien 4 vien": "images/ca-vien-chien-4-vien.webp",
      "keo nhai dynamite chews goi": "images/keo-dynamite-chew-choco.jpg",
      "que cay vfoods hot chilli goi": "images/banh-que-mix-vi-ot-cay-vfood.webp"
    };
    const normalizeProductName = function (value) {
      return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    };
    const storedNamedProducts = (function () { try { return JSON.parse(storageRead("products") || "[]"); } catch (error) { return []; } })();
    const imageMappedProducts = storedNamedProducts.map(function (product) {
      const image = productImageByName[normalizeProductName(product.name)];
      return image ? Object.assign({}, product, { image: image }) : product;
    });
    storageWrite("products", JSON.stringify(imageMappedProducts));
    storageWrite("katNamedProductImageVersion", "1");
  }
  if (storageRead("katVoucherVersion") !== "1") {
    const storedVouchers = (function () { try { return JSON.parse(storageRead("vouchers") || "[]"); } catch (error) { return []; } })();
    const legacyVoucherCodes = ["GIAM10", "BANHMOI", "FREESHIP"];
    const migratedVouchers = storedVouchers.map(function (voucher) {
      const legacyIndex = legacyVoucherCodes.indexOf(String(voucher.code || "").toUpperCase());
      if (legacyIndex >= 0) return Object.assign({}, seed.vouchers[legacyIndex], { isActive: voucher.isActive !== false, isPublic: true });
      return Object.assign({}, voucher, { isPublic: voucher.isPublic !== false });
    });
    seed.vouchers.forEach(function (voucher) {
      if (!migratedVouchers.some(function (stored) { return String(stored.code || "").toUpperCase() === voucher.code; })) migratedVouchers.push(voucher);
    });
    storageWrite("vouchers", JSON.stringify(migratedVouchers));
    storageWrite("katVoucherVersion", "1");
  }
  if (storageRead("katReviewSeedVersion") !== "1") {
    const savedReviews = (function () { try { return JSON.parse(storageRead("reviews") || "[]"); } catch (error) { return []; } })();
    const sampleNames = ["Minh Anh", "Bảo Ngọc", "Gia Hân", "Tuấn Kiệt"];
    const sampleComments = [
      "Nóng giòn, nêm nếm vừa miệng, ăn rất cuốn.",
      "Vị đậm đà, phần ăn vừa đủ, giá hợp lý.",
      "Món thơm ngon, ăn cùng bạn bè rất hợp.",
      "Nguyên liệu hài hòa, mình sẽ gọi lại lần nữa."
    ];
    const sampleRatings = [5, 4, 5, 4];
    seed.products.forEach(function (product, productIndex) {
      const productReviews = savedReviews.filter(function (review) { return review.productId === product.id; });
      const visibleCount = productReviews.filter(function (review) { return !review.isHidden; }).length;
      const targetCount = 1 + (productIndex % 4);
      const additions = Math.max(0, targetCount - visibleCount);
      for (let reviewIndex = 0; reviewIndex < additions; reviewIndex++) {
        const serial = productReviews.length + reviewIndex + 1;
        const sampleIndex = (productIndex + serial - 1) % sampleNames.length;
        const reviewDate = new Date(Date.now() - ((productIndex + reviewIndex) % 12) * 86400000);
        savedReviews.push({
          id: "REV_SEED_" + product.id + "_" + serial,
          productId: product.id,
          userId: "USR_REVIEW_SEED_" + product.id + "_" + serial,
          username: sampleNames[sampleIndex],
          rating: sampleRatings[sampleIndex],
          comment: sampleComments[sampleIndex],
          createdAt: new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(reviewDate),
          isHidden: false
        });
      }
    });
    storageWrite("reviews", JSON.stringify(savedReviews));
    const storedProducts = (function () { try { return JSON.parse(storageRead("products") || "[]"); } catch (error) { return []; } })();
    const ratedProducts = storedProducts.map(function (product) {
      const visibleReviews = savedReviews.filter(function (review) { return review.productId === product.id && !review.isHidden; });
      return Object.assign({}, product, {
        rating: visibleReviews.length ? visibleReviews.reduce(function (sum, review) { return sum + Number(review.rating || 0); }, 0) / visibleReviews.length : 0,
        reviewsCount: visibleReviews.length
      });
    });
    storageWrite("products", JSON.stringify(ratedProducts));
    storageWrite("katReviewSeedVersion", "1");
  }
  if (storageRead("currentUser") === null) storageWrite("currentUser", "null");

  try {
    const savedCart = JSON.parse(storageRead("cart") || "[]");
    if (Array.isArray(savedCart)) {
      const normalizedCart = [];
      const signatures = {};
      savedCart.forEach(function (item) {
        const toppings = Array.isArray(item.selectedToppings) ? item.selectedToppings.slice().sort(function (a, b) { return String(a.name).localeCompare(String(b.name), "vi"); }) : [];
        const signature = JSON.stringify([item.productId, String(item.selectedOptions || ""), Number(item.unitPrice || item.basePrice || 0), toppings.map(function (topping) { return [topping.name, Number(topping.price || 0)]; })]);
        const existingIndex = signatures[signature];
        const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
        if (existingIndex !== undefined) normalizedCart[existingIndex].quantity = Math.min(20, normalizedCart[existingIndex].quantity + quantity);
        else { signatures[signature] = normalizedCart.length; normalizedCart.push(Object.assign({}, item, { quantity: quantity })); }
      });
      normalizedCart.forEach(function (item) { item.subtotal = Number(item.unitPrice || item.basePrice || 0) * item.quantity; });
      if (JSON.stringify(normalizedCart) !== JSON.stringify(savedCart)) storageWrite("cart", JSON.stringify(normalizedCart));
    }
  } catch (error) { storageWrite("cart", JSON.stringify([])); }

  window.readStore = function (key) {
    try { return JSON.parse(storageRead(key) || "null"); }
    catch (error) { console.error("Không đọc được dữ liệu", key, error); return null; }
  };
  window.writeStore = function (key, value) {
    const persisted = storageWrite(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("kat:storage", { detail: { key: key } }));
    return persisted;
  };
  window.formatCurrency = function (amount) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(amount) || 0).replace(/\s?₫$/, "đ");
  };
  window.escapeHTML = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  };
  window.makeId = function (prefix) {
    return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7).toUpperCase();
  };
})();
