"use client"

import { useState } from "react"
import StudentManagement from "./components/StudentManagement"
import BookManagement from "./components/BookManagement"
import IssueReturn from "./components/IssueReturn"
import FineCalculation from "./components/FineCalculation"
import { Toaster } from "react-hot-toast"

export default function Home() {
  const [activeTab, setActiveTab] = useState("students")

  const tabs = [
    { id: "students", label: "Students", icon: "👥", color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { id: "books", label: "Books", icon: "📚", color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
    { id: "issue-return", label: "Issue/Return", icon: "🔄", color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { id: "fines", label: "Fines", icon: "💰", color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50 dark:bg-amber-900/20" }
  ]

  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-all duration-500">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <span className="text-3xl">📖</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 leading-tight">
            Library Management System
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Streamline your library operations with our comprehensive management solution
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            {tabs.map((tab) => (
              <div key={tab.id} className={`${tab.bgColor} rounded-xl p-4 border border-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer`} onClick={() => setActiveTab(tab.id)}>
                <div className="text-2xl mb-2">{tab.icon}</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{tab.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl shadow-blue-500/25`
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-sm border border-white/20"
              } flex items-center gap-3 min-w-[140px] justify-center`}
            >
              <span className={`text-2xl ${activeTab === tab.id ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform duration-300`}>
                {tab.icon}
              </span>
              <span className="hidden sm:inline font-bold">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`${currentTab?.bgColor} rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden transition-all duration-500 transform`}>
          <div className="p-8">
            {activeTab === "students" && <StudentManagement />}
            {activeTab === "books" && <BookManagement />}
            {activeTab === "issue-return" && <IssueReturn />}
            {activeTab === "fines" && <FineCalculation />}
          </div>
        </div>
      </div>
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1f2937',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  )
}
