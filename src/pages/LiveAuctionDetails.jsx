import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlayCircle, FaImages, FaMapMarkerAlt, FaClock, FaTag } from 'react-icons/fa';
import { auctionAPI } from '../services/api';


const DetailItem = ({ label, value, isBadge }) => (
    <div className="py-3 px-4 bg-gray-50 rounded-lg flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        {isBadge ? (
            <span className="text-sm font-bold px-3 py-1 bg-green-100 text-green-800 rounded-full">{value}</span>
        ) : (
            <span className="text-sm text-gray-900 font-medium">{value || '-'}</span>
        )}
    </div>
);

export default function LiveAuctionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // new: gallery state
    const [images, setImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const loadAuctionData = async () => {
            try {
                setLoading(true);
                const response = await auctionAPI.getAuction(id);
                const data = response.data || response;

                // Clean media URLs by removing escaped forward slashes
                if (data.listing && data.listing.media) {
                    data.listing.media = data.listing.media.map(url =>
                        url.replace(/\\\//g, '/')
                    );
                }

                setAuction(data);

                // prepare images (safe mapping)
                const media = (data.listing?.media && Array.isArray(data.listing.media)) ? data.listing.media : [];
                // function to build full URL for media files
                const getMediaUrl = (p) => {
                    if (!p) return null;
                    if (p.startsWith('http://') || p.startsWith('https://')) return p;
                    // Use full backend URL since images are served from backend
                    return `http://localhost:8000/storage/${p}`;
                };
                const imgs = media.map((m) => getMediaUrl(m)).filter(Boolean);
                setImages(imgs);
                setActiveIndex(0);
            } catch (err) {
                console.error("Failed to fetch auction details:", err);
                setError("فشل تحميل بيانات المزاد.");
            } finally {
                setLoading(false);
            }
        };
        loadAuctionData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل تفاصيل المزاد...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50" dir="rtl">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
                    <p className="text-red-600">{error}</p>
                    <button onClick={() => navigate(-1)} className="mt-6 flex items-center gap-2 text-sm text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg">
                        <FaArrowLeft /> رجوع
                    </button>
                </div>
            </div>
        );
    }
    
    if (!auction) return null;

    const { listing } = auction;

    return (
        <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                            <FaArrowLeft /> رجوع إلى المزادات
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">
                            تفاصيل المزاد المباشر: {listing.title}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">إعلان #{listing.id} — {listing.category} — {listing.city}</p>
                    </div>
                    <Link 
                        to={`/auctions/${id}/stream`}
                        className="flex items-center gap-3 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105"
                    >
                        <FaPlayCircle />
                        <span>حفظ الرابط وعرض البث</span>
                    </Link>
                </div>

                {/* Gallery + Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Large image */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-2xl p-4 shadow-md">
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                                {images.length > 0 ? (
                                    <img
                                        src={images[activeIndex]}
                                        alt={`image-${activeIndex}`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <FaImages className="mx-auto text-4xl mb-2" />
                                            <p className="text-sm">لا توجد صور متاحة</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* thumbnails */}
                            {images.length > 0 && (
                                <div className="mt-4 overflow-x-auto">
                                    <div className="flex gap-3">
                                        {images.map((src, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveIndex(i)}
                                                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 ${i === activeIndex ? 'border-yellow-400' : 'border-transparent'} shadow-sm`}
                                                style={{ width: 110, height: 70 }}
                                            >
                                                <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Short summary card */}
                        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{listing.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">{listing.description || 'لا يوجد وصف إضافي'}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2"><FaMapMarkerAlt /> {listing.city || '-'}</div>
                                    <div className="flex items-center gap-2"><FaClock /> بدء: {new Date(auction.start_time).toLocaleString('ar-SA')}</div>
                                    <div className="flex items-center gap-2"><FaTag /> {listing.condition}</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm text-gray-500">السعر المبدئي</div>
                                <div className="text-3xl font-bold text-yellow-600">{Number(auction.starting_price).toLocaleString()} ر.س</div>
                                <div className="mt-3">
                                    <Link to={`/auctions/${id}/stream`} className="inline-block bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold shadow">
                                        افتح لوحة البث
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column: details & specs */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 border-b pb-3">مواصفات المركبة</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DetailItem label="الموديل" value={listing.model} />
                                <DetailItem label="اللون" value={listing.color} />
                                <DetailItem label="المسافة المقطوعة" value={`${listing.kilometers} كم`} />
                                <DetailItem label="ناقل الحركة" value={listing.transmission} />
                                <DetailItem label="نوع الوقود" value={listing.fuel_type} />
                                <DetailItem label="سعة المحرك" value={listing.engine_capacity} />
                                <DetailItem label="عدد المشاركين" value={auction.participants_count} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 border-b pb-3">تفاصيل المزاد</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DetailItem label="رقم المزاد" value={auction.id} />
                                <DetailItem label="الحالة" value={auction.status} isBadge={true} />
                                <DetailItem label="أقل زيادة" value={`${auction.min_increment} ر.س`} />
                                <DetailItem label="رسوم الانضمام" value={`${auction.join_fee} ر.س`} />
                                <DetailItem label="وقت الإنشاء" value={new Date(auction.created_at).toLocaleString('ar-SA')} />
                            </div>
                        </div>

                        
                    </div>
                </div>

                {/* Full description card */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-xl font-bold mb-4 border-b pb-3">الوصف الكامل</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{listing.description || 'لا يوجد وصف إضافي.'}</p>
                </div>
            </div>
        </div>
    );
}
