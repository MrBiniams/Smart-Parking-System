"use client"

import { useState } from "react"
import { useUserStore } from "@/store/userStore"
import { useRouter } from "next/navigation"

export function ProfileDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useUserStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    setIsOpen(false);
  }

  const toggleDrawer = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Profile Button */}
      <button
        onClick={toggleDrawer}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm">
              {user?.firstName?.[0] || user?.email?.[0] || "?"}
            </span>
          )}
        </div>
        <span className="hidden md:inline text-sm font-medium text-white">
          {user?.firstName || user?.email?.split("@")[0] || "Profile"}
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white/10 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-lg">
                  {user?.firstName?.[0] || user?.email?.[0] || "?"}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Profile"}
              </h2>
              <p className="text-sm text-white/70">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-white">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">Name</label>
                <p className="text-lg text-white">{`${user?.firstName || ""} ${user?.lastName || ""}`}</p>
              </div>
              <div>
                <label className="text-sm text-white/70">Email</label>
                <p className="text-lg text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-white/70">Phone</label>
                <p className="text-lg text-white">{user?.phoneNumber || "Not set"}</p>
              </div>
            </div>
          </section>

          {/* Settings Section */}
          <section>
            <h3 className="text-lg font-medium mb-4 text-white">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Email Notifications</label>
                  <p className="text-sm text-white/70">Receive updates about your bookings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">SMS Notifications</label>
                  <p className="text-sm text-white/70">Get text messages for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Dark Mode</label>
                  <p className="text-sm text-white/70">Switch between light and dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Logout Section */}
          <section>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors"
            >
              Logout
            </button>
          </section>
        </div>
      </div>
    </>
  )
} 