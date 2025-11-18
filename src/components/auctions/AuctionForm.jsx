import React from "react";
import { useForm } from "react-hook-form";

export default function AuctionForm({ listing }) {
  const { register, handleSubmit } = useForm({ defaultValues: { type: "live" } });

  const onCreate = (data) => {
    console.log("Creating auction:", data);
    // TODO: Integrate with API
  };

  return (
    <form onSubmit={handleSubmit(onCreate)} className="p-4 space-y-4 bg-white rounded shadow mt-4">
      <label className="block">
        Type
        <select {...register("type")} className="w-full p-2 border rounded mt-1">
          <option value="live">Live</option>
          <option value="open">Open (days)</option>
        </select>
      </label>

      <label className="block">
        Start Date
        <input type="datetime-local" {...register("start")} className="w-full p-2 border rounded mt-1" />
      </label>

      <label className="block">
        End Date (if open)
        <input type="datetime-local" {...register("end")} className="w-full p-2 border rounded mt-1" />
      </label>

      <label className="block">
        Starting Bid
        <input {...register("startingBid")} className="w-full p-2 border rounded mt-1" />
      </label>

      <label className="block">
        Bid Step
        <input {...register("bidStep")} className="w-full p-2 border rounded mt-1" />
      </label>

      <button className="px-4 py-2 bg-brand-500 text-white rounded" type="submit">
        Create Auction
      </button>
    </form>
  );
}
