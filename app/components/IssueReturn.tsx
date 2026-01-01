"use client"

import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface Student {
  id: number
  name: string
  email: string
}

interface Book {
  id: number
  title: string
  author: string
  available_copies: number
}

interface Transaction {
  id?: number
  student_id: number
  book_id: number
  issue_date: string
  return_date?: string
  due_date: string
  status: 'issued' | 'returned'
  fine_amount?: number
  Students?: { name: string }  // Capital S to match your table
  Books?: { title: string; author: string }  // Capital B to match your table
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
  const [loading, setLoading] = useState(false)

  async function fetchStudents() {
    const { data, error } = await supabase
      .from("Students")  // Use exact table name
      .select("id, name, email")
      .order('name')

    if (error) {
      console.error('Students fetch error:', error)
      toast.error(`Failed to fetch students: ${error.message}`)
    } else {
      setStudents(data || [])
    }
  }

  async function fetchBooks() {
    const { data, error } = await supabase
      .from("Books")  // Use exact table name
      .select("id, title, author, available_copies")
      .gt('available_copies', 0)
      .order('title')

    if (error) {
      console.error('Books fetch error:', error)
      toast.error(`Failed to fetch books: ${error.message}`)
    } else {
      setBooks(data || [])
    }
  }

  async function fetchTransactions() {
    try {
      // First, try to fetch with join
      const { data, error } = await supabase
        .from("Transactions")
        .select(`
          *,
          Students(name),
          Books(title, author)
        `)
        .order('issue_date', { ascending: false })

      if (error) {
        console.error('Transactions join fetch error:', error)
        // If join fails, fetch transactions separately and then get related data
        await fetchTransactionsWithSeparateQueries()
      } else {
        setTransactions(data || [])
      }
    } catch (err) {
      console.error('Fetch transactions error:', err)
      await fetchTransactionsWithSeparateQueries()
    }
  }

  async function fetchTransactionsWithSeparateQueries() {
    try {
      // Fetch transactions without joins
      const { data: transactionsData, error: transError } = await supabase
        .from("Transactions")
        .select("*")
        .order('issue_date', { ascending: false })

      if (transError) {
        toast.error(`Failed to fetch transactions: ${transError.message}`)
        return
      }

      // Fetch all students and books
      const { data: studentsData } = await supabase
        .from("Students")
        .select("id, name")

      const { data: booksData } = await supabase
        .from("Books")
        .select("id, title, author")

      // Create lookup maps
      const studentMap = new Map(studentsData?.map(s => [s.id, s]) || [])
      const bookMap = new Map(booksData?.map(b => [b.id, b]) || [])

      // Combine data
      const combinedTransactions = transactionsData?.map(transaction => ({
        ...transaction,
        Students: studentMap.get(transaction.student_id) || { name: 'Unknown Student' },
        Books: bookMap.get(transaction.book_id) || { title: 'Unknown Book', author: 'Unknown Author' }
      })) || []

      setTransactions(combinedTransactions)
    } catch (err) {
      console.error('Separate queries error:', err)
      toast.error('Failed to fetch transaction data')
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchBooks()
    fetchTransactions()
  }, [])

  async function handleIssueBook(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const issueDate = new Date().toISOString().split('T')[0]
      
      const { error } = await supabase
        .from("Transactions")
        .insert([{
          student_id: parseInt(form.student_id),
          book_id: parseInt(form.book_id),
          issue_date: issueDate,
          due_date: form.due_date,
          status: 'issued'
        }])

      if (error) {
        toast.error(`Failed to issue book: ${error.message}`)
      } else {
        // Update available copies
        const book = books.find(b => b.id === parseInt(form.book_id))
        if (book) {
          await supabase
            .from("Books")
            .update({ available_copies: book.available_copies - 1 })
            .eq("id", form.book_id)
        }

        toast.success("📚 Book issued successfully!")
        setForm({ student_id: "", book_id: "", due_date: "" })
        fetchBooks()
        fetchTransactions()
      }
    } catch (err) {
      console.error('Issue book error:', err)
      toast.error('Failed to issue book')
    }
    setLoading(false)
  }

  async function handleReturnBook(transactionId: number, bookId: number) {
    try {
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

        toast.success("✅ Book returned successfully!")
        fetchBooks()
        fetchTransactions()
      }
    } catch (err) {
      console.error('Return book error:', err)
      toast.error('Failed to return book')
    }
  }

  const issuedTransactions = transactions.filter(t => t.status === 'issued')
  const returnedTransactions = transactions.filter(t => t.status === 'returned')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            🔄 Issue/Return Books
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage book lending and returns</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center">
            <div className="text-2xl font-bold">{issuedTransactions.length}</div>
            <div className="text-sm opacity-90">Issued Books</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center">
            <div className="text-2xl font-bold">{returnedTransactions.length}</div>
            <div className="text-sm opacity-90">Returned Books</div>
          </div>
        </div>
      </div>

      {/* Issue Book Form */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          📖 Issue New Book
        </h3>
        
        <form onSubmit={handleIssueBook} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                👤 Select Student *
              </label>
              <select
                required
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-slate-800 dark:text-white"
              >
                <option value="">Choose a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📚 Select Book *
              </label>
              <select
                required
                value={form.book_id}
                onChange={(e) => setForm({ ...form, book_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-slate-800 dark:text-white"
              >
                <option value="">Choose a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author} (Available: {book.available_copies})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                📅 Due Date *
              </label>
              <input
                type="date"
                required
                value={form.due_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  📖 Issue Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Current Issues Table */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <div className="px-8 py-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            📋 Currently Issued Books ({issuedTransactions.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-orange-100 dark:from-slate-700 dark:to-slate-600">
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Student</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Book</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Issue Date</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Due Date</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Status</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {issuedTransactions.length > 0 ? (
                issuedTransactions.map((transaction, index) => {
                  const isOverdue = new Date(transaction.due_date) < new Date()
                  const studentName = transaction.Students?.name || 'Unknown Student'
                  const bookTitle = transaction.Books?.title || 'Unknown Book'
                  const bookAuthor = transaction.Books?.author || 'Unknown Author'
                  
                  return (
                    <tr key={transaction.id} className={`hover:bg-orange-50 dark:hover:bg-slate-700/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/50 dark:bg-slate-800/30' : 'bg-slate-50/50 dark:bg-slate-700/30'}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              {studentName}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              ID: {transaction.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {bookTitle}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          by {bookAuthor}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-300">
                        📅 {new Date(transaction.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          isOverdue 
                            ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200' 
                            : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-200'
                        } shadow-sm`}>
                          ⏰ {new Date(transaction.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          isOverdue
                            ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                            : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200'
                        }`}>
                          {isOverdue ? '⚠️ Overdue' : '📖 Issued'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleReturnBook(transaction.id!, transaction.book_id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center gap-2"
                        >
                          ✅ Return Book
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="text-slate-500 dark:text-slate-400 space-y-4">
                      <div className="text-6xl">📚</div>
                      <div className="text-2xl font-bold">No books currently issued</div>
                      <div className="text-lg">Issue your first book to get started</div>
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
