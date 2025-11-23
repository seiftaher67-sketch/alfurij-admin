import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { auctionAPI } from "../services/api";

export default function Auctions() {
  const navigate = useNavigate();

  // removed the "all" tab as requested
  const TAB_OPTIONS = [
    { id: "live", label: "المزادات المباشرة" },
    { id: "scheduled", label: "المزادات المجدولة" },
    { id: "pending", label: "المزادات المعلقة" },
    { id: "ended", label: "المزادات المنتهية" },
  ];

  // input state (typing) and applied filter (used by lists)
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");

  // Pagination states
  const [allPage, setAllPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [livePage, setLivePage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [endedPage, setEndedPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch auctions from API
  const { data: auctionsData, isLoading, error } = useQuery({
    queryKey: ['auctions'],
    queryFn: auctionAPI.getAuctions,
  });

  // Transform API data to match component format
  const auctions = auctionsData?.data?.map((auction) => {
    const statusMap = {
      'live': 'live',
      'upcoming': 'scheduled',
      'finished': 'ended',
      'pending': 'pending',
    };

    // Map auction type to UI status
    let mappedStatus;
    if (auction.type === 'live') {
      mappedStatus = 'live';
    } else if (auction.type === 'scheduled') {
      mappedStatus = 'scheduled';
    } else {
      mappedStatus = statusMap[auction.status] || auction.status;
    }

    return {
      id: auction.id,
      title: auction.listing.title,
      status: mappedStatus,
      type: auction.type,
      image: auction.listing.media?.[0] ? `http://localhost:8000/storage/${auction.listing.media[0].replace(/\\/g, '/')}` : '/truck.png', // Use first media or default
      participants: auction.participants_count,
      price: auction.current_price || auction.starting_price,
      start_time: auction.start_time,
      end_time: auction.end_time,
      winner: auction.winner?.name || null,
    };
  }) || [];

  const filteredAuctions = (type) =>
    type === "all"
      ? auctions.filter((a) => a.title.includes(filter))
      : auctions.filter((a) => a.status === type && a.title.includes(filter));

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-dark">إدارة المزادات</h1>

      {/* Search + button */}
      <div className="mb-6 flex items-center gap-2 w-full max-w-md">
        <div className="flex items-center gap-2 bg-sandLight border border-[#e6d4c4] rounded-full p-2 flex-1 shadow-insetSoft">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="بحث عن شاحنة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setFilter(searchTerm.trim()); }}
            className="bg-transparent outline-none w-full px-2"
          />
        </div>

        <button
          onClick={() => setFilter(searchTerm.trim())}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 shadow-md transition"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-semibold">بحث</span>
        </button>
      </div>

      <>
        {isLoading && <p className="text-center">جاري التحميل...</p>}
        {error && <p className="text-center text-red-500">خطأ في تحميل البيانات</p>}

        {!isLoading && !error && (
        <Tabs defaultValue="live" className="">
        {/* Styled professional tabs */}
        <TabsList className="bg-white rounded-full p-1 flex gap-3 w-fit mb-4 shadow-sm border border-[#E8DFD8]">
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-white data-[state=active]:shadow-lg px-5 py-2 rounded-full text-sm transition"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---------------- LIVE AUCTIONS ---------------- */}
        <TabsContent value="live">
          <AuctionGrid
            items={auctions.filter(a => a.title.includes(filter) && a.status === 'live')}
            onOpen={(item) => navigate(`/auctions/live-details/${item.id}`)}
            labelColor="bg-red-600"
            label="LIVE"
            currentPage={livePage}
            setCurrentPage={setLivePage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        {/* ---------------- SCHEDULED AUCTIONS ---------------- */}
        <TabsContent value="scheduled">
          <AuctionGrid
            items={auctions.filter(a => a.title.includes(filter) && a.status === 'scheduled')}
            onOpen={(item) => navigate(`/auctions/scheduled/${item.id}`)}
            labelColor="bg-blue-600"
            label="Scheduled"
            currentPage={scheduledPage}
            setCurrentPage={setScheduledPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        {/* ---------------- PENDING AUCTIONS ---------------- */}
        <TabsContent value="pending">
          <AuctionGrid
            items={auctions.filter(a => a.title.includes(filter) && a.status === 'pending')}
            onOpen={(item) => navigate(`/auctions/pending/${item.id}`)}
            labelColor="bg-yellow-600"
            label="Pending"
            currentPage={pendingPage}
            setCurrentPage={setPendingPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        {/* ---------------- ENDED AUCTIONS ---------------- */}
        <TabsContent value="ended">
          <AuctionGrid
            items={auctions.filter(a => a.title.includes(filter) && a.status === 'ended')}
            onOpen={(item) => navigate(`/auctions/ended/${item.id}`)}
            labelColor="bg-gray-600"
            label="Ended"
            currentPage={endedPage}
            setCurrentPage={setEndedPage}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>
      </Tabs>
      )}
      </>
    </div>
  );
}

/* GRID COMPONENT */
function AuctionGrid({ items, onOpen, labelColor, label, showTypeLabels = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-soft shadow-card border border-[#f3e1d3] hover:shadow-lg transition bg-sandLight overflow-hidden"
        >
          {/* Image */}
          <div className="relative">
            <img
              src={item.image}
              className="w-full h-40 object-cover"
              alt={item.title}
            />

            <span
              className={`absolute top-2 right-2 px-3 py-1 text-white text-xs rounded ${labelColor}`}
            >
              {label}
            </span>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h3 className="font-bold text-lg text-dark truncate">
              {item.title}
            </h3>

            <p className="text-sm text-gray-600">
              السعر الحالي:{" "}
              <span className="font-bold text-primary-yellow">
                {Number(item.price).toLocaleString()} ريال
              </span>
            </p>

            <p className="text-sm text-gray-600">
              المشاركين:{" "}
              <span className="font-bold">{item.participants}</span>
            </p>

            {item.status === "scheduled" && (
              <p className="text-xs text-gray-500">
                يبدأ: {item.start_time}
                <br />
                ينتهي: {item.end_time}
              </p>
            )}

            {item.status === "ended" && (
              <p className="text-xs text-green-700 font-semibold">
                الفائز: {item.winner}
              </p>
            )}

            <button
              onClick={() => onOpen(item)}
              className="w-full bg-primary-yellow text-black py-2 mt-2 rounded-lg hover:bg-yellow-500 transition"
            >
              عرض التفاصيل
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
