import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionAPI } from '../services/api';
import { FaYoutube, FaCopy, FaCheck, FaPlay, FaStop, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';

const THEME = {
  pageBg: "#FAF7F2",
  boxBg: "#FFFFFF",
  border: "#E8DFD8",
  primary: "#E0AA3E",
  heading: "#2D2A26",
  headerBg: "#F3ECE4",
};

export default function AuctionDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [auction, setAuction] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    fetchAuction();
  }, [id]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getAuction(id);
      setAuction(response.data || response);
      setStreamUrl(response.data?.stream_watch_url || response.stream_watch_url || '');
      setEmbedUrl(response.data?.stream_embed_url || response.stream_embed_url || '');
      setIsStreaming(response.data?.is_streaming || response.is_streaming || false);
      setVideoId(response.data?.video_id || response.video_id || null);
    } catch (err) {
      console.error('Failed to fetch auction:', err);
      setError('فشل تحميل بيانات المزاد');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\&\?\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const generateEmbedUrl = (vid) => {
    return `https://www.youtube.com/embed/${vid}?autoplay=1`;
  };

  const handleSaveStreamUrl = async () => {
    if (!streamUrl.trim()) {
      setError('يرجى إدخال رابط البث');
      return;
    }

    const vid = extractVideoId(streamUrl);
    if (!vid) {
      setError('رابط YouTube غير صحيح. تأكد من صيغة الرابط.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const embedUrl = generateEmbedUrl(vid);
      const response = await auctionAPI.updateAuction(id, {
        stream_watch_url: streamUrl,
        stream_embed_url: embedUrl,
        video_id: vid,
        platform: 'youtube',
      });
      
      setAuction(response.data || response);
      setEmbedUrl(embedUrl);
      setVideoId(vid);
      alert('✓ تم حفظ رابط البث بنجاح');
    } catch (err) {
      console.error('Failed to save stream URL:', err);
      setError('فشل حفظ الرابط. تحقق من الرابط وحاول مجددًا.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartStream = async () => {
    if (!videoId) {
      setError('يجب حفظ رابط البث أولاً');
      return;
    }

    setStreaming(true);
    setError(null);
    try {
      const response = await auctionAPI.startStream(id);
      setIsStreaming(true);
      setAuction(response.data || response);
      alert('✓ تم بدء البث بنجاح');
    } catch (err) {
      console.error('Failed to start stream:', err);
      setError('فشل بدء البث. حاول مجددًا.');
    } finally {
      setStreaming(false);
    }
  };

  const handleStopStream = async () => {
    setStreaming(true);
    setError(null);
    try {
      const response = await auctionAPI.endStream(id);
      setIsStreaming(false);
      setAuction(response.data || response);
      alert('✓ تم إيقاف البث');
    } catch (err) {
      console.error('Failed to stop stream:', err);
      setError('فشل إيقاف البث. حاول مجددًا.');
    } finally {
      setStreaming(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ background: THEME.pageBg }} className="min-h-screen p-6 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E0AA3E] mx-auto mb-4"></div>
          <p className="text-slate-600">جاري تحميل بيانات المزاد...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div style={{ background: THEME.pageBg }} className="min-h-screen p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => nav(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <FaArrowLeft /> رجوع
          </button>
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-red-600">لم يتم العثور على المزاد</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: THEME.pageBg }} className="min-h-screen p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => nav(-1)} className="mb-2 flex items-center gap-2 text-slate-600 hover:text-slate-800">
              <FaArrowLeft /> رجوع
            </button>
            <h1 className="text-3xl font-bold" style={{ color: THEME.heading }}>إدارة البث المباشر</h1>
            <p className="text-slate-500 mt-1">المزاد: {auction.title || auction.name || `#${id}`}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${isStreaming ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            {isStreaming ? '🔴 مباشر الآن' : '⚪ غير مباشر'}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Control Section (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Instructions Card */}
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E0AA3E]/20 flex items-center justify-center text-[#E0AA3E] font-bold flex-shrink-0">
                  📱
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2" style={{ color: THEME.heading }}>الخطوة 1: ابدأ البث من الموبايل</h3>
                  <p className="text-slate-600 text-sm mb-3">اتبع هذه الخطوات على هاتفك الذكي:</p>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">1.</span>
                      <span>افتح تطبيق <strong>YouTube</strong> على هاتفك</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">2.</span>
                      <span>اضغط على زر <strong>Create</strong> (أيقونة الإضافة)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">3.</span>
                      <span>اختر <strong>Go Live</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">4.</span>
                      <span>تأكد من اختيار <strong>Unlisted</strong> (غير مدرج) في الخيارات</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">5.</span>
                      <span>ابدأ البث مباشرة من الموبايل</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Step 2: Copy Link Card */}
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E0AA3E]/20 flex items-center justify-center text-[#E0AA3E] font-bold flex-shrink-0">
                  🔗
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2" style={{ color: THEME.heading }}>الخطوة 2: انسخ رابط البث</h3>
                  <p className="text-slate-600 text-sm mb-3">من داخل البث المباشر:</p>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">1.</span>
                      <span>اضغط على زر <strong>Share</strong> (مشاركة)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">2.</span>
                      <span>اختر <strong>Copy Link</strong> (نسخ الرابط)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-[#E0AA3E] min-w-[24px]">3.</span>
                      <span>سيتم نسخ الرابط تلقائيًا</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Step 3: Save URL Card */}
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E0AA3E]/20 flex items-center justify-center text-[#E0AA3E] font-bold flex-shrink-0">
                  💾
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: THEME.heading }}>الخطوة 3: احفظ الرابط هنا</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>رابط البث (YouTube)</label>
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 border rounded-lg outline-none focus:ring-2"
                    style={{ borderColor: THEME.border, focusRing: THEME.primary }}
                  />
                  <p className="text-xs text-slate-500 mt-2">الصيغة الصحيحة: https://www.youtube.com/watch?v=VIDEO_ID أو https://youtu.be/VIDEO_ID</p>
                </div>

                <button
                  onClick={handleSaveStreamUrl}
                  disabled={saving || !streamUrl.trim()}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: !saving && streamUrl.trim() ? '#16a34a' : '#9ca3af' }}
                >
                  {saving ? 'جاري الحفظ...' : '✓ حفظ رابط البث'}
                </button>

                {videoId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">✓ تم التعرف على الفيديو بنجاح</p>
                    <p className="text-xs text-green-600 mt-1">معرّف الفيديو: {videoId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Start/Stop Stream Card */}
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E0AA3E]/20 flex items-center justify-center text-[#E0AA3E] font-bold flex-shrink-0">
                  ▶️
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: THEME.heading }}>الخطوة 4: تحكم بحالة البث</h3>
                </div>
              </div>

              <div className="flex gap-3">
                {!isStreaming ? (
                  <button
                    onClick={handleStartStream}
                    disabled={streaming || !videoId}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: streaming || !videoId ? '#9ca3af' : '#16a34a' }}
                  >
                    <FaPlay className="w-5 h-5" /> بدء البث (Go Live)
                  </button>
                ) : (
                  <button
                    onClick={handleStopStream}
                    disabled={streaming}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white transition-all hover:brightness-95 disabled:opacity-50"
                    style={{ background: '#dc2626' }}
                  >
                    <FaStop className="w-5 h-5" /> إيقاف البث
                  </button>
                )}
              </div>

              {isStreaming && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ✓ البث مباشر الآن — يمكن للمستخدمين مشاهدته من صفحة المزاد
                  </p>
                </div>
              )}

              {!videoId && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    ⚠️ يجب حفظ رابط البث أولاً قبل بدء البث
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Preview (1 col) */}
          <div className="space-y-6">
            {/* Stream Preview */}
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="font-bold mb-4" style={{ color: THEME.heading }}>معاينة البث</h3>
              
              {isStreaming && videoId ? (
                <div className="bg-black rounded-lg overflow-hidden aspect-video mb-3">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`${embedUrl}`}
                    title="YouTube Live"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📺</div>
                    <p className="text-sm text-gray-600">لا يوجد بث مباشر حالياً</p>
                    <p className="text-xs text-gray-500 mt-1">ابدأ البث لمشاهدة المعاينة</p>
                  </div>
                </div>
              )}

              <div className={`p-3 rounded-lg text-sm text-center font-medium ${isStreaming ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {isStreaming ? '🔴 البث مباشر' : '⚪ البث متوقف'}
              </div>
            </div>

            {/* Quick Info */}
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h4 className="font-bold mb-3" style={{ color: THEME.heading }}>معلومات المزاد</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الحالة:</span>
                  <span className="font-semibold" style={{ color: THEME.heading }}>{auction.status || 'مجدول'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">النوع:</span>
                  <span className="font-semibold" style={{ color: THEME.heading }}>YouTube</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">البث:</span>
                  <span className={`font-semibold ${isStreaming ? 'text-red-600' : 'text-gray-600'}`}>
                    {isStreaming ? 'مباشر' : 'متوقف'}
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <div className="flex gap-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-semibold mb-1">نصيحة مهمة</p>
                  <p>تأكد من أن البث على YouTube مضبوط على "Unlisted" (غير مدرج) لضمان الخصوصية والأمان.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
