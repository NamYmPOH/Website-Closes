"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Ward {
  code: number;
  name: string;
  codename: string;
  division_type: string;
}

interface District {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  wards: Ward[];
}

interface Province {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  districts: District[];
}

export interface AddressData {
  province: string;
  district: string;
  ward: string;
  street: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  initialProvince?: string;
  initialDistrict?: string;
  initialWard?: string;
  initialStreet?: string;
  onChange: (data: AddressData) => void;
  errors?: {
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
}

// Fallback danh sách 63 tỉnh thành Việt Nam trong trường hợp không có mạng
const FALLBACK_PROVINCES: Partial<Province>[] = [
  { code: 1, name: "Thành phố Hà Nội" },
  { code: 79, name: "Thành phố Hồ Chí Minh" },
  { code: 48, name: "Thành phố Đà Nẵng" },
  { code: 31, name: "Thành phố Hải Phòng" },
  { code: 92, name: "Thành phố Cần Thơ" },
  { code: 89, name: "Tỉnh An Giang" },
  { code: 77, name: "Tỉnh Bà Rịa - Vũng Tàu" },
  { code: 24, name: "Tỉnh Bắc Giang" },
  { code: 6, name: "Tỉnh Bắc Kạn" },
  { code: 95, name: "Tỉnh Bạc Liêu" },
  { code: 27, name: "Tỉnh Bắc Ninh" },
  { code: 83, name: "Tỉnh Bến Tre" },
  { code: 52, name: "Tỉnh Bình Định" },
  { code: 74, name: "Tỉnh Bình Dương" },
  { code: 70, name: "Tỉnh Bình Phước" },
  { code: 60, name: "Tỉnh Bình Thuận" },
  { code: 96, name: "Tỉnh Cà Mau" },
  { code: 4, name: "Tỉnh Cao Bằng" },
  { code: 66, name: "Tỉnh Đắk Lắk" },
  { code: 67, name: "Tỉnh Đắk Nông" },
  { code: 11, name: "Tỉnh Điện Biên" },
  { code: 75, name: "Tỉnh Đồng Nai" },
  { code: 87, name: "Tỉnh Đồng Tháp" },
  { code: 64, name: "Tỉnh Gia Lai" },
  { code: 2, name: "Tỉnh Hà Giang" },
  { code: 35, name: "Tỉnh Hà Nam" },
  { code: 42, name: "Tỉnh Hà Tĩnh" },
  { code: 30, name: "Tỉnh Hải Dương" },
  { code: 93, name: "Tỉnh Hậu Giang" },
  { code: 17, name: "Tỉnh Hòa Bình" },
  { code: 33, name: "Tỉnh Hưng Yên" },
  { code: 56, name: "Tỉnh Khánh Hòa" },
  { code: 91, name: "Tỉnh Kiên Giang" },
  { code: 62, name: "Tỉnh Kon Tum" },
  { code: 12, name: "Tỉnh Lai Châu" },
  { code: 68, name: "Tỉnh Lâm Đồng" },
  { code: 20, name: "Tỉnh Lạng Sơn" },
  { code: 10, name: "Tỉnh Lào Cai" },
  { code: 80, name: "Tỉnh Long An" },
  { code: 36, name: "Tỉnh Nam Định" },
  { code: 40, name: "Tỉnh Nghệ An" },
  { code: 37, name: "Tỉnh Ninh Bình" },
  { code: 58, name: "Tỉnh Ninh Thuận" },
  { code: 25, name: "Tỉnh Phú Thọ" },
  { code: 54, name: "Tỉnh Phú Yên" },
  { code: 44, name: "Tỉnh Quảng Bình" },
  { code: 49, name: "Tỉnh Quảng Nam" },
  { code: 51, name: "Tỉnh Quảng Ngãi" },
  { code: 22, name: "Tỉnh Quảng Ninh" },
  { code: 45, name: "Tỉnh Quảng Trị" },
  { code: 94, name: "Tỉnh Sóc Trăng" },
  { code: 14, name: "Tỉnh Sơn La" },
  { code: 72, name: "Tỉnh Tây Ninh" },
  { code: 34, name: "Tỉnh Thái Bình" },
  { code: 19, name: "Tỉnh Thái Nguyên" },
  { code: 38, name: "Tỉnh Thanh Hóa" },
  { code: 46, name: "Tỉnh Thừa Thiên Huế" },
  { code: 82, name: "Tỉnh Tiền Giang" },
  { code: 84, name: "Tỉnh Trà Vinh" },
  { code: 8, name: "Tỉnh Tuyên Quang" },
  { code: 86, name: "Tỉnh Vĩnh Long" },
  { code: 26, name: "Tỉnh Vĩnh Phúc" },
  { code: 15, name: "Tỉnh Yên Bái" },
];

let globalProvincesCache: Province[] | null = null;

export default function AddressAutocomplete({
  initialProvince = "",
  initialDistrict = "",
  initialWard = "",
  initialStreet = "",
  onChange,
  errors = {},
}: AddressAutocompleteProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedWard, setSelectedWard] = useState(initialWard);
  const [streetAddress, setStreetAddress] = useState(initialStreet);

