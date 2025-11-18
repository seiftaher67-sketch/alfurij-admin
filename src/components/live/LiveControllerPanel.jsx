import React, { useState } from "react";
import client from "../../api/client";

export default function LiveControllerPanel({ auction }) {
  const [streamUrl, setStreamUrl] = useState("");
  const [isLive, setIsLive] = useState(false);

  const start = async () => {
    try {
      await client.post("/live/start", { auctionId: auction?.id || 1, platform: "youtube", streamUrl });
      setIsLive(true);
    } catch (error) {
      console.error("Failed to start live:", error);
    }
  };

  const stop = async () => {
    try {
      await client.post("/live/stop", { auctionId: auction?.id || 1 });
      setIsLive(false);
    } catch (error) {
      console.error("Failed to stop live:", error);
    }
  };

  return (
    <div className="mt-4 bg-sandLight p-4 rounded-soft shadow-card border border-[#f3e1d3]">
      <label className="block mb-2">
        Stream URL
        <input
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          className="w-full p-2 border rounded mt-1"
          placeholder="Enter stream URL"
        />
      </label>

      <div className="flex items-center gap-4 mb-4">
        {!isLive ? (
          <button onClick={start} className="px-4 py-2 bg-green-600 text-white rounded">
            Start Live
          </button>
        ) : (
          <button onClick={stop} className="px-4 py-2 bg-red-600 text-white rounded">
            Stop Live
          </button>
        )}
        <span className={`font-semibold ${isLive ? "text-red-600" : "text-green-600"}`}>
          {isLive ? "مباشر الآن" : "غير مباشر"}
        </span>
      </div>

      <div className="bg-slate-200 h-64 rounded flex items-center justify-center">
        <p>نافذة البث المباشر</p>
      </div>
    </div>
  );
}
