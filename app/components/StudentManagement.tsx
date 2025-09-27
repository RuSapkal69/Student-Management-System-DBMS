"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

interface Student {
  id?: string
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
  const [editId, setEditId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    
    if (editId) {
      const { error } = await supabase
        .from("Students")
        .update(form)
        .eq("id", editId)

      if (error) {
        toast.error(`Failed to update student: ${error.message}`)
      } else {
        toast.success("Student updated successfully")
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from("Students")
        .insert([form])

      if (error) {
        toast.error(`Failed to add student: ${error.message}`)
      } else {
        toast.success("Student added successfully")
        resetForm()
      }
    }
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
    setForm(student)
    if (student.id) {
      setEditId(student.id)
    }
  }

  async function handleStudentDelete(student: Student) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed && student.id) {
      const { error } = await supabase
        .from("Students")
        .delete()
        .eq("id", student.id)

      if (error) {
        toast.error(`Failed to delete student: ${error.message}`)
      } else {
        toast.success("Student deleted successfully")
        fetchStudents()
      }
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        👥 Student Management
      </h2>

      {/* Student Form */}
      <form onSubmit={handleFormSubmit} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {editId ? "Update" : "Add"} Student
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Phone</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Gender</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{student.name}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{student.email}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{student.phone_number}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{student.gender}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStudentEdit(student)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleStudentDelete(student)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
