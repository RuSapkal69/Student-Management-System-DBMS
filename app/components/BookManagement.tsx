"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

// Update the interface and all ID-related types
interface Book {
  id?: number  // Changed from string to number
  title: string
  author: string
  isbn: string
  category: string
  total_copies: number
  available_copies: number
  publication_year: number
}


export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([])
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    total_copies: 1,
    available_copies: 1,
    publication_year: new Date().getFullYear()
  })
  // Update editId state
  const [editId, setEditId] = useState<number | null>(null)  // Changed from string 
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    
    if (editId) {
      const { error } = await supabase
        .from("Books")
        .update(form)
        .eq("id", editId)

      if (error) {
        toast.error(`Failed to update book: ${error.message}`)
      } else {
        toast.success("📚 Book updated successfully")
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from("Books")
        .insert([form])

      if (error) {
        toast.error(`Failed to add book: ${error.message}`)
      } else {
        toast.success("📚 Book added successfully")
        resetForm()
      }
    }
    fetchBooks()
  }

  function resetForm() {
    setEditId(null)
    setForm({
      title: "",
      author: "",
      isbn: "",
      category: "",
      total_copies: 1,
      available_copies: 1,
      publication_year: new Date().getFullYear()
    })
  }

  async function fetchBooks() {
    const { data, error } = await supabase
      .from("Books")
      .select("*")
      .order('title')

    if (error) {
      toast.error(`Failed to fetch books: ${error.message}`)
    } else {
      setBooks(data || [])
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  function handleBookEdit(book: Book) {
    setForm(book)
    if (book.id) {
      setEditId(book.id)
    }
  }

  async function handleBookDelete(book: Book) {
    const result = await Swal.fire({
      title: 'Delete Book?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      background: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
    })

    if (result.isConfirmed && book.id) {
      const { error } = await supabase
        .from("Books")
        .delete()
        .eq("id", book.id)

      if (error) {
        toast.error(`Failed to delete book: ${error.message}`)
      } else {
        toast.success("📚 Book deleted successfully")
        fetchBooks()
      }
    }
  }

  const categories = [...new Set(books.map(book => book.category))]
  
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm)
    const matchesCategory = !filterCategory || book.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          📚 Book Management
        </h2>
        <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Total Books: {books.length}
          </span>
        </div>
      </div>

      {/* Book Form */}
      <form onSubmit={handleFormSubmit} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              📖 Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200"
              placeholder="Enter book title"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ✍️ Author *
            </label>
            <input
              type="text"
              required
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200"
              placeholder="Enter author name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              🔢 ISBN *
            </label>
            <input
              type="text"
              required
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200"
              placeholder="Enter ISBN"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              📂 Category *
            </label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200"
              placeholder="e.g., Fiction, Science, History"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              📦 Total Copies *
            </label>
            <input
              type="number"
              min="1"
              required
              value={form.total_copies}
              onChange={(e) => {
                const total = parseInt(e.target.value)
                setForm({ 
                  ...form, 
                  total_copies: total,
                  available_copies: editId ? form.available_copies : total
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ✅ Available Copies *
            </label>
            <input
              type="number"
              min="0"
              max={form.total_copies}
              required
              value={form.available_copies}
              onChange={(e) => setForm({ ...form, available_copies: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            {editId ? "✏️ Update Book" : "➕ Add Book"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ❌ Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="🔍 Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all duration-200"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Book Info</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book, index) => (
                  <tr key={book.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{book.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Published: {book.publication_year}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {book.isbn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          book.available_copies > 0 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {book.available_copies}/{book.total_copies}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBookEdit(book)}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleBookDelete(book)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📚</div>
                      <div className="text-lg font-medium">No books found</div>
                      <div className="text-sm">Add your first book to get started</div>
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

