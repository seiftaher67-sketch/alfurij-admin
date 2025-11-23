import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaLock, FaSignOutAlt, FaUser, FaUserPlus } from 'react-icons/fa';

const THEME = {
  pageBg: "#FAF7F2",
  boxBg: "#FFFFFF",
  border: "#E8DFD8",
  primary: "#E0AA3E",
  heading: "#2D2A26",
  headerBg: "#F3ECE4",
};

export default function TopNavbar({ onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employee, setEmployee] = useState(null);
  const dropdownRef = useRef(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [employeeData, setEmployeeData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [employeeError, setEmployeeError] = useState(null);
  const [employeeSuccess, setEmployeeSuccess] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  useEffect(() => {
    // Get employee data from localStorage
    const storedEmployee = localStorage.getItem('admin_user');
    if (storedEmployee) {
      try {
        setEmployee(JSON.parse(storedEmployee));
      } catch (e) {
        console.error('Failed to parse employee data:', e);
      }
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = () => {
    if (employee?.email) {
      return employee.email.charAt(0).toUpperCase();
    }
    if (employee?.name) {
      return employee.name.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const getEmployeeName = () => {
    return employee?.name || employee?.email || 'الموظف';
  };

  const getEmployeeEmail = () => {
    return employee?.email || 'بريد إلكتروني غير متوفر';
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('الرجاء إدخال كلمة المرور الحالية');
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError('الرجاء إدخال كلمة المرور الجديدة');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('كلمات المرور الجديدة غير متطابقة');
      return;
    }

    setLoadingPassword(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          password_confirmation: passwordData.confirmPassword,
        }),
      });

      if (!response.ok) {
        try {
          const text = await response.text();
          const data = text ? JSON.parse(text) : {};
          setPasswordError(data.message || 'فشل تغيير كلمة المرور');
        } catch (e) {
          setPasswordError('فشل تغيير كلمة المرور');
        }
        return;
      }

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleEmployeeCreation = async (e) => {
    e.preventDefault();
    setEmployeeError(null);
    setEmployeeSuccess(false);

    // Validation
    if (!employeeData.name) {
      setEmployeeError('الرجاء إدخال اسم الموظف');
      return;
    }
    if (!employeeData.phone) {
      setEmployeeError('الرجاء إدخال رقم الهاتف');
      return;
    }
    if (!employeeData.email) {
      setEmployeeError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    if (!employeeData.password) {
      setEmployeeError('الرجاء إدخال كلمة المرور');
      return;
    }
    if (employeeData.password.length < 8) {
      setEmployeeError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoadingEmployee(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        let errorMessage = 'فشل إنشاء الموظف';
        try {
          const text = await response.text();
          const data = text ? JSON.parse(text) : {};
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default error message
        }
        setEmployeeError(errorMessage);
        return;
      }

      setEmployeeSuccess(true);
      setEmployeeData({
        name: '',
        phone: '',
        email: '',
        password: '',
      });

      setTimeout(() => {
        setShowEmployeeModal(false);
        setEmployeeSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating employee:', error);
      setEmployeeError('حدث خطأ أثناء إنشاء الموظف');
    } finally {
      setLoadingEmployee(false);
    }
  };

  return (
    <>
      <nav 
        style={{ background: THEME.headerBg, borderBottom: `1px solid ${THEME.border}` }}
        className="h-16 flex items-center justify-between px-2 shadow-sm"
        dir="rtl"
      >
        {/* Left: Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: THEME.primary }}>
            ف
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: THEME.heading }}>لوحة التحكم</h1>
            <p className="text-xs text-slate-500">شركة الفريج</p>
          </div>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white"
            style={{ background: isDropdownOpen ? THEME.boxBg : 'transparent' }}
          >
            {/* Profile Avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: THEME.heading }}>
                  {getEmployeeName()}
                </p>
                <p className="text-xs text-slate-500">{getEmployeeEmail()}</p>
              </div>
              
              {/* Avatar Circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${THEME.primary} 0%, #d19b00 100%)`,
                  transform: isDropdownOpen ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {getInitial()}
              </div>

              {/* Chevron Icon */}
              <FaChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                style={{ color: THEME.primary }}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-white shadow-2xl border overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200"
              style={{ borderColor: THEME.border }}
            >
              {/* Header Section */}
              <div
                className="px-4 py-3 border-b"
                style={{ background: THEME.headerBg, borderColor: THEME.border }}
              >
                <p className="text-sm font-semibold" style={{ color: THEME.heading }}>
                  {getEmployeeName()}
                </p>
                <p className="text-xs text-slate-500 mt-1">{getEmployeeEmail()}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* Profile Option */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                >
                  <FaUser className="w-4 h-4" style={{ color: THEME.primary }} />
                  <span>ملفي الشخصي</span>
                </button>

                {/* Change Password Option */}
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                >
                  <FaLock className="w-4 h-4" style={{ color: THEME.primary }} />
                  <span>تغيير كلمة المرور</span>
                </button>

                {/* Add Employee Option - Only for SuperAdmin */}
                {employee?.role === 'SuperAdmin' && (
                  <button
                    onClick={() => {
                      setShowEmployeeModal(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                  >
                    <FaUserPlus className="w-4 h-4" style={{ color: THEME.primary }} />
                    <span>إضافة موظف</span>
                  </button>
                )}

                {/* Divider */}
                <div className="my-2" style={{ borderTop: `1px solid ${THEME.border}` }}></div>

                {/* Logout Option */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div
              className="px-6 py-4 border-b"
              style={{ background: THEME.headerBg, borderColor: THEME.border }}
            >
              <h2 className="text-lg font-bold" style={{ color: THEME.heading }}>
                تغيير كلمة المرور
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                أدخل كلمة المرور الحالية والجديدة
              </p>
            </div>

            {/* Modal Content */}
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {/* Error Alert */}
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{passwordError}</span>
                  </p>
                </div>
              )}

              {/* Success Alert */}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-start gap-2">
                    <span>✓</span>
                    <span>تم تغيير كلمة المرور بنجاح</span>
                  </p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ borderColor: THEME.border, focusRing: THEME.primary }}
                  placeholder="••••••••"
                  disabled={loadingPassword}
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ borderColor: THEME.border }}
                  placeholder="••••••••"
                  disabled={loadingPassword}
                />
                <p className="text-xs text-slate-500 mt-1">8 أحرف على الأقل</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ borderColor: THEME.border }}
                  placeholder="••••••••"
                  disabled={loadingPassword}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  disabled={loadingPassword}
                  className="flex-1 px-4 py-2 border rounded-lg font-semibold transition-colors hover:bg-gray-50"
                  style={{ borderColor: THEME.border, color: THEME.heading }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:brightness-95 disabled:opacity-50"
                  style={{ background: THEME.primary }}
                >
                  {loadingPassword ? 'جاري...' : 'تحديث كلمة المرور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Creation Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div
              className="px-6 py-4 border-b"
              style={{ background: THEME.headerBg, borderColor: THEME.border }}
            >
              <h2 className="text-lg font-bold" style={{ color: THEME.heading }}>
                إضافة موظف جديد
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                أدخل بيانات الموظف الجديد
              </p>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleEmployeeCreation} className="p-6 space-y-4">
              {/* Error Alert */}
              {employeeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{employeeError}</span>
                  </p>
                </div>
              )}

              {/* Success Alert */}
              {employeeSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-start gap-2">
                    <span>✓</span>
                    <span>تم إنشاء الموظف بنجاح</span>
                  </p>
                </div>
              )}

              {/* Employee Name */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>
                  اسم الموظف
                </label>
                <input
                  type="text"
                  value={employeeData.name}
                  onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ borderColor: THEME.border }}
                  placeholder="اسم الموظف"
                  disabled={loadingEmployee}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={employeeData.phone}
                  onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ borderColor: THEME.border }}
                  placeholder="رقم الهاتف"
                  disabled={loadingEmployee}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={employeeData.email}
                  onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ borderColor: THEME.border }}
                  placeholder="Employee_Name@employee.alfreej.com"
                  disabled={loadingEmployee}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.heading }}>
                  كلمة المرور الأولية
                </label>
                <input
                  type="password"
                  value={employeeData.password}
                  onChange={(e) => setEmployeeData({ ...employeeData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 transition-all"
                  style={{ borderColor: THEME.border }}
                  placeholder="••••••••"
                  disabled={loadingEmployee}
                />
                <p className="text-xs text-slate-500 mt-1">8 أحرف على الأقل - يمكن للموظف تغييرها لاحقاً</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeModal(false);
                    setEmployeeError(null);
                    setEmployeeSuccess(false);
                    setEmployeeData({
                      name: '',
                      phone: '',
                      email: '',
                      password: '',
                    });
                  }}
                  disabled={loadingEmployee}
                  className="flex-1 px-4 py-2 border rounded-lg font-semibold transition-colors hover:bg-gray-50"
                  style={{ borderColor: THEME.border, color: THEME.heading }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loadingEmployee}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:brightness-95 disabled:opacity-50"
                  style={{ background: THEME.primary }}
                >
                  {loadingEmployee ? 'جاري...' : 'حفظ بيانات الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
