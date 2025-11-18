import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Uploader from "../ui/Uploader";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { bannerAPI } from "../../services/api";

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
        onMouseDown={(e) => e.stopPropagation()}
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
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({ title: "", image: "" });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await bannerAPI.getBanners();
      setBanners(data.map(banner => ({
        ...banner,
        image: banner.image_path
      })));
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewBanner({ ...newBanner, [e.target.name]: e.target.value });
  };

  const addBanner = async () => {
    if (!newBanner.title || !newBanner.image) return;
    try {
      const data = await bannerAPI.addBanner(newBanner);
      setBanners([...banners, {
        ...data,
        image: `http://localhost:8000/storage/${data.image_path}`
      }]);
      setNewBanner({ title: "", image: "" });
    } catch (error) {
      console.error("Failed to add banner:", error);
    }
  };

  const deleteBanner = async (id) => {
    try {
      await bannerAPI.deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
      setShowDeleteModal(false);
      setBannerToDelete(null);
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setBannerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (bannerToDelete) {
      deleteBanner(bannerToDelete);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
  };

  const saveOrder = async () => {
    try {
      const order = banners.map(b => b.id);
      await bannerAPI.updateOrder(order);
      alert("Order saved successfully!");
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order");
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
              <SortableBanner key={banner.id} banner={banner} onDelete={handleDeleteClick} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button onClick={saveOrder} className="px-4 py-2 bg-green-600 text-white rounded">
        حفظ التغييرات
      </button>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">تأكيد الحذف</h3>
            <p className="mb-4">هل أنت متأكد من حذف هذا البانر؟</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
