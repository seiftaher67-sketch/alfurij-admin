import React, { useState, useRef } from "react";
import { PhotoIcon, DocumentIcon, XMarkIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useMutation } from '@tanstack/react-query';
import { listingAPI } from '../services/api';

export default function AddTruck() {
  const [form, setForm] = useState({
    adType: "ad",
    title: "",
    category: "",
    city: "",
    model: "",
    kilometers: "",
    registrationYear: "",
    serial: "",
    cabin: "",
    type: "",
    comment: "",
    price: "",
    condition: "new",
    length: "",
    width: "",
    height: "",
    engine: "",
    transmission: "",
    gearboxBrand: "",
    gearboxType: "",
    fuel: "",
    lights: "",
    color: "",
    features: {
      airConditioning: false,
      electricMirrors: false,
      radioCassette: false,
      gps: false,
      digitalTachograph: false,
      electricWindows: false,
      heatedMirrors: false,
      bluetooth: false,
      speedControl: false,
      speedometer: false,
      laneAssist: false,
      heatingWhileStanding: false,
    },
    image: [],
    pdf: [],
    video: null,
    auctionStartDate: "",
    auctionStartTime: "",
    auctionEndDate: "",
    auctionEndTime: "",
  });

  const [dragOver, setDragOver] = useState({ image: false, pdf: false, video: false });

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileRemove = (type, index) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleFileAdd = (type, files) => {
    const currentFiles = form[type];
    const newFiles = Array.from(files);
    const combined = [...currentFiles, ...newFiles];

    if (type === 'image' && combined.length > 10) {
      alert('لا يمكن رفع أكثر من 10 صور');
      return;
    }
    if (type === 'pdf' && combined.length > 5) {
      alert('لا يمكن رفع أكثر من 5 مستندات');
      return;
    }

    setForm((prev) => ({
      ...prev,
      [type]: combined,
    }));
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragOver((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver((prev) => ({ ...prev, [type]: false }));
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileAdd(type, files);
    }
  };

  const createListingMutation = useMutation({
    mutationFn: listingAPI.createListing,
    onSuccess: (data) => {
      alert('تم إنشاء الإعلان بنجاح!');
      // Reset form
      setForm({
        adType: "ad",
        title: "",
        city: "",
        model: "",
        kilometers: "",
        registrationYear: "",
        serial: "",
        cabin: "",
        type: "",
        comment: "",
        price: "",
        condition: "new",
        length: "",
        width: "",
        height: "",
        engine: "",
        transmission: "",
        gearboxBrand: "",
        gearboxType: "",
        fuel: "",
        lights: "",
        color: "",
        features: {
          airConditioning: false,
          electricMirrors: false,
          radioCassette: false,
          gps: false,
          digitalTachograph: false,
          electricWindows: false,
          heatedMirrors: false,
          bluetooth: false,
          speedControl: false,
          speedometer: false,
          laneAssist: false,
          heatingWhileStanding: false,
        },
        image: [],
        pdf: [],
        video: null,
        auctionStartDate: "",
        auctionStartTime: "",
        auctionEndDate: "",
        auctionEndTime: "",
        pointValue: "",
      });
    },
    onError: (error) => {
      alert('حدث خطأ أثناء إنشاء الإعلان: ' + error.message);
    }
  });

  function handleChange(e) {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      if (name === 'image' || name === 'pdf') {
        setForm((prev) => ({ ...prev, [name]: Array.from(files) }));
      } else {
        setForm((prev) => ({ ...prev, [name]: files[0] }));
      }
    } else if (type === 'checkbox') {
      const [parent, child] = name.split('.');
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked,
        },
      }));
    } else setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validate limits
    if (form.image.length > 10) {
      alert('لا يمكن رفع أكثر من 10 صور');
      return;
    }
    if (form.video && form.video.size > 50 * 1024 * 1024) {
      alert('حجم الفيديو يجب أن يكون أقل من 50 ميجابايت');
      return;
    }
    if (form.pdf.length > 3) {
      alert('لا يمكن رفع أكثر من 3 مستندات');
      return;
    }

    // Convert features object to array of selected features
    const selectedFeatures = Object.keys(form.features).filter(key => form.features[key]);

    // Prepare data for API - send all fields from schema
    const listingData = {
      ad_type: form.adType || 'ad',
      buy_now: form.adType === 'ad' ? 1 : 0,
      title: form.title || '',
      category: form.category || '',
      section: form.section || '',
      city: form.city || '',
      description: form.comment || '',
      price: parseFloat(form.price) || 0,
      status: 'draft',
      condition: form.condition || 'new',
      model: form.model || '',
      serial_number: form.serial || '',
      cabin_type: form.cabin || null,
      vehicle_type: form.type || null,
      engine_capacity: form.engine || null,
      transmission: form.transmission || null,
      fuel_type: form.fuel || null,
      lights_type: form.lights || null,
      color: form.color || null,
      length: parseFloat(form.length) || null,
      width: parseFloat(form.width) || null,
      height: parseFloat(form.height) || null,
      kilometers: parseFloat(form.kilometers) || null,
      registration_year: parseInt(form.registrationYear) || null,
      gearbox_brand: form.gearboxBrand || null,
      gearbox_type: form.gearboxType || null,
      location: null,
      media: null,
      documents: null,
      approval_status: 'pending',
      other: selectedFeatures,
      // Auction data
      auction_start_date: form.auctionStartDate || null,
      auction_start_time: form.auctionStartTime || null,
      auction_end_date: form.auctionEndDate || null,
      auction_end_time: form.auctionEndTime || null,
      point_value: parseFloat(form.pointValue) || null,
      // Files will be sent in FormData in api.js
      image: form.image,
      video: form.video,
      pdf: form.pdf,
    };

    createListingMutation.mutate(listingData);
  }

  return (
    <div
      dir="rtl"
      className="w-full max-w-4xl mx-auto bg-white p-4 md:p-8 shadow-xl rounded-2xl overflow-x-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button className="bg-[#f2b400] text-white rounded-full w-10 h-10 text-2xl flex items-center justify-center">
          +
        </button>
        <h2 className="text-xl font-semibold">قم بإنشاء إعلان خاص بك</h2>
      </div>



      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload section */}
        <div className="space-y-6">
          {/* Images Upload */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 bg-gray-50 transition-colors ${
              dragOver.image ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => handleDragOver(e, 'image')}
            onDragLeave={(e) => handleDragLeave(e, 'image')}
            onDrop={(e) => handleDrop(e, 'image')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <PhotoIcon className="h-8 w-8 text-blue-500" />
                <h4 className="text-lg font-semibold text-gray-800">رفع الصور</h4>
              </div>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="bg-[#f2b400] text-white px-4 py-2 rounded-lg hover:bg-[#e6a100] transition-colors flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                إضافة صور
              </button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileAdd('image', e.target.files)}
              className="hidden"
            />
            {form.image.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {form.image.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleFileRemove('image', index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600">
              {form.image.length}/10 صور محددة
            </p>
            <p className="text-xs text-amber-600 mt-1">
              ملاحظة: الحد الأقصى لعدد الصور هو 10 صور
            </p>
          </div>

          {/* Video Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-800">رفع الفيديو</h4>
              </div>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="bg-[#f2b400] text-white px-4 py-2 rounded-lg hover:bg-[#e6a100] transition-colors flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                إضافة فيديو
              </button>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.files[0] }))}
              className="hidden"
            />
            {form.video && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{form.video.name}</p>
                  <p className="text-sm text-gray-500">{(form.video.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, video: null }))}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
            <p className="text-xs text-amber-600 mt-2">
              ملاحظة: الحد الأقصى لحجم الفيديو هو 50 ميجابايت
            </p>
          </div>

          {/* PDFs Upload */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 bg-gray-50 transition-colors ${
              dragOver.pdf ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => handleDragOver(e, 'pdf')}
            onDragLeave={(e) => handleDragLeave(e, 'pdf')}
            onDrop={(e) => handleDrop(e, 'pdf')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DocumentIcon className="h-8 w-8 text-red-500" />
                <h4 className="text-lg font-semibold text-gray-800">رفع المستندات</h4>
              </div>
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="bg-[#f2b400] text-white px-4 py-2 rounded-lg hover:bg-[#e6a100] transition-colors flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                إضافة مستندات
              </button>
            </div>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => handleFileAdd('pdf', e.target.files)}
              className="hidden"
            />
            {form.pdf.length > 0 && (
              <div className="space-y-2 mb-4">
                {form.pdf.map((file, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                    <DocumentIcon className="h-8 w-8 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileRemove('pdf', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600">
              {form.pdf.length}/5 مستندات محددة
            </p>
            <p className="text-xs text-amber-600 mt-1">
              ملاحظة: الحد الأقصى لعدد المستندات هو 5 مستندات
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium">عنوان الإعلان</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 w-full p-3 border rounded-lg"
            placeholder="أدخل عنوان الإعلان"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium">الفئة</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 w-full p-3 border rounded-lg"
          >
            <option value="">اختر الفئة</option>
            <option>سيارات</option>
            <option>شاحنات</option>
            <option>دراجات</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium">المدينة</label>
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className="mt-1 w-full p-3 border rounded-lg"
          >
            <option value="">اختر المدينة</option>
            <option>الرياض</option>
            <option>جدة</option>
            <option>الدمام</option>
          </select>
        </div>

        {/* Model / Kilometers / Registration Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">الموديل</label>
            <select
              name="model"
              value={form.model}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            >
              <option value="">اختر الموديل</option>
              {/* Models will be populated from dashboard */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">الرقم التسلسلي</label>
            <input
              name="serial"
              value={form.serial}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
              placeholder="أدخل الرقم التسلسلي"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">عدد الكيلو مترات</label>
            <input
              name="kilometers"
              value={form.kilometers}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
              placeholder="أدخل عدد الكيلو مترات"
            />
          </div>
        </div>

        {/* Model / Cabin / Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">طراز المركبة</label>
            <select
              name="model"
              value={form.model}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            >
              <option value="">اختر الطراز</option>
              <option>تويوتا</option>
              <option>هيونداي</option>
              <option>فورد</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">نوع الكابينة</label>
            <select
              name="cabin"
              value={form.cabin}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            >
              <option value="">اختر النوع</option>
              <option>مفردة</option>
              <option>مزدوجة</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">نوع القيد</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            >
              <option value="">اختر النوع</option>
              <option>خصوصي</option>
              <option>نقل عام</option>
            </select>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium">أضف تعليق</label>
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full p-3 border rounded-lg"
            placeholder="أضف ملاحظات أو وصفًا إضافيًا"
          ></textarea>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium">السعر</label>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  price: Math.max(0, parseInt(prev.price || 0) - 1).toString(),
                }))
              }
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
            >
              -
            </button>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              className="w-full max-w-32 p-3 border rounded-lg text-center"
              placeholder="أدخل السعر"
            />
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  price: (parseInt(prev.price || 0) + 1).toString(),
                }))
              }
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        {/* Vehicle details */}
        <h3 className="text-lg font-semibold mt-8 mb-4">تفاصيل المركبة</h3>

        {/* Condition */}
        <div>
          <span className="block text-sm font-medium mb-2">حالة السيارة</span>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="condition"
                value="new"
                checked={form.condition === "new"}
                onChange={handleChange}
              />
              <span>جديدة</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="condition"
                value="used"
                checked={form.condition === "used"}
                onChange={handleChange}
              />
              <span>مستعملة</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="condition"
                value="scrap"
                checked={form.condition === "scrap"}
                onChange={handleChange}
              />
              <span>خردة</span>
            </label>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">الطول (cm)</label>
            <input
              name="length"
              value={form.length}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">العرض (cm)</label>
            <input
              name="width"
              value={form.width}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">الارتفاع (cm)</label>
            <input
              name="height"
              value={form.height}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* Engine */}
        <div>
          <label className="block text-sm font-medium">سعة المحرك</label>
          <input
            name="engine"
            value={form.engine}
            onChange={handleChange}
            className="mt-1 w-full p-3 border rounded-lg"
          />
        </div>

        {/* Transmission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              نوع علبة السرعات
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="transmission"
                  value="manual"
                  checked={form.transmission === "manual"}
                  onChange={handleChange}
                />
                <span>الناقل اليدوي</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="transmission"
                  value="dual"
                  checked={form.transmission === "dual"}
                  onChange={handleChange}
                />
                <span>مزدوج (المانيوال و الأوتوماتيك معًا)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="transmission"
                  value="semi"
                  checked={form.transmission === "semi"}
                  onChange={handleChange}
                />
                <span>نصف أوتوماتيك</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="transmission"
                  value="auto"
                  checked={form.transmission === "auto"}
                  onChange={handleChange}
                />
                <span>أوتوماتيك</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">ماركه علبه السرعات</label>
            <input
              name="gearboxBrand"
              value={form.gearboxBrand}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
              placeholder="أدخل ماركة علبة السرعات"
            />
           
          </div>
        </div>

        {/* Fuel */}
        <div>
          <label className="block text-sm font-medium mb-2">نوع الوقود</label>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fuel"
                value="diesel"
                checked={form.fuel === "diesel"}
                onChange={handleChange}
              />
              <span>ديزل</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fuel"
                value="gasoline"
                checked={form.fuel === "gasoline"}
                onChange={handleChange}
              />
              <span>بنزين</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fuel"
                value="electric"
                checked={form.fuel === "electric"}
                onChange={handleChange}
              />
              <span>كهرباء</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fuel"
                value="gas"
                checked={form.fuel === "gas"}
                onChange={handleChange}
              />
              <span>غاز</span>
            </label>
          </div>
        </div>

        {/* Lights & Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">نوع المصابيح</label>
            <input
              name="lights"
              value={form.lights}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">اللون</label>
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* Additional Features */}
        <div>
          <label className="block text-sm font-medium mb-4">مميزات أخرى</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.airConditioning"
                  checked={form.features.airConditioning}
                  onChange={handleChange}
                />
                <span>تكييف هواء</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.electricMirrors"
                  checked={form.features.electricMirrors}
                  onChange={handleChange}
                />
                <span>مرايا كهربائية</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.radioCassette"
                  checked={form.features.radioCassette}
                  onChange={handleChange}
                />
                <span>راديو / كاسيت</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.gps"
                  checked={form.features.gps}
                  onChange={handleChange}
                />
                <span>نظام تحديد الموقع العالمي</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.digitalTachograph"
                  checked={form.features.digitalTachograph}
                  onChange={handleChange}
                />
                <span>تاكوغراف الرقمية</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.electricWindows"
                  checked={form.features.electricWindows}
                  onChange={handleChange}
                />
                <span>نوافذ كهربائية</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.heatedMirrors"
                  checked={form.features.heatedMirrors}
                  onChange={handleChange}
                />
                <span>مرايا ساخنة</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.bluetooth"
                  checked={form.features.bluetooth}
                  onChange={handleChange}
                />
                <span>Bluetooth</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.speedControl"
                  checked={form.features.speedControl}
                  onChange={handleChange}
                />
                <span>تحكم في السرعات</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.speedometer"
                  checked={form.features.speedometer}
                  onChange={handleChange}
                />
                <span>جهاز قياس السرعة</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.laneAssist"
                  checked={form.features.laneAssist}
                  onChange={handleChange}
                />
                <span>مساعدة المسار</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="features.heatingWhileStanding"
                  checked={form.features.heatingWhileStanding}
                  onChange={handleChange}
                />
                <span>تدفئة أثناء الوقوف</span>
              </label>
            </div>
          </div>
        </div>

        {/* Ad type */}
        <div className="flex flex-wrap gap-4 md:gap-6 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="adType"
              value="ad"
              checked={form.adType === "ad"}
              onChange={handleChange}
            />
            <span>إعلان</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="adType"
              value="live_auction"
              checked={form.adType === "live_auction"}
              onChange={handleChange}
            />
            <span>مزاد مباشر</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="adType"
              value="scheduled_auction"
              checked={form.adType === "scheduled_auction"}
              onChange={handleChange}
            />
            <span>مزاد مجدول</span>
          </label>
        </div>

        {/* Auction Date/Time Selection */}
        {(form.adType === "live_auction" || form.adType === "scheduled_auction") && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">تفاصيل المزاد</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium">قيمة النقطة (بالريال)</label>
              <input
                type="number"
                name="pointValue"
                value={form.pointValue}
                onChange={handleChange}
                className="mt-1 w-full p-3 border rounded-lg"
                placeholder="أدخل قيمة النقطة"
              />
            </div>
            {form.adType === "live_auction" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">تاريخ المزاد</label>
                  <input
                    type="date"
                    name="auctionStartDate"
                    value={form.auctionStartDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">وقت المزاد</label>
                  <input
                    type="time"
                    name="auctionStartTime"
                    value={form.auctionStartTime}
                    onChange={handleChange}
                    className="mt-1 w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
            )}
            {form.adType === "scheduled_auction" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium">تاريخ البدء</label>
                  <input
                    type="date"
                    name="auctionStartDate"
                    value={form.auctionStartDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">وقت البدء</label>
                  <input
                    type="time"
                    name="auctionStartTime"
                    value={form.auctionStartTime}
                    onChange={handleChange}
                    className="mt-1 w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    name="auctionEndDate"
                    value={form.auctionEndDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">وقت الانتهاء</label>
                  <input
                    type="time"
                    name="auctionEndTime"
                    value={form.auctionEndTime}
                    onChange={handleChange}
                    className="mt-1 w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={createListingMutation.isPending}
            className="bg-[#f2b400] text-white px-8 py-3 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createListingMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </div>
      </form>
    </div>
  );
}
