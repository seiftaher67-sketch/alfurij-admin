import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useParams } from "react-router-dom";
import {
  ScaleIcon,
  CogIcon,
  TruckIcon,
  DocumentArrowDownIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { listingAPI } from "../services/api";

const API_BASE_URL = 'http://localhost:8000';

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  useEffect(() => {
    if (listing?.media) {
      // Separate images and videos based on file extensions
      const imageFiles = listing.media.filter(file =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      const videoFiles = listing.media.filter(file =>
        /\.(mp4|mov|avi|webm)$/i.test(file)
      );

      setImages(imageFiles);
      setVideos(videoFiles);

      // Set main image to first image if available
      if (imageFiles.length > 0) {
        setMainImage(`${API_BASE_URL}/storage/${imageFiles[0]}`);
      }
    }
  }, [listing]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getListing(id);
      setListing(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await listingAPI.approveListing(id);
      // Refresh the listing details
      fetchListingDetails();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen" dir="rtl">
        <div className="text-center py-8">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen" dir="rtl">
        <div className="text-center py-8 text-red-500">خطأ: {error}</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-white min-h-screen" dir="rtl">
        <div className="text-center py-8">الإعلان غير موجود</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" dir="rtl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-center">
          {listing.title}
        </h1>

        {/* Gallery Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Main Image */}
          <div className="relative flex-1">
            <img
              src={mainImage}
              alt="main"
              className="rounded-2xl w-full max-w-[856px] h-[560px] object-cover"
            />
            <span className="absolute top-6 right-6 bg-white rounded-3xl px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38DF3C]"></span>
              <span className="text-[#38DF3C] font-semibold text-xl">
                {listing.status === "pending" ? "قيد المراجعة" : "موافق عليه"}
              </span>
            </span>
          </div>

          {/* Thumbnails Grid */}
          <div className="w-full lg:w-[418px]">
            {images.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 lg:gap-[26px]">
                  {images.slice(0, 2).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(`${API_BASE_URL}/storage/${src}`)}
                      className="focus:outline-none"
                    >
                      <img
                        src={`${API_BASE_URL}/storage/${src}`}
                        alt={`thumb-${i}`}
                        className="w-full h-[176px] object-cover rounded-2xl hover:opacity-90"
                      />
                    </button>
                  ))}
                </div>
                {images.length > 2 && (
                  <div className="grid grid-cols-2 gap-4 lg:gap-[26px] mt-4">
                    {images.slice(2, 4).map((src, i) => (
                      <button
                        key={i + 2}
                        onClick={() => setMainImage(`${API_BASE_URL}/storage/${src}`)}
                        className="focus:outline-none"
                      >
                        <img
                          src={`${API_BASE_URL}/storage/${src}`}
                          alt={`thumb-${i + 2}`}
                          className="w-full h-[176px] object-cover rounded-2xl hover:opacity-90"
                        />
                      </button>
                    ))}
                  </div>
                )}
                {images.length > 4 && (
                  <div className="grid grid-cols-2 gap-4 lg:gap-[26px] mt-4">
                    {images.slice(4, 6).map((src, i) => (
                      <button
                        key={i + 4}
                        onClick={() => setMainImage(`${API_BASE_URL}/storage/${src}`)}
                        className="focus:outline-none"
                      >
                        <img
                          src={`${API_BASE_URL}/storage/${src}`}
                          alt={`thumb-${i + 4}`}
                          className="w-full h-[176px] object-cover rounded-2xl hover:opacity-90"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Basic Info Row */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-t border-b border-gray-200 py-4">
          <div className="flex flex-col items-center flex-1 border-l border-gray-300 px-4 w-full sm:w-auto">
            <span className="text-[#C3C3C3] text-2xl font-semibold mb-1">
              سنة التسجيل
            </span>
            <span className="text-black font-medium text-xl">
              {listing.registration_year || "غير محدد"}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1 border-l border-gray-300 px-4 w-full sm:w-auto">
            <span className="text-[#C3C3C3] text-2xl font-semibold mb-1">
              عدد الكيلومترات
            </span>
            <span className="text-black font-medium text-xl">{listing.kilometers} كم</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-l border-gray-300 px-4 w-full sm:w-auto">
            <span className="text-[#C3C3C3] text-2xl font-semibold mb-1">
              رقم التسلسل
            </span>
            <span className="text-black font-medium text-xl">
              {listing.serial_number}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1 border-l border-gray-300 px-4 w-full sm:w-auto">
            <span className="text-[#C3C3C3] text-2xl font-semibold mb-1">
              الموديل
            </span>
            <span className="text-black font-medium text-xl">
              {listing.model}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1 px-4 w-full sm:w-auto">
            <span className="text-[#C3C3C3] text-2xl font-semibold mb-1">
              حالة الشاحنة
            </span>
            <span className="text-black font-medium text-xl">{listing.condition}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Right Column: Listing Details, Video, Contacts, Downloads */}
          <div className="col-span-1 space-y-6 order-2">
            {/* Listing Details Card */}
            <div className="bg-[#F9F9F9] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-black font-semibold text-2xl">
                  البائع
                </span>
                <span className="font-semibold text-2xl">{listing.seller_id}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-black font-semibold text-2xl">
                  المدينة
                </span>
                <span className="font-semibold text-2xl">{listing.city}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-black font-semibold text-2xl">
                  القسم
                </span>
                <span className="font-semibold text-2xl">{listing.category}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-black font-semibold text-2xl">
                  السعر
                </span>
                <span className="font-semibold text-2xl">{listing.price_in_sar} ر.س</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-black font-semibold text-2xl">
                  السعر بالنقاط
                </span>
                <span className="font-semibold text-2xl">{listing.price_in_points} نقطة</span>
              </div>
              <div className="bg-[#E9E9E9] my-3 py-4 rounded-lg">
                <div className="flex items-center justify-between px-4">
                  <span className="text-black font-semibold text-2xl">
                    الوصف
                  </span>
                </div>
                <p className="text-gray-600 px-4 mt-2">{listing.description}</p>
              </div>
            </div>

            {/* Video */}
            {videos.length > 0 ? (
              <div className="relative">
                <video
                  src={`${API_BASE_URL}/storage/${videos[0]}`}
                  controls
                  className="w-full h-[350px] object-cover rounded-2xl"
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                لا يوجد فيديو متاح
              </div>
            )}

            {/* Contact Buttons */}
            <div className="space-y-4">
              <button className="w-full border-2 border-black text-black py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-50">
                <PhoneIcon className="w-6 h-6" />
                <span className="text-2xl font-medium">أتصل بالبائع</span>
              </button>
              <button className="w-full border-2 border-black text-black py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-50">
                <ChatBubbleLeftIcon className="w-6 h-6 text-green-500" />
                <span className="text-2xl font-medium">
                  إرسال رسالة عبر واتساب
                </span>
              </button>
            </div>

            {/* Downloadable Files */}
            <div className="space-y-4">
              {listing.documents && listing.documents.length > 0 ? (
                listing.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={`${API_BASE_URL}/storage/${doc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between border-2 border-gray-300 rounded-2xl p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <DocumentArrowDownIcon className="text-lg text-gray-600" />
                      <span className="text-2xl font-medium">
                        تحميل الملف {index + 1}
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center text-gray-500">لا توجد ملفات متاحة</div>
              )}
            </div>
          </div>

          {/* Left Column: Specifications */}
          <div className="col-span-2 space-y-8 order-1">
            {/* الصفات Title */}
            <h2 className="text-3xl font-semibold">الصفات</h2>

            {/* خاصية الشاحنة */}
            <div className="bg-[#F9F9F9] rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-[#F8BC06] mb-6 flex items-center">
                <ScaleIcon className="w-8 h-8 ml-2" /> خاصية الشاحنة
              </h3>
              <div className="flex flex-col lg:flex-row gap-6">
               
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="text-xl text-gray-700">
                      الطول الإجمالي للمركبة
                    </span>
                    <span className="font-bold text-xl">
                      {listing.length} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="text-xl text-gray-700">
                      إجمالي عرض الشاحنة
                    </span>
                    <span className="font-bold text-xl">
                      {listing.width} cm
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="text-xl text-gray-700">
                      إجمالي ارتفاع المركبة
                    </span>
                    <span className="font-bold text-xl">
                      {listing.height} cm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* مجموعة نقل الحركة */}
            <div className="bg-[#F9F9F9] rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-[#F8BC06] mb-6 flex items-center">
                <CogIcon className="w-8 h-8 ml-2" /> مجموعة نقل الحركة
              </h3>
              <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-16 mb-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xl font-medium text-gray-700">
                    سعة المحرك
                  </span>
                  <span className="text-xl font-medium text-gray-700">
                    الوقود
                  </span>
                  <span className="text-xl font-medium text-gray-700">
                    نوع علبة السرعات
                  </span>
                  <span className="text-xl font-medium text-gray-700">
                    ماركة علبة السرعات
                  </span>
                  <span className="text-xl font-medium text-gray-700">
                    عدد السرعات
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xl text-gray-600">
                    {listing.engine_capacity || "338 كيلو واط (453 Hp)"}
                  </span>
                  <span className="text-xl text-gray-600">
                    {listing.fuel_type || "ديزل"}
                  </span>
                  <span className="text-xl text-gray-600">
                    {listing.transmission || "أوتوماتيكي"}
                  </span>
                  <span className="text-xl text-gray-600">
                    {listing.gearbox_brand || "Scania"}
                  </span>
                  <span className="text-xl text-gray-600">
                    {listing.gearbox_type || "14"}
                  </span>
                </div>
              </div>

              {/* Driving Support Features */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-[#F8BC06]"></div>
                  </div>
                  <span className="text-xl text-gray-700">
                    نظام الكوابح المانع للانزلاق
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-[#F8BC06]"></div>
                  </div>
                  <span className="text-xl text-gray-700">بطارية التشغيل</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-[#F8BC06]"></div>
                  </div>
                  <span className="text-xl text-gray-700">
                    نظام تدعيم القيادة
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 rounded-full bg-[#F8BC06]"></div>
                  </div>
                  <span className="text-xl text-gray-700">
                    نظام مانع الإنزلاق
                  </span>
                </div>
              </div>
            </div>

            {/* الكابينة */}
            <div className="bg-[#F9F9F9] rounded-2xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-[#F8BC06] mb-6 flex items-center">
                <TruckIcon className="w-8 h-8 ml-2" /> الكابينة
              </h3>
              {/* Basic Cabin Info */}
              <div className="flex flex-col lg:flex-row justify-between gap-8 mb-6">
                <div className="flex flex-col gap-2">
                  <span className="text-xl font-medium text-gray-700">
                    نوع الكابينة
                  </span>
                  <span className="text-xl font-medium text-gray-700">
                    نوع الإضاءة
                  </span>
                  <span className="text-xl font-medium text-gray-700">
                    اللون
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xl text-gray-600">
                    {listing.cabin_type || "كابينة نوم"}
                  </span>
                  <span className="text-xl text-gray-600">
                    {listing.lights_type || "مصابيح هالوجين"}
                  </span>
                  <span className="text-xl text-gray-600">
                    {listing.color || "أبيض"}
                  </span>
                </div>
              </div>

              {/* Cabin Features Grid */}
              <div className="grid grid-cols-3 gap-y-4">
                {[
                  { label: "تكييف هواء", key: "airConditioning" },
                  { label: "مرايا كهربائية", key: "electricMirrors" },
                  { label: "راديو / كاسيت", key: "radioCassette" },
                  { label: "نظام تحديد الموقع العالمي", key: "gps" },
                  { label: "تاكوغراف الرقمية", key: "tacho" },
                  { label: "نوافذ كهربائية", key: "electricWindows" },
                  { label: "مرايا ساخنة", key: "heatedMirrors" },
                  { label: "Bluetooth", key: "bluetooth" },
                  { label: "تحكم في السرعات", key: "speedControl" },
                  { label: "جهاز قياس السرعة", key: "speedMeter" },
                  { label: "مساعدة المسار", key: "laneAssist" },
                  { label: "تدفئة أثناء الوقوف", key: "parkingHeater" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-[1.5px] border-black flex items-center justify-center flex-shrink-0">
                      {listing.other?.includes(item.key) && (
                        <div className="w-4 h-4 rounded-full bg-[#F8BC06]"></div>
                      )}
                    </div>
                    <span className="text-xl text-gray-700 truncate">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accept/Reject Buttons */}
        <div className="flex justify-center gap-6 mt-8">
          <Button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-2xl font-semibold rounded-2xl"
          >
            الموافقة على الإعلان
          </Button>
          <Button variant="destructive" className="px-8 py-4 text-2xl font-semibold rounded-2xl">
            رفض الإعلان
          </Button>
        </div>
      </div>
    </div>
  );
}
