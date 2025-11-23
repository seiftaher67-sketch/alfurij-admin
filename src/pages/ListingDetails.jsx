import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useParams } from "react-router-dom";
import {
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { listingAPI } from "../services/api";

const API_BASE_URL = 'http://localhost:8000';

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [smallMediaIndices, setSmallMediaIndices] = useState([]);

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Auction form states
  const [auctionType, setAuctionType] = useState('scheduled');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startingPrice, setStartingPrice] = useState('');

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getListing(id);
      const payload = response && response.data ? response.data : response;
      console.log("listingAPI.getListing response:", response);
      console.log("using payload:", payload);
      setListing(payload);
      setSelectedMedia(0);

      // بعد حفظ البيانات افحص أبعاد الصور الحالية
      if (payload && Array.isArray(payload.media) && payload.media.length) {
        checkMediaSizes(payload.media);
      } else {
        setSmallMediaIndices([]);
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // يحمّل كل صورة على الـ client ليعرف naturalWidth/naturalHeight
  const checkMediaSizes = (mediaArray) => {
    const small = [];
    mediaArray.forEach((p, i) => {
      // لا نحاول فحص أبعاد الفيديوهات
      if (isVideo(p)) {
        console.log(`media[${i}]`, p, "-> video (skipping dimension check)");
        return;
      }

      const img = new Image();
      img.onload = () => {
        console.log(`media[${i}]`, p, "->", img.naturalWidth + "x" + img.naturalHeight);
        // اعتبر أي صورة بعرض طبيعي أقل من 1000 بكسل "منخفضة الجودة"
        if (img.naturalWidth && img.naturalWidth < 1000) {
          small.push(i);
          setSmallMediaIndices([...small]); // حدّث تدريجياً
        }
      };
      img.onerror = () => {
        console.warn("فشل تحميل الصورة لفحص الأبعاد:", p);
      };
      img.src = getMediaUrl(p);
    });
  };

  const handleApproveClick = () => {
    if (listing.ad_type === 'auction') {
      setShowApprovalModal(true);
    } else {
      handleApprove();
    }
  };

  const handleApprove = async (auctionData = {}) => {
    try {
      await listingAPI.approveListing(id, auctionData);
      setShowApprovalModal(false);
      fetchListingDetails();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    try {
      await listingAPI.rejectListing(id);
      setShowRejectModal(false);
      fetchListingDetails();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  const getMediaUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE_URL}/storage/${path}`;
  };

  // حاول استخراج/إرجاع المسار عالي الدقة من مسارات الـ thumbnail الشائعة
  const getHighResUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // افتراض أن السيرفر قد يدعم ?w=... لإرجاع نسخة أكبر
    const base = `${API_BASE_URL}/storage/${path}`;
    return base;
  };

  const isVideo = (path) => {
    if (!path) return false;
    return /\.(mp4|webm|ogg)$/i.test(path);
  };

  const featureLabels = {
    airConditioning: "تكييف هواء",
    electricMirrors: "مرايا كهربائية",
    radioCassette: "راديو / كاسيت",
    gps: "نظام تحديد الموقع العالمي",
    tacho: "تاكوغراف الرقمية",
    electricWindows: "نوافذ كهربائية",
    heatedMirrors: "مرايا ساخنة",
    bluetooth: "Bluetooth",
    speedControl: "تحكم في السرعات",
    speedMeter: "جهاز قياس السرعة",
    laneAssist: "مساعدة المسار",
    parkingHeater: "تدفئة أثناء الوقوف",
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

  const media = Array.isArray(listing.media) ? listing.media : [];
  const documents = Array.isArray(listing.documents) ? listing.documents : [];

  // حساب بيانات البائع (يدعم عدة أسماء حقول شائعة)
  const sellerName = listing?.seller_name || listing?.seller?.name || listing?.sellerName || "—";
  const sellerPhone = listing?.seller_phone || listing?.seller?.phone || listing?.phone || null;

  return (
    <div className="bg-sandLight min-h-screen font-cairo" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-textDark">{listing.title}</h1>
          <div className="text-sm text-textSoft mt-1 flex gap-4">
            <span>المعرف: {listing.id}</span>
            <span>تاريخ الإنشاء: {new Date(listing.created_at).toLocaleDateString('ar-SA')}</span>
          </div>

          {/* بيانات البائع */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div>
              <div className="text-textSoft">بائع الإعلان</div>
              <div className="font-medium">{sellerName}</div>
            </div>
            <div>
              <div className="text-textSoft">هاتف</div>
              {sellerPhone ? (
                <a className="font-medium text-blue-600" href={`tel:${sellerPhone}`}>{sellerPhone}</a>
              ) : (
                <div className="font-medium text-textSoft">—</div>
              )}
            </div>
          </div>
        </div>

        {/* Main layout: thumbnails | image | right panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Thumbnails column */}
          <div className="lg:col-span-2 flex lg:flex-col gap-3">
            {media.length > 0 ? (
              media.map((m, i) => {
                // استخدم نسخة مصغرة إن كانت متوفرة، وإلا استخدم نفس المسار (يمكن تعديل لتوليد ?w=200)
                const thumbUrl = getMediaUrl(m); // أو `${getMediaUrl(m)}?w=200` إذا يدعم السيرفر
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedMedia(i)}
                    className={`w-20 h-20 lg:w-full lg:h-24 rounded-lg overflow-hidden border ${selectedMedia === i ? 'ring-2 ring-green-400' : 'border-gray-200'}`}
                  >
                    {isVideo(m) ? (
                      <div className="w-full h-full bg-black flex items-center justify-center text-white">
                        <PlayIcon className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img src={thumbUrl} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        {smallMediaIndices.includes(i) && (
                          <div className="absolute top-1 left-1 text-xs bg-yellow-200 text-yellow-800 px-1 rounded">small</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="w-20 h-20 lg:w-full lg:h-24 bg-gray-100 rounded-md flex items-center justify-center text-textSoft">
                لا توجد صور
              </div>
            )}
          </div>

          {/* Main image / video */}
          <div className="lg:col-span-6">
            <Card className="bg-white shadow-card border-sandDark">
              <CardContent>
                <div className="w-full h-96 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  {media.length > 0 ? (
                    isVideo(media[selectedMedia]) ? (
                      <video controls className="w-full h-full object-cover" onClick={(e)=>e.stopPropagation()}>
                        <source src={getMediaUrl(media[selectedMedia])} />
                        متصفحك لا يدعم عرض الفيديو.
                      </video>
                    ) : (
                      // عرض الصورة عالية الدقة في العنصر الرئيسي (بدلاً من thumbnail)
                      <img
                        src={getHighResUrl(media[selectedMedia])}
                        alt="main media"
                        className="w-full h-full object-cover cursor-pointer"
                        srcSet={`${getHighResUrl(media[selectedMedia])}?w=800 800w, ${getHighResUrl(media[selectedMedia])}?w=1200 1200w, ${getHighResUrl(media[selectedMedia])}?w=1600 1600w`}
                        sizes="(min-width:1024px) 800px, 100vw"
                        onError={(e) => {
                          // فشل تحميل النسخة الكبيرة → حاول تحميل المسار الأصلي/البسيط كـ fallback
                          const fallback = getMediaUrl(media[selectedMedia]);
                          if (e.target.src !== fallback) e.target.src = fallback;
                        }}
                        onClick={() => { setLightboxIndex(selectedMedia); setShowLightbox(true); }}
                      />
                    )
                  ) : (
                    <div className="text-textSoft">لا توجد وسائط متاحة</div>
                  )}
                </div>

                {/* small info row under main media */}
                <div className="mt-4 flex items-center justify-between text-sm text-textSoft">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {listing.city || '—'}</span>
                    <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {listing.registration_year || 'سنة غير محددة'}</span>
                    <span className="flex items-center gap-1"><CurrencyDollarIcon className="w-4 h-4" /> {listing.kilometers ? `${listing.kilometers} كم` : '—'}</span>
                  </div>

                  <div className="text-sm text-textSoft">حالة الإعلان: {listing.approval_status}</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact / video block */}
            <div className="mt-4 space-y-3">
              {/* If there's a dedicated video URL field */}
              {listing.video && (
                <Card className="bg-white shadow-card border-sandDark">
                  <CardContent>
                    <div className="w-full aspect-video rounded-md overflow-hidden">
                      <video controls className="w-full h-full object-cover">
                        <source src={getMediaUrl(listing.video)} />
                      </video>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white shadow-card border-sandDark">
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                      اتصال بنا مباشرة
                    </Button>
                    <Button className="w-full border-gray-200 bg-white text-textDark py-3">
                      إرسال رسالة عبر WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right panel: price / summary */}
          <div className="lg:col-span-4">
            <Card className="bg-white shadow-card border-sandDark">
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-textSoft">السعر</div>
                      <div className="text-2xl font-bold text-textDark">{listing.price_in_sar ? `${listing.price_in_sar} ر.س` : '—'}</div>
                      {listing.price_in_points && <div className="text-sm text-textSoft">{listing.price_in_points} نقطة</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-textSoft">الشراء الفوري</div>
                      <div className="font-semibold">{listing.buy_now ? 'نعم' : 'لا'}</div>
                    </div>
                  </div>

                  {/* Auction timer (if present) */}
                  {listing.auction_end_at && (
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                      <div className="text-sm text-textSoft">وقت المتبقي للمزاد</div>
                      {/* simple remaining time — can be enhanced with interval */}
                      <div className="text-lg font-semibold">
                        {(() => {
                          const end = new Date(listing.auction_end_at);
                          const diff = Math.max(0, end - new Date());
                          const hrs = Math.floor(diff / 3600000);
                          const mins = Math.floor((diff % 3600000) / 60000);
                          const secs = Math.floor((diff % 60000) / 1000);
                          return `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
                        })()}
                      </div>
                    </div>
                  )}

                  <div>
                    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-textDark py-3 font-semibold">
                      ابدأ المزاد الآن
                    </Button>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-sm text-textSoft">تفاصيل سريعة</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between"><span>الموديل</span><span className="font-medium">{listing.model || '—'}</span></div>
                      <div className="flex justify-between"><span>رقم التسلسل</span><span className="font-medium">{listing.serial_number || '—'}</span></div>
                      <div className="flex justify-between"><span>عدد الكيلومترات</span><span className="font-medium">{listing.kilometers || '—'}</span></div>
                      <div className="flex justify-between"><span>نوع الوقود</span><span className="font-medium">{listing.fuel_type || '—'}</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="bg-white shadow-card border-sandDark mt-4">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-textDark flex items-center gap-2">
                  <DocumentArrowDownIcon className="w-5 h-5" /> الملفات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((d, idx) => (
                      <a key={idx} href={getMediaUrl(d)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                        <span className="text-sm">ملف {idx + 1}</span>
                        <span className="text-xs text-textSoft">تحميل</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-textSoft text-sm">لا توجد ملفات</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full specs & features section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="lg:col-span-2 bg-white shadow-card border-sandDark">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-textDark">مواصفات الشاحنة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><div className="text-textSoft">نوع الكابينة</div><div className="font-medium">{listing.cabin_type || '—'}</div></div>
                <div><div className="text-textSoft">الطول (سم)</div><div className="font-medium">{listing.length || '—'}</div></div>
                <div><div className="text-textSoft">العرض (سم)</div><div className="font-medium">{listing.width || '—'}</div></div>
                <div><div className="text-textSoft">الارتفاع (سم)</div><div className="font-medium">{listing.height || '—'}</div></div>
                <div><div className="text-textSoft">سعة المحرك</div><div className="font-medium">{listing.engine_capacity || '—'}</div></div>
                <div><div className="text-textSoft">ناقل الحركة</div><div className="font-medium">{listing.transmission || '—'}</div></div>
                <div className="md:col-span-3"><div className="text-textSoft">الوصف</div><div className="mt-2 bg-gray-50 p-3 rounded-md">{listing.description || 'لا يوجد وصف'}</div></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-card border-sandDark">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-textDark">المميزات</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.other && listing.other.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.other.map((f,i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>{featureLabels[f] || f}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-textSoft">لا توجد مميزات محددة</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lightbox / modal for high-res view */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <img
            src={getHighResUrl(media[lightboxIndex])}
            alt="zoomed"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* زرّ الموافقة / الرفض في أسفل الصفحة */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-6 flex justify-center gap-4">
        <Button onClick={handleApproveClick} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
          <CheckCircleIcon className="w-5 h-5 ml-2" /> الموافقه
        </Button>
        <Button onClick={handleRejectClick} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
          <XCircleIcon className="w-5 h-5 ml-2" /> رفض
        </Button>
      </div>

      {/* Modal for approval confirmation */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">تأكيد الموافقة على الإعلان</h3>
            {listing.ad_type === 'auction' && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">نوع المزاد</label>
                  <Select value={auctionType} onValueChange={setAuctionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                      <SelectItem value="live">مباشر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {auctionType === 'scheduled' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">تاريخ ووقت البدء</label>
                      <Input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">تاريخ ووقت الانتهاء</label>
                      <Input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">السعر المبدئي</label>
                  <Input
                    type="number"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder={listing.price_in_sar || ''}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                إلغاء
              </Button>
              <Button
                onClick={() => handleApprove({
                  auction_type: auctionType,
                  start_time: startTime,
                  end_time: endTime,
                  starting_price: startingPrice || listing.price_in_sar,
                })}
                className="bg-green-600 hover:bg-green-700"
              >
                تأكيد الموافقة
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for reject confirmation */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">تأكيد رفض الإعلان</h3>
            <p className="text-sm text-gray-600 mb-4">
              هل أنت متأكد من رفض هذا الإعلان؟ سيتم إرسال إشعار للبائع.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                تأكيد الرفض
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
