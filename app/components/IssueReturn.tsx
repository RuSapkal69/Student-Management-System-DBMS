"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface Student {
  id: string
  name: string
  email: string
}

interface Book {
  id: string
  title: string
  author: string
  available_copies: number
}

interface Transaction {
  id?: string
  student_id: string
  book_id: string
  issue_date: string
  return_date?: string
  due_date: string
  status: 'issued' | 'returned'
  fine_amount?: number
  students: { name: string }
  books: { title: string; author: string }
}

export default function IssueReturn() {
  const [students, setStudents] = useState<Student[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [form, setForm] = useState({
    student_id: "",
    book_id: "",
    due_date: ""
  })

  async function fetchStudents() {
    const { data, error } = await supabase
      .from("Students")
      .select("id, name, email")
      .order('name')

    if (error) {
      toast.error(`Failed to fetch students: ${error.message}`)
    } else {
      setStudents(data || [])
    }
  }

  async function fetchBooks() {
    const { data, error } = await supabase
      .from("Books")
      .select("id, title, author, available_copies")
      .gt('available_copies', 0)
      .order('title')

    if (error) {
      toast.error(`Failed to fetch books: ${error.message}`)
    } else {
      setBooks(data || [])
    }
  }

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from("Transactions")
      .select(`
        *,
        students(name),
        books(title, author)
      `)
      .order('issue_date', { ascending: false })

    if (error) {
      toast.error(`Failed to fetch transactions: ${error.message}`)
    } else {
      setTransactions(data || [])
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchBooks()
    fetchTransactions()
  }, [])

  async function handleIssueBook(e: FormEvent) {
    e.preventDefault()

    const issueDate = new Date().toISOString().split('T')[0]
    
    const { error } = await supabase
      .from("Transactions")
      .insert([{
        student_id: form.student_id,
        book_id: form.book_id,
        issue_date: issueDate,
        due_date: form.due_date,
        status: 'issued'
      }])

    if (error) {
      toast.error(`Failed to issue book: ${error.message}`)
    } else {
      // Update available copies
      const book = books.find(b => b.id === form.book_id)
      if (book) {
        await supabase
          .from("Books")
          .update({ available_copies: book.available_copies - 1 })
          .eq("id", form.book_id)
      }

      toast.success("Book issued successfully")
      setForm({ student_id: "", book_id: "", due_date: "" })
      fetchBooks()
      fetchTransactions()
    }
  }

  async function handleReturnBook(transactionId: string, bookId: string) {
    const returnDate = new Date().toISOString().split('T')[0]
    
    const { error } = await supabase
      .from("Transactions")
      .update({
        return_date: returnDate,
        status: 'returned'
      })
      .eq("id", transactionId)

    if (error) {
      toast.error(`Failed to return book: ${error.message}`)
    } else {
      // Update available copies
      const { data: bookData } = await supabase
        .from("Books")
        .select("available_copies")
        .eq("id", bookId)
        .single()

      if (bookData) {
        await supabase
          .from("Books")
          .update({ available_copies: bookData.available_copies + 1 })
          .eq("id", bookId)
      }

      toast.success("Book returned successfully")
      fetchBooks()
      fetchTransactions()
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        🔄 Issue/Return Books
      </h2>

      {/* Issue Book Form */}
      <form onSubmit={handleIssueBook} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Issue Book</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Student
            </label>
            <select
              required
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Book
            </label>
            <select
              required
              value={form.book_id}
              onChange={(e) => setForm({ ...form, book_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author} (Available: {book.available_copies})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              required
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Issue Book
          </button>
        </div>
      </form>

      {/* Issued Books Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Issues</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Student</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Book</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Issue Date</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Due Date</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(t => t.status === 'issued').map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    {transaction.students.name}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    {transaction.books.title}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    {new Date(transaction.issue_date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      new Date(transaction.due_date) < new Date() 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {new Date(transaction.due_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                      Issued
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    <button
                      onClick={() => handleReturnBook(transaction.id!, transaction.book_id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
