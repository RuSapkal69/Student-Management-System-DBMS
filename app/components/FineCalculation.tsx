"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface Transaction {
  id: number
  student_id: number
  book_id: number
  issue_date: string
  due_date: string
  return_date?: string
  status: string
  fine_amount?: number
  students: { name: string; email: string }
  books: { title: string; author: string }
}

export default function FineCalculation() {
  const [overdueTransactions, setOverdueTransactions] = useState<Transaction[]>([])
  const [fineRate] = useState(2) // ₹2 per day

  async function fetchOverdueTransactions() {
    const { data, error } = await supabase
      .from("Transactions")
      .select(`
        *,
        students(name, email),
        books(title, author)
      `)
      .eq('status', 'issued')
      .lt('due_date', new Date().toISOString().split('T')[0])

    if (error) {
      toast.error(`Failed to fetch overdue transactions: ${error.message}`)
    } else {
      setOverdueTransactions(data || [])
    }
  }

  useEffect(() => {
    fetchOverdueTransactions()
  }, [])

  function calculateFine(dueDate: string): number {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays * fineRate)
  }

  async function applyFine(transactionId: number, fineAmount: number) {
    const { error } = await supabase
      .from("Transactions")
      .update({ fine_amount: fineAmount })
      .eq("id", transactionId)

    if (error) {
      toast.error(`Failed to apply fine: ${error.message}`)
    } else {
      toast.success("💰 Fine applied successfully!")
      fetchOverdueTransactions()
    }
  }

  const totalFines = overdueTransactions.reduce((sum, transaction) => {
    return sum + calculateFine(transaction.due_date)
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
            💰 Fine Calculation
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Manage overdue books and calculate fines</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-lg text-center">
          <div className="text-2xl font-bold">₹{fineRate}</div>
          <div className="text-sm opacity-90">Per Day</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-8 rounded-3xl border border-red-200 dark:border-red-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-800 dark:text-red-300 font-bold text-lg">Overdue Books</h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {overdueTransactions.length}
              </p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-8 rounded-3xl border border-amber-200 dark:border-amber-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-amber-800 dark:text-amber-300 font-bold text-lg">Fine Rate</h3>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                ₹{fineRate}/day
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-8 rounded-3xl border border-green-200 dark:border-green-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-green-800 dark:text-green-300 font-bold text-lg">Total Fines</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                ₹{totalFines}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Overdue Books Table */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <div className="px-8 py-6 bg-gradient-to-r from-red-100 to-amber-100 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            📋 Overdue Books & Fine Details
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-red-100 dark:from-slate-700 dark:to-slate-600">
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Student Details</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Book Information</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Due Date</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Days Overdue</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Fine Amount</th>
                <th className="px-8 py-6 text-left text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {overdueTransactions.length > 0 ? (
                overdueTransactions.map((transaction, index) => {
                  const daysOverdue = Math.ceil(
                    (new Date().getTime() - new Date(transaction.due_date).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )
                  const fineAmount = calculateFine(transaction.due_date)
                  
                  return (
                    <tr key={transaction.id} className={`hover:bg-red-50 dark:hover:bg-slate-700/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/50 dark:bg-slate-800/30' : 'bg-slate-50/50 dark:bg-slate-700/30'}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {transaction.students.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {transaction.students.name}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              📧 {transaction.students.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            📚 {transaction.books.title}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            by {transaction.books.author}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200 shadow-lg">
                          ⏰ {new Date(transaction.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                          ⚠️ {daysOverdue} days
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                          💰 ₹{fineAmount}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {!transaction.fine_amount ? (
                          <button
                            onClick={() => applyFine(transaction.id, fineAmount)}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center gap-2"
                          >
                            💰 Apply Fine
                          </button>
                        ) : (
                          <span className="inline-flex px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 dark:from-green-900 dark:to-emerald-800 dark:text-green-200 shadow-lg">
                            ✅ Fine Applied
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="text-slate-500 dark:text-slate-400 space-y-4">
                      <div className="text-6xl">🎉</div>
                      <div className="text-2xl font-bold">No overdue books!</div>
                      <div className="text-lg">All books have been returned on time</div>
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
