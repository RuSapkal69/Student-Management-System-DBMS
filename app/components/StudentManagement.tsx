"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

interface Student {
  id?: number
  name: string
  email: string
  phone_number: string
  gender: string
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    gender: "Male"
  })
  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    if (editId) {
      const { error } = await supabase
        .from("Students")
        .update(form)
        .eq("id", editId)

      if (error) {
        toast.error(`Failed to update student: ${error.message}`)
      } else {
        toast.success("✅ Student updated successfully!")
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from("Students")
        .insert([form])

      if (error) {
        toast.error(`Failed to add student: ${error.message}`)
      } else {
        toast.success("🎉 Student added successfully!")
        resetForm()
      }
    }
    setLoading(false)
    fetchStudents()
  }

  function resetForm() {
    setEditId(null)
    setForm({
      name: "",
      email: "",
      phone_number: "",
      gender: "Male"
    })
  }

  async function fetchStudents() {
    const { data, error } = await supabase
      .from("Students")
      .select("*")
      .order('name')

    if (error) {
      toast.error(`Failed to fetch students: ${error.message}`)
    } else {
      setStudents(data || [])
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  function handleStudentEdit(student: Student) {
    setForm({
      name: student.name,
      email: student.email,
      phone_number: student.phone_number,
      gender: student.gender
    })
    if (student.id) {
      setEditId(student.id)
    }
  }

  async function handleStudentDelete(student: Student) {
    const result = await Swal.fire({
      title: 'Delete Student?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
    })

    if (result.isConfirmed && student.id) {
      const { error } = await supabase
        .from("Students")
        .delete()
        .eq("id", student.id)

      if (error) {
        toast.error(`Failed to delete student: ${error.message}`)
      } else {
        toast.success("🗑️ Student deleted successfully")
        fetchStudents()
      }
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            👥 Student Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage student records and information</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl shadow-lg">
          <div className="text-2xl font-bold">{students.length}</div>
          <div className="text-sm opacity-90">Total Students</div>
        </div>
      </div>

      {/* Student Form */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          {editId ? "✏️ Edit Student" : "➕ Add New Student"}
        </h3>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="flex text-sm font-semibold text-slate-700 dark:text-slate-300 items-center gap-2">
                👤 Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="Enter student name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📧 Email Address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="student@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📱 Phone Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                ⚧️ Gender *
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-800 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  {editId ? "✏️ Update Student" : "➕ Add Student"}
                </>
              )}
            </button>
            
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Section */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-2xl">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400 backdrop-blur-sm"
          />
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl shadow-lg">
          <div className="text-lg font-bold">{filteredStudents.length}</div>
          <div className="text-sm opacity-90">Found</div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-700 dark:to-slate-600">
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Student</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Contact</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Gender</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className={`hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/50 dark:bg-slate-800/30' : 'bg-slate-50/50 dark:bg-slate-700/30'}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{student.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          📧 {student.email}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          📱 {student.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                        student.gender === 'Male' 
                          ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200' 
                          : student.gender === 'Female'
                          ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 dark:from-pink-900 dark:to-pink-800 dark:text-pink-200'
                          : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200'
                      } shadow-lg`}>
                        {student.gender === 'Male' ? '👨' : student.gender === 'Female' ? '👩' : '⚧️'} {student.gender}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleStudentEdit(student)}
                          className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center gap-2"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleStudentDelete(student)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center gap-2"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <div className="text-slate-500 dark:text-slate-400 space-y-4">
                      <div className="text-6xl">👥</div>
                      <div className="text-2xl font-bold">No students found</div>
                      <div className="text-lg">Add your first student to get started</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

