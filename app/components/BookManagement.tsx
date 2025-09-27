"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import Swal from "sweetalert2"

interface Book {
  id?: string
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
  const [editId, setEditId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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
        toast.success("Book updated successfully")
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from("Books")
        .insert([form])

      if (error) {
        toast.error(`Failed to add book: ${error.message}`)
      } else {
        toast.success("Book added successfully")
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
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed && book.id) {
      const { error } = await supabase
        .from("Books")
        .delete()
        .eq("id", book.id)

      if (error) {
        toast.error(`Failed to delete book: ${error.message}`)
      } else {
        toast.success("Book deleted successfully")
        fetchBooks()
      }
    }
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        📚 Book Management
      </h2>

      {/* Book Form */}
      <form onSubmit={handleFormSubmit} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              required
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ISBN
            </label>
            <input
              type="text"
              required
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Copies
            </label>
            <input
              type="number"
              min="1"
              required
              value={form.total_copies}
              onChange={(e) => setForm({ ...form, total_copies: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Copies
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.available_copies}
              onChange={(e) => setForm({ ...form, available_copies: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {editId ? "Update" : "Add"} Book
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
          placeholder="Search books by title, author, or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Books Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Author</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">ISBN</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Category</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Available</th>
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{book.title}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{book.author}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{book.isbn}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{book.category}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    book.available_copies > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available_copies}/{book.total_copies}
                  </span>
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookEdit(book)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleBookDelete(book)}
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
