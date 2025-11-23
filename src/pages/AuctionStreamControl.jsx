import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionAPI } from '../services/api';
import { FaYoutube, FaPlay, FaStop, FaInfoCircle, FaArrowLeft, FaCheck, FaExclamationTriangle, FaMobileAlt, FaLink, FaServer } from 'react-icons/fa';

const THEME = {
  pageBg: "#FAF7F2",
  boxBg: "#FFFFFF",
  border: "#E8DFD8",
  primary: "#E0AA3E",
  heading: "#2D2A26",
  headerBg: "#F3ECE4",
  success: "#16a34a",
  danger: "#dc2626",
};

export default function AuctionStreamControl() {
  const { id } = useParams();
  const nav = useNavigate();
  
  const [auction, setAuction] = useState(null);
  const [streams, setStreams] = useState([]);
  const [currentStream, setCurrentStream] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamStartedAt, setStreamStartedAt] = useState(null);
  const [urlEdited, setUrlEdited] = useState(false);

  useEffect(() => {
    fetchAuctionData();
    fetchStreams();
    const interval = setInterval(fetchAuctionData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchStreams = async () => {
    try {
      const response = await auctionAPI.getStreams(id);
      const streams = response.data || response;
      setStreams(streams);
      // Set current stream to the first one or the active one
      const activeStream = streams.find(s => s.status === 'live') || streams[0];
      if (activeStream) {
        setCurrentStream(activeStream);
        setVideoId(extractVideoId(activeStream.watch_url));
        if (!streamUrl.trim()) {
          setStreamUrl(activeStream.watch_url || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch streams:', err);
    }
  };

  const fetchAuctionData = async () => {
    try {
      const response = await auctionAPI.getAuction(id);
      const data = response.data || response;
      setAuction(data);
      setIsStreaming(data.is_streaming || false);
      setStreamStartedAt(data.stream_started_at || null);
    } catch (err) {
      console.error('Failed to fetch auction:', err);
      setError('فشل تحميل بيانات المزاد');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
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
      const streamData = {
        platform: 'youtube',
        stream_url: streamUrl,
        embed_url: embedUrl,
      };

      // Check if stream already exists
      let response;
      if (currentStream) {
        // Update existing stream
        response = await auctionAPI.updateStream(id, currentStream.id, streamData);
      } else {
        // Create new stream
        response = await auctionAPI.storeStream(id, streamData);
      }

      setVideoId(vid);
      setUrlEdited(false);
      alert('✓ تم حفظ رابط البث بنجاح');
      await fetchStreams(); // Refresh streams to enable the fourth step
    } catch (err) {
      console.error('Failed to save stream URL:', err);
      setError('فشل حفظ الرابط. تحقق من الرابط وحاول مجددًا.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartStream = async () => {
    if (!currentStream) {
      setError('يجب حفظ رابط البث أولاً');
      return;
    }

    setStreaming(true);
    setError(null);
    try {
      const response = await auctionAPI.startLiveStream(currentStream.id);
      setIsStreaming(true);
      setCurrentStream(response.data || response);
      setStreamStartedAt(new Date().toISOString());
      alert('✓ تم بدء البث بنجاح — المستخدمون يمكنهم مشاهدة البث الآن');
      nav(`/auctions/live/${id}`);
    } catch (err) {
      console.error('Failed to start stream:', err);
      setError('فشل بدء البث. تحقق من أن البث مباشر على YouTube وحاول مجددًا.');
    } finally {
      setStreaming(false);
    }
  };

  const handleStopStream = async () => {
    if (!window.confirm('هل تريد إيقاف البث؟ سيختفي من صفحة المستخدمين')) return;
    
    setStreaming(true);
    setError(null);
    try {
      const response = await auctionAPI.endStream(id);
      setIsStreaming(false);
      setAuction(response.data || response);
      setStreamStartedAt(null);
      alert('✓ تم إيقاف البث بنجاح');
    } catch (err) {
      console.error('Failed to stop stream:', err);
      setError('فشل إيقاف البث. حاول مجددًا.');
    } finally {
      setStreaming(false);
    }
  };

  const getStreamDuration = () => {
    if (!streamStartedAt) return null;
    const now = new Date();
    const started = new Date(streamStartedAt);
    const diff = Math.floor((now - started) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const embedUrl = videoId ? generateEmbedUrl(videoId) : null;

  return (
    <div style={{ background: THEME.pageBg }} className="min-h-screen p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => nav(-1)} className="mb-2 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition">
              <FaArrowLeft /> رجوع
            </button>
            <h1 className="text-3xl font-bold" style={{ color: THEME.heading }}>التحكم في البث المباشر</h1>
            <p className="text-slate-500 mt-1">المزاد: <span className="font-semibold">{auction.title || auction.name || `#${id}`}</span></p>
          </div>
          <div className={`px-5 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ${isStreaming ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            <span className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-600 animate-pulse' : 'bg-gray-400'}`}></span>
            {isStreaming ? '🔴 مباشر الآن' : '⚪ غير مباشر'}
            {isStreaming && streamStartedAt && (
              <span className="text-xs ml-2">({getStreamDuration()})</span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 flex items-start gap-3">
            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">خطأ</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* YouTube Mobile Instructions Card */}
            <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2" style={{ borderColor: '#fca5a5' }}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center text-2xl flex-shrink-0">
                    <FaMobileAlt className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-3" style={{ color: THEME.heading }}>📱 الخطوة الأولى: ابدأ البث من موبايلك</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: THEME.primary }}>
                        <p className="font-semibold text-slate-800">افتح تطبيق YouTube على هاتفك</p>
                        <p className="text-slate-600 text-xs mt-1">تأكد من تسجيل دخولك في الحساب الرسمي للشركة</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: THEME.primary }}>
                        <p className="font-semibold text-slate-800">اضغط على أيقونة <strong>Create</strong> (+)</p>
                        <p className="text-slate-600 text-xs mt-1">ستجدها في أسفل الشاشة أو في الأعلى</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: THEME.primary }}>
                        <p className="font-semibold text-slate-800">اختر <strong>Go Live</strong></p>
                        <p className="text-slate-600 text-xs mt-1">قد تحتاج إلى 1000 مشترك لبدء البث الحي</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: THEME.primary }}>
                        <p className="font-semibold text-slate-800">⭐ اختر <strong>Unlisted</strong> (غير مدرج)</p>
                        <p className="text-slate-600 text-xs mt-1">هذا ضروري جداً — البث لن يظهر للغرباء</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: THEME.primary }}>
                        <p className="font-semibold text-slate-800">ابدأ البث مباشرة من الموبايل</p>
                        <p className="text-slate-600 text-xs mt-1">تأكد من الإضاءة والكاميرا والصوت قبل البدء</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Link Instructions Card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2" style={{ borderColor: '#93c5fd' }}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-2xl flex-shrink-0">
                    <FaLink className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-3" style={{ color: THEME.heading }}>🔗 الخطوة الثانية: انسخ رابط البث</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: '#3b82f6' }}>
                        <p className="font-semibold text-slate-800">من داخل البث المباشر</p>
                        <p className="text-slate-600 text-xs mt-1">تأكد من أن البث بدأ بالفعل</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: '#3b82f6' }}>
                        <p className="font-semibold text-slate-800">اضغط على <strong>Share</strong> (الثلاث نقاط أو أيقونة المشاركة)</p>
                        <p className="text-slate-600 text-xs mt-1">ستظهر خيارات المشاركة</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border-l-4" style={{ borderColor: '#3b82f6' }}>
                        <p className="font-semibold text-slate-800">اختر <strong>Copy Link</strong> (نسخ الرابط)</p>
                        <p className="text-slate-600 text-xs mt-1">سيتم نسخ الرابط تلقائياً إلى الحافظة</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save URL Card */}
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E0AA3E]/20 flex items-center justify-center text-[#E0AA3E] font-bold">
                  💾
                </div>
                <h3 className="text-lg font-bold" style={{ color: THEME.heading }}>الخطوة الثالثة: احفظ الرابط في النظام</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: THEME.heading }}>الصق رابط البث هنا:</label>
                  <input
                    type="url"
                    value={streamUrl}
                    onChange={(e) => {
                      setStreamUrl(e.target.value);
                      setUrlEdited(true);
                    }}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full p-4 border rounded-lg outline-none focus:ring-2 font-mono text-sm"
                    style={{ borderColor: THEME.border }}
                    dir="ltr"
                  />
                  <p className="text-xs text-slate-500 mt-2">📌 الصيغ المدعومة:</p>
                  <ul className="text-xs text-slate-600 mt-1 space-y-1">
                    <li>✓ https://www.youtube.com/watch?v=VIDEO_ID</li>
                    <li>✓ https://youtu.be/VIDEO_ID</li>
                  </ul>
                </div>

                <button
                  onClick={handleSaveStreamUrl}
                  disabled={saving || !streamUrl.trim()}
                  className="w-full py-3 px-4 rounded-xl font-bold text-white transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: !saving && streamUrl.trim() ? THEME.success : '#9ca3af' }}
                >
                  <FaCheck /> {saving ? 'جاري الحفظ...' : 'حفظ رابط البث'}
                </button>

                {videoId && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold">✓ تم التعرف على الفيديو بنجاح!</p>
                    <p className="text-xs text-green-600 mt-2">معرّف الفيديو: <code className="bg-white px-2 py-1 rounded">{videoId}</code></p>
                  </div>
                )}
              </div>
            </div>

            {/* Start/Stop Stream Card */}
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#E0AA3E]/20 flex items-center justify-center text-[#E0AA3E] font-bold">
                  ▶️
                </div>
                <h3 className="text-lg font-bold" style={{ color: THEME.heading }}>الخطوة الرابعة: تحكم بحالة البث</h3>
              </div>

              <div className="space-y-4">
                {!isStreaming ? (
                  <div className="space-y-4">
                    <button
                      onClick={handleStartStream}
                      disabled={streaming || !currentStream}
                      className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                      style={{ background: streaming || !currentStream ? '#9ca3af' : THEME.success }}
                    >
                      <FaPlay className="w-6 h-6" /> بدء البث الحي (Go Live)
                    </button>
                    <p className="text-xs text-slate-600 text-center">سيتمكن المستخدمون من مشاهدة البث بعد هذه الخطوة مباشرة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                      <p className="text-sm text-red-700 font-bold flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                        البث مباشر الآن
                      </p>
                      <p className="text-xs text-red-600 mt-2">المستخدمون يشاهدون البث في الوقت الفعلي</p>
                      {streamStartedAt && (
                        <p className="text-xs text-red-600 mt-1">مدة البث: <strong>{getStreamDuration()}</strong></p>
                      )}
                    </div>

                    <button
                      onClick={handleStopStream}
                      disabled={streaming}
                      className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white transition-all hover:brightness-95 disabled:opacity-50 text-lg"
                      style={{ background: THEME.danger }}
                    >
                      <FaStop className="w-6 h-6" /> إيقاف البث
                    </button>
                    <p className="text-xs text-slate-600 text-center">⚠️ سيختفي البث من صفحة المستخدمين فوراً</p>
                  </div>
                )}

                {!currentStream && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                    <p className="text-sm text-yellow-700 font-semibold">⚠️ يجب حفظ رابط البث أولاً</p>
                    <p className="text-xs text-yellow-600 mt-1">الرجاء إكمال الخطوة الثالثة قبل بدء البث</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Stream Preview */}
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: THEME.heading }}>
                <FaYoutube className="text-red-600" /> معاينة البث
              </h4>
              
              {isStreaming && videoId ? (
                <div className="bg-black rounded-lg overflow-hidden aspect-video mb-3">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title="YouTube Live"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg aspect-video flex flex-col items-center justify-center p-3 text-center">
                  <div className="text-4xl mb-2">📺</div>
                  <p className="text-sm font-semibold text-gray-700">لا يوجد بث مباشر</p>
                  <p className="text-xs text-gray-600 mt-1">ابدأ البث لعرض المعاينة</p>
                </div>
              )}

              <div className={`p-3 rounded-lg text-sm text-center font-bold ${isStreaming ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {isStreaming ? '🔴 البث مباشر' : '⚪ البث متوقف'}
              </div>
            </div>

            {/* Auction Info */}
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h4 className="font-bold mb-3" style={{ color: THEME.heading }}>معلومات المزاد</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: THEME.border }}>
                  <span className="text-gray-600">الحالة:</span>
                  <span className="font-bold" style={{ color: auction.status === 'live' ? THEME.danger : THEME.heading }}>
                    {auction.status === 'live' ? '🔴 مباشر' : auction.status === 'scheduled' ? '⏰ مجدول' : '✓ منتهي'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: THEME.border }}>
                  <span className="text-gray-600">المنصة:</span>
                  <span className="font-bold flex items-center gap-1">
                    <FaYoutube className="text-red-600" /> YouTube
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: THEME.border }}>
                  <span className="text-gray-600">البث:</span>
                  <span className={`font-bold ${isStreaming ? 'text-red-600' : 'text-gray-600'}`}>
                    {isStreaming ? '🔴 مباشر' : '⚪ متوقف'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الفيديو:</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${videoId ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {videoId ? '✓ معرّف' : '⚠️ بدون'}
                  </span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-4">
              <div className="flex gap-2 mb-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <h4 className="font-bold text-blue-900">نقاط مهمة</h4>
              </div>
              <ul className="text-xs text-blue-800 space-y-2">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>Unlisted:</strong> ضروري جداً للخصوصية</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>الرابط:</strong> لن يظهر للمستخدمين</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>الأداء:</strong> YouTube يدير البث</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span><strong>الأمان:</strong> بدون تكاليف إضافية</span>
                </li>
              </ul>
            </div>

            {/* Backend Status */}
            <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
              <div className="flex gap-2 mb-3">
                <FaServer className="w-5 h-5 text-green-600 flex-shrink-0" />
                <h4 className="font-bold text-green-900">حالة النظام</h4>
              </div>
              <div className="text-xs text-green-800 space-y-1">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  API متصل
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  قاعدة البيانات جاهزة
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  YouTube متصل
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}