import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Auctions() {
  const navigate = useNavigate();

  const TAB_OPTIONS = [
    { id: "live", label: "المزادات المباشرة" },
    { id: "scheduled", label: "المزادات المجدولة" },
    { id: "ended", label: "المزادات المنتهية" },
  ];

  const [filter, setFilter] = useState("");

  // Dummy data (replace with API)
  const auctions = [
    {
      id: 1,
      title: "شاحنة مرسيدس 2019",
      status: "live",
      image: "/truck.png",
      participants: 22,
      price: 80500,
      type: "youtube",
      duration: "LIVE",
    },
    {
      id: 2,
      title: "فولفو FH 2020",
      status: "scheduled",
      image: "/truck2.png",
      participants: 9,
      price: 62000,
      start_time: "2025-11-20 10:00",
      end_time: "2025-11-23 22:00",
    },
    {
      id: 3,
      title: "سكانيا G410 2018",
      status: "ended",
      image: "/truck3.png",
      participants: 32,
      price: 90000,
      winner: "أحمد",
    },
  ];

  const filteredAuctions = (type) =>
    auctions.filter((a) => a.status === type && a.title.includes(filter));

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-dark">إدارة المزادات</h1>

      {/* Search */}
      <div className="mb-6 flex items-center gap-2 bg-sandLight border border-[#e6d4c4] rounded-soft p-2 w-full max-w-sm shadow-insetSoft">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="بحث عن شاحنة..."
          onChange={(e) => setFilter(e.target.value)}
          className="bg-transparent outline-none w-full"
        />
      </div>

      <Tabs defaultValue="live" className="">
        <TabsList className="bg-sandDark rounded-soft p-1 flex gap-4 w-fit mb-4 shadow-insetSoft">
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-primary-yellow data-[state=active]:text-white rounded-xl px-4 py-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---------------- LIVE AUCTIONS ---------------- */}
        <TabsContent value="live">
          <AuctionGrid
            items={filteredAuctions("live")}
            onOpen={(id) => navigate(`/live`)}
            labelColor="bg-red-600"
            label="LIVE"
          />
        </TabsContent>

        {/* ---------------- SCHEDULED AUCTIONS ---------------- */}
        <TabsContent value="scheduled">
          <AuctionGrid
            items={filteredAuctions("scheduled")}
            onOpen={(id) => navigate(`/auctions/scheduled/${id}`)}
            labelColor="bg-blue-600"
            label="Scheduled"
          />
        </TabsContent>

        {/* ---------------- ENDED AUCTIONS ---------------- */}
        <TabsContent value="ended">
          <AuctionGrid
            items={filteredAuctions("ended")}
            onOpen={(id) => navigate(`/auctions/ended/${id}`)}
            labelColor="bg-gray-600"
            label="Ended"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* GRID COMPONENT */
function AuctionGrid({ items, onOpen, labelColor, label }) {
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
                {item.price.toLocaleString()} ريال
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
              onClick={() => onOpen(item.id)}
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
