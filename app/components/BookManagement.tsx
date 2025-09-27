"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

interface Book {
  id?: number
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
  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    if (editId) {
      const { error } = await supabase
        .from("Books")
        .update(form)
        .eq("id", editId)

      if (error) {
        toast.error(`Failed to update book: ${error.message}`)
      } else {
        toast.success("📚 Book updated successfully!")
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from("Books")
        .insert([form])

      if (error) {
        toast.error(`Failed to add book: ${error.message}`)
      } else {
        toast.success("🎉 Book added successfully!")
        resetForm()
      }
    }
    setLoading(false)
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
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.4)',
    })

    if (result.isConfirmed && book.id) {
      const { error } = await supabase
        .from("Books")
        .delete()
        .eq("id", book.id)

      if (error) {
        toast.error(`Failed to delete book: ${error.message}`)
      } else {
        toast.success("🗑️ Book deleted successfully")
        fetchBooks()
      }
    }
  }

  const categories = [...new Set(books.map(book => book.category))]
  const totalBooks = books.reduce((sum, book) => sum + book.total_copies, 0)
  const availableBooks = books.reduce((sum, book) => sum + book.available_copies, 0)
  
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm)
    const matchesCategory = !filterCategory || book.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
            📚 Book Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your library's book collection</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center">
            <div className="text-2xl font-bold">{books.length}</div>
            <div className="text-sm opacity-90">Unique Books</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center">
            <div className="text-2xl font-bold">{totalBooks}</div>
            <div className="text-sm opacity-90">Total Copies</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center">
            <div className="text-2xl font-bold">{availableBooks}</div>
            <div className="text-sm opacity-90">Available</div>
          </div>
        </div>
      </div>

      {/* Book Form */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          {editId ? "✏️ Edit Book" : "➕ Add New Book"}
        </h3>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📖 Book Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="Enter book title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                ✍️ Author Name *
              </label>
              <input
                type="text"
                required
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="Enter author name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                🔢 ISBN Number *
              </label>
              <input
                type="text"
                required
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="Enter ISBN"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📂 Category *
              </label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="e.g., Fiction, Science, History"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
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
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-slate-800 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                ✅ Available Copies *
              </label>
              <input
                type="number"
                min="0"
                max={form.total_copies}
                required
                value={form.available_copies}
                onChange={(e) => setForm({ ...form, available_copies: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  {editId ? "✏️ Update Book" : "➕ Add Book"}
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

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-2xl">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-400 backdrop-blur-sm"
          />
        </div>
        
        <div className="flex gap-4 items-center">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-6 py-4 bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white backdrop-blur-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-2xl shadow-lg text-center">
            <div className="text-lg font-bold">{filteredBooks.length}</div>
            <div className="text-sm opacity-90">Found</div>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-slate-700 dark:to-slate-600">
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Book Information</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Category & ISBN</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Availability</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book, index) => (
                  <tr key={book.id} className={`hover:bg-emerald-50 dark:hover:bg-slate-700/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/50 dark:bg-slate-800/30' : 'bg-slate-50/50 dark:bg-slate-700/30'}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          📚
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{book.title}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">Published: {book.publication_year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-indigo-200 text-purple-800 dark:from-purple-900 dark:to-indigo-800 dark:text-purple-200 shadow-sm">
                          📂 {book.category}
                        </span>
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                          🔢 {book.isbn}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                          book.available_copies > 0 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 dark:from-green-900 dark:to-emerald-800 dark:text-green-200' 
                            : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                        }`}>
                          {book.available_copies > 0 ? '✅' : '❌'} {book.available_copies}/{book.total_copies}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleBookEdit(book)}
                          className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center gap-2"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleBookDelete(book)}
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
                      <div className="text-6xl">📚</div>
                      <div className="text-2xl font-bold">No books found</div>
                      <div className="text-lg">Add your first book to get started</div>
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
