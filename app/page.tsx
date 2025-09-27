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
    { id: "students", label: "Students", icon: "👥" },
    { id: "books", label: "Books", icon: "📚" },
    { id: "issue-return", label: "Issue/Return", icon: "🔄" },
    { id: "fines", label: "Fines", icon: "💰" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📖 Library Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage books, students, and library operations efficiently
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          {activeTab === "students" && <StudentManagement />}
          {activeTab === "books" && <BookManagement />}
          {activeTab === "issue-return" && <IssueReturn />}
          {activeTab === "fines" && <FineCalculation />}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
