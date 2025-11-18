import React, { useState, useEffect } from "react";
import { PhotoIcon, TruckIcon, CogIcon, CheckCircleIcon, ExclamationTriangleIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { modelAPI } from "../services/api";

export default function AddModel() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    truckName: "",
    model: "",
    image: null,
  });

  const [editForm, setEditForm] = useState({
    id: null,
    truckName: "",
    model: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });

  // Fetch models
  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: modelAPI.getModels,
  });

  const addModelMutation = useMutation({
    mutationFn: modelAPI.addModel,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['models']);
      setSuccess(true);
      setErrors({});
      // Reset form
      setForm({
        truckName: "",
        model: "",
        image: null,
      });
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      setSuccess(false);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.message });
      }
    },
  });

  const updateModelMutation = useMutation({
    mutationFn: ({ id, data }) => modelAPI.updateModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['models']);
      setShowEditModal(false);
      setEditForm({ id: null, truckName: "", model: "", image: null });
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.message });
      }
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: modelAPI.deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries(['models']);
      setDeleteConfirm({ show: false, id: null, name: "" });
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({
      ...prev,
      image: file,
    }));
    // Clear error when user selects file
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.truckName.trim()) {
      newErrors.truckName = 'اسم الشاحنة مطلوب';
    }
    if (!form.model.trim()) {
      newErrors.model = 'اسم الموديل مطلوب';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    addModelMutation.mutate(form);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setEditForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const openEditModal = (model) => {
    setEditForm({
      id: model.id,
      truckName: model.truck_name,
      model: model.model_name,
      image: null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!editForm.truckName.trim()) {
      newErrors.truckName = 'اسم الشاحنة مطلوب';
    }
    if (!editForm.model.trim()) {
      newErrors.model = 'اسم الموديل مطلوب';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateModelMutation.mutate({ id: editForm.id, data: editForm });
  };

  const handleDelete = (id, name) => {
    setDeleteConfirm({ show: true, id, name });
  };

  const confirmDelete = () => {
    deleteModelMutation.mutate(deleteConfirm.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <TruckIcon className="w-10 h-10 text-primary-yellow ml-4" />
            إضافة موديل شاحنة
          </h1>
          <p className="text-gray-600 text-lg">
            أضف موديل شاحنة جديد إلى النظام
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 ml-3" />
            <p className="text-green-800 font-medium">تم إضافة الموديل بنجاح!</p>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ml-3" />
            <p className="text-red-800 font-medium">{errors.general}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-yellow to-yellow-400 p-6">
            <h2 className="text-2xl font-bold text-black text-center">
              تفاصيل الموديل
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Truck Name */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-lg">
                <TruckIcon className="w-5 h-5 ml-2 text-primary-yellow" />
                اسم الشاحنة
              </label>
              <input
                type="text"
                name="truckName"
                value={form.truckName}
                onChange={handleChange}
                className={`w-full border-2 p-4 rounded-xl focus:ring-2 focus:ring-primary-yellow/50 outline-none transition-all duration-200 ${
                  errors.truckName
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 focus:border-primary-yellow'
                }`}
                placeholder="مثال: فولفو، سكانيا، مان"
              />
              {errors.truckName && (
                <p className="text-red-600 text-sm flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 ml-1" />
                  {errors.truckName}
                </p>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-lg">
                <CogIcon className="w-5 h-5 ml-2 text-primary-yellow" />
                اسم الموديل
              </label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                className={`w-full border-2 p-4 rounded-xl focus:ring-2 focus:ring-primary-yellow/50 outline-none transition-all duration-200 ${
                  errors.model
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 focus:border-primary-yellow'
                }`}
                placeholder="مثال: FH16, R730, TGX"
              />
              {errors.model && (
                <p className="text-red-600 text-sm flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 ml-1" />
                  {errors.model}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-lg">
                <PhotoIcon className="w-5 h-5 ml-2 text-primary-yellow" />
                صورة الموديل
                <span className="text-sm font-normal text-gray-500 mr-2">(اختياري)</span>
              </label>
              <label className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 block ${
                form.image
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-primary-yellow hover:bg-yellow-50'
              }`}>
                <PhotoIcon className={`w-16 h-16 mx-auto mb-4 ${
                  form.image ? 'text-green-500' : 'text-gray-400'
                }`} />
                <p className={`font-medium mb-2 ${
                  form.image ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {form.image ? 'تم اختيار الصورة' : 'اختر صورة للموديل'}
                </p>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-sm text-gray-500">
                  {form.image ? (
                    <span className="text-green-600 font-medium">{form.image.name}</span>
                  ) : (
                    'PNG, JPG, GIF حتى 5MB'
                  )}
                </p>
              </label>
              {errors.image && (
                <p className="text-red-600 text-sm flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 ml-1" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={addModelMutation.isLoading}
                className="w-full bg-gradient-to-r from-primary-yellow to-yellow-500 text-black py-4 px-8 rounded-xl text-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {addModelMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black ml-3"></div>
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-6 h-6 ml-3" />
                    إضافة الموديل
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Models Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            الموديلات الموجودة
          </h2>

          {modelsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
              <p className="text-gray-600 mt-4">جاري تحميل الموديلات...</p>
            </div>
          ) : models?.data?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.data.map((model) => (
                <div key={model.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Model Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    {model.image_path ? (
                      <img
                        src={`http://localhost:8000/storage/${model.image_path}`}
                        alt={`${model.truck_name} ${model.model_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <TruckIcon className="w-16 h-16 text-gray-400" />
                    )}
                  </div>

                  {/* Model Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {model.truck_name}
                    </h3>
                    <p className="text-primary-yellow font-semibold text-lg mb-4">
                      {model.model_name}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditModal(model)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                      >
                        <PencilIcon className="w-4 h-4 ml-2" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(model.id, `${model.truck_name} ${model.model_name}`)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                      >
                        <TrashIcon className="w-4 h-4 ml-2" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد موديلات شاحنات مضافة بعد</p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  تعديل الموديل
                </h2>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {/* Truck Name */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-semibold">
                    <TruckIcon className="w-5 h-5 ml-2 text-blue-500" />
                    اسم الشاحنة
                  </label>
                  <input
                    type="text"
                    name="truckName"
                    value={editForm.truckName}
                    onChange={handleEditChange}
                    className="w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200 border-gray-200 focus:border-blue-500"
                  />
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-semibold">
                    <CogIcon className="w-5 h-5 ml-2 text-blue-500" />
                    اسم الموديل
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={editForm.model}
                    onChange={handleEditChange}
                    className="w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200 border-gray-200 focus:border-blue-500"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-semibold">
                    <PhotoIcon className="w-5 h-5 ml-2 text-blue-500" />
                    صورة الموديل (اختياري)
                  </label>
                  <label className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 block border-gray-300 hover:border-blue-500 hover:bg-blue-50">
                    <PhotoIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium text-gray-700 mb-1">
                      {editForm.image ? 'تم اختيار صورة جديدة' : 'اختر صورة جديدة'}
                    </p>
                    <input
                      type="file"
                      onChange={handleEditFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500">
                      {editForm.image ? (
                        <span className="text-blue-600 font-medium">{editForm.image.name}</span>
                      ) : (
                        'PNG, JPG, GIF حتى 5MB'
                      )}
                    </p>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={updateModelMutation.isLoading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateModelMutation.isLoading ? 'جاري التحديث...' : 'تحديث'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  تأكيد الحذف
                </h2>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-700 text-lg">
                    هل أنت متأكد من حذف الموديل؟
                  </p>
                  <p className="text-gray-600 font-semibold mt-2">
                    {deleteConfirm.name}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    هذا الإجراء لا يمكن التراجع عنه.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, id: null, name: "" })}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteModelMutation.isLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteModelMutation.isLoading ? 'جاري الحذف...' : 'حذف'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>تأكد من إدخال البيانات الصحيحة قبل الإضافة</p>
        </div>
      </div>
    </div>
  );
}
