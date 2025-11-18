import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Uploader from "../ui/Uploader";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import client from "../../api/client";

function SortableBanner({ banner, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: banner.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 p-4 border rounded cursor-move bg-white shadow-sm"
    >
      <img src={banner.image} alt={banner.title} className="w-32 h-12 object-cover rounded" />
      <span className="flex-1">{banner.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(banner.id);
        }}
        className="text-red-600 hover:text-red-800"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function BannersManager() {
  const [banners, setBanners] = useState([
    { id: 1, title: "Banner 1", image: "https://picsum.photos/300/100" },
    { id: 2, title: "Banner 2", image: "https://picsum.photos/300/100" },
  ]);
  const [newBanner, setNewBanner] = useState({ title: "", image: "" });

  const handleChange = (e) => {
    setNewBanner({ ...newBanner, [e.target.name]: e.target.value });
  };

  const addBanner = async () => {
    if (!newBanner.title || !newBanner.image) return;
    try {
      // await client.post("/banners", newBanner);
      setBanners([...banners, { ...newBanner, id: Date.now() }]);
      setNewBanner({ title: "", image: "" });
    } catch (error) {
      console.error("Failed to add banner:", error);
    }
  };

  const deleteBanner = async (id) => {
    try {
      // await client.delete(`/banners/${id}`);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBanners((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        return newItems;
      });
    }
  };

  return (
    <div className="mt-4 bg-sandLight p-4 rounded-soft shadow-card border border-[#f3e1d3]">
      <h3 className="text-lg font-semibold mb-4">إدارة البانرات</h3>

 <div className="space-y-4">
        <input
          name="title"
          value={newBanner.title}
          onChange={handleChange}
          placeholder="عنوان البانر"
          className="w-full p-2 border rounded"
        />
        <Uploader
          title="رفع صورة"
          name="image"
          file={newBanner.image}
          icon={<PhotoIcon className="h-10 w-10 text-gray-400" />}
          accept="image/*"
          onChange={handleChange}
        />
        <button onClick={addBanner} className="px-4 py-2 mb-5 bg-blue-600 text-white rounded">
          إضافة بانر
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 mb-6">
            {banners.map((banner) => (
              <SortableBanner key={banner.id} banner={banner} onDelete={deleteBanner} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

     
    </div>
  );
}