  const [isLocating, setIsLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Tải danh sách tỉnh thành Việt Nam (depth=3)
  useEffect(() => {
    let isMounted = true;

    if (globalProvincesCache && globalProvincesCache.length > 0) {
      setProvinces(globalProvincesCache);
      setLoadingData(false);
      return;
    }

    const cachedStr = typeof window !== "undefined" ? sessionStorage.getItem("aura_vn_provinces") : null;
    if (cachedStr) {
      try {
        const parsed = JSON.parse(cachedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          globalProvincesCache = parsed;
          setProvinces(parsed);
          setLoadingData(false);
          return;
        }
      } catch (e) {}
    }

    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => {
        if (!res.ok) throw new Error("API Network Error");
        return res.json();
      })
      .then((data: Province[]) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          globalProvincesCache = data;
          setProvinces(data);
          try {
            sessionStorage.setItem("aura_vn_provinces", JSON.stringify(data));
          } catch (e) {}
        }
        setLoadingData(false);
      })
      .catch((err) => {
        console.warn("Could not load provinces from open-api.vn, using fallback list:", err);
        if (!isMounted) return;
        setProvinces(FALLBACK_PROVINCES as Province[]);
        setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Đồng bộ props ban đầu
  useEffect(() => {
    if (initialProvince) setSelectedProvince(initialProvince);
    if (initialDistrict) setSelectedDistrict(initialDistrict);
    if (initialWard) setSelectedWard(initialWard);
    if (initialStreet) setStreetAddress(initialStreet);
  }, [initialProvince, initialDistrict, initialWard, initialStreet]);

  // Tìm danh sách huyện theo tỉnh đã chọn
  const currentProvinceObj = provinces.find(
    (p) => p.name === selectedProvince || selectedProvince.includes(p.name) || p.name.includes(selectedProvince)
  );

  const districts = currentProvinceObj?.districts || [];

  // Tìm danh sách xã theo huyện đã chọn
  const currentDistrictObj = districts.find(
    (d) => d.name === selectedDistrict || selectedDistrict.includes(d.name) || d.name.includes(selectedDistrict)
  );

  const wards = currentDistrictObj?.wards || [];

  // Báo thay đổi lên component cha
  const notifyChange = useCallback(
    (prov: string, dist: string, wrd: string, str: string) => {
      const parts = [str, wrd, dist, prov].filter(Boolean);
      onChange({
        province: prov,
        district: dist,
        ward: wrd,
        street: str,
        fullAddress: parts.join(", "),
      });
    },
    [onChange]
  );

  // Xử lý chọn Tỉnh
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provName = e.target.value;
    setSelectedProvince(provName);
    setSelectedDistrict("");
    setSelectedWard("");
    notifyChange(provName, "", "", streetAddress);
  };

  // Xử lý chọn Huyện
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distName = e.target.value;
    setSelectedDistrict(distName);
    setSelectedWard("");
    notifyChange(selectedProvince, distName, "", streetAddress);
  };

  // Xử lý chọn Xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardName = e.target.value;
    setSelectedWard(wardName);
    notifyChange(selectedProvince, selectedDistrict, wardName, streetAddress);
  };

  // Xử lý số nhà / tên đường
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setStreetAddress(str);
    notifyChange(selectedProvince, selectedDistrict, selectedWard, str);
  };

  // 3. Geolocation: Tự động lấy vị trí hiện tại và reverse geocode
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage({ type: "error", text: "Trình duyệt của bạn không hỗ trợ định vị vị trí." });
      return;
    }

    setIsLocating(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Gọi Nominatim OpenStreetMap API miễn phí
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "vi",
              },
            }
          );

          if (!res.ok) throw new Error("Reverse geocoding failed");
          const data = await res.json();
          const addr = data.address || {};

          // Bóc tách tên địa lý
          const geoProvince = addr.province || addr.state || addr.city || "";
          const geoDistrict = addr.suburb || addr.district || addr.county || addr.city_district || "";
          const geoWard = addr.quarter || addr.neighbourhood || addr.village || addr.suburb || "";
          const geoRoad = [addr.house_number, addr.road].filter(Boolean).join(" ");

          let matchedProvinceName = "";
          let matchedDistrictName = "";
          let matchedWardName = "";

          // 1. Khớp tỉnh
          const foundProvince = provinces.find((p) => {
            const cleanP = p.name.toLowerCase().replace(/tỉnh|thành phố|tp\./g, "").trim();
            const cleanG = geoProvince.toLowerCase().replace(/tỉnh|thành phố|tp\./g, "").trim();
            return cleanP.includes(cleanG) || cleanG.includes(cleanP);
          });

          if (foundProvince) {
            matchedProvinceName = foundProvince.name;

            // 2. Khớp huyện
            const foundDistrict = foundProvince.districts?.find((d) => {
              const cleanD = d.name.toLowerCase().replace(/quận|huyện|thị xã|thành phố/g, "").trim();
              const cleanGD = geoDistrict.toLowerCase().replace(/quận|huyện|thị xã|thành phố/g, "").trim();
              return cleanD.includes(cleanGD) || cleanGD.includes(cleanD);
            });

            if (foundDistrict) {
              matchedDistrictName = foundDistrict.name;

              // 3. Khớp xã
              const foundWard = foundDistrict.wards?.find((w) => {
                const cleanW = w.name.toLowerCase().replace(/phường|xã|thị trấn/g, "").trim();
                const cleanGW = geoWard.toLowerCase().replace(/phường|xã|thị trấn/g, "").trim();
                return cleanW.includes(cleanGW) || cleanGW.includes(cleanW);
              });

              if (foundWard) {
                matchedWardName = foundWard.name;
              }
            }
          }

          // Cập nhật state
          const finalProvince = matchedProvinceName || geoProvince;
          const finalDistrict = matchedDistrictName || geoDistrict;
          const finalWard = matchedWardName || geoWard;
          const finalStreet = geoRoad || streetAddress;

          setSelectedProvince(finalProvince);
          setSelectedDistrict(finalDistrict);
          setSelectedWard(finalWard);
          if (geoRoad) setStreetAddress(geoRoad);

          notifyChange(finalProvince, finalDistrict, finalWard, finalStreet);

          setGeoMessage({
            type: "success",
            text: `Đã xác định vị trí: ${[finalStreet, finalWard, finalDistrict, finalProvince]
              .filter(Boolean)
              .join(", ")}`,
          });
        } catch (err) {
          console.error("Geocoding error:", err);
          setGeoMessage({
            type: "error",
            text: "Không thể tự động dịch tọa độ thành địa chỉ. Vui lòng chọn thủ công.",
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Không thể lấy vị trí hiện tại.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Bạn đã từ chối quyền truy cập vị trí. Vui lòng chọn thủ công.";
        }
        setGeoMessage({ type: "error", text: msg });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {/* Nút Lấy vị trí Geolocation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border/60">
        <span className="text-xs text-muted flex items-center gap-1.5">
          <MapPin size={13} className="text-foreground" />
          Địa chỉ giao hàng hành chính Việt Nam
        </span>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition cursor-pointer disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <Loader2 size={13} className="animate-spin text-foreground" />
              Đang xác định vị trí...
            </>
          ) : (
            <>
              <Navigation size={13} className="text-blue-600" />
              📍 Dùng vị trí của tôi
            </>
          )}
        </button>
      </div>

      {geoMessage && (
        <div
          className={`p-2.5 rounded text-xs flex items-center gap-2 ${
            geoMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
          }`}
        >
          {geoMessage.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{geoMessage.text}</span>
        </div>
      )}

      {/* Grid 3 Dropdown Cascade: Tỉnh -> Huyện -> Xã */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Dropdown 1: Tỉnh / Thành phố */}
        <div className="space-y-1">
          <label className="text-muted font-medium">Tỉnh / Thành phố *</label>
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none transition ${
              errors.province ? "border-red-500 bg-red-50/20" : "border-border"
            }`}
          >
            <option value="">-- Chọn Tỉnh / Thành phố --</option>
            {provinces.map((prov) => (
              <option key={prov.code || prov.name} value={prov.name}>
                {prov.name}
              </option>
            ))}
          </select>
          {errors.province && <p className="text-[11px] text-red-500">{errors.province}</p>}
        </div>

        {/* Dropdown 2: Quận / Huyện */}
        <div className="space-y-1">
          <label className="text-muted font-medium">Quận / Huyện *</label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedProvince}
            className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none transition disabled:opacity-50 ${
              errors.district ? "border-red-500 bg-red-50/20" : "border-border"
            }`}
          >
            <option value="">
              {selectedProvince ? "-- Chọn Quận / Huyện --" : "Vui lòng chọn Tỉnh trước"}
            </option>
            {districts.map((dist) => (
              <option key={dist.code || dist.name} value={dist.name}>
                {dist.name}
              </option>
            ))}
          </select>
          {errors.district && <p className="text-[11px] text-red-500">{errors.district}</p>}
        </div>

        {/* Dropdown 3: Phường / Xã */}
        <div className="space-y-1">
          <label className="text-muted font-medium">Phường / Xã</label>
          <select
            value={selectedWard}
            onChange={handleWardChange}
            disabled={!selectedDistrict}
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none transition disabled:opacity-50"
          >
            <option value="">
              {selectedDistrict ? "-- Chọn Phường / Xã --" : "Vui lòng chọn Huyện trước"}
            </option>
            {wards.map((ward) => (
              <option key={ward.code || ward.name} value={ward.name}>
                {ward.name}
              </option>
            ))}
          </select>
          {errors.ward && <p className="text-[11px] text-red-500">{errors.ward}</p>}
        </div>
      </div>

      {/* Input Số nhà, Tên đường cụ thể */}
      <div className="space-y-1 text-xs">
        <label className="text-muted font-medium">Số nhà, tên đường cụ thể *</label>
        <input
          type="text"
          placeholder="VD: 123 Đường Nguyễn Huệ, Tòa nhà Bitexco"
          value={streetAddress}
          onChange={handleStreetChange}
          className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none transition ${
            errors.street ? "border-red-500 bg-red-50/20" : "border-border"
          }`}
        />
        {errors.street && <p className="text-[11px] text-red-500">{errors.street}</p>}
      </div>
    </div>
  );
}
