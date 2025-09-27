"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface Transaction {
  id: string
  student_id: string
  book_id: string
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

  async function applyFine(transactionId: string, fineAmount: number) {
    const { error } = await supabase
      .from("Transactions")
      .update({ fine_amount: fineAmount })
      .eq("id", transactionId)

    if (error) {
      toast.error(`Failed to apply fine: ${error.message}`)
    } else {
      toast.success("Fine applied successfully")
      fetchOverdueTransactions()
    }
  }

  const totalFines = overdueTransactions.reduce((sum, transaction) => {
    return sum + calculateFine(transaction.due_date)
  }, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        💰 Fine Calculation
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-red-800 dark:text-red-300 font-semibold">Overdue Books</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueTransactions.length}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold">Fine Rate</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            ₹{fineRate}/day
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-green-800 dark:text-green-300 font-semibold">Total Pending Fines</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{totalFines}
          </p>
        </div>
      </div>

      {/* Overdue Books Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Overdue Books & Fines</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Student</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Book</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Due Date</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Days Overdue</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Fine Amount</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overdueTransactions.map((transaction) => {
                const daysOverdue = Math.ceil(
                  (new Date().getTime() - new Date(transaction.due_date).getTime()) / 
                  (1000 * 60 * 60 * 24)
                )
                const fineAmount = calculateFine(transaction.due_date)
                
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      <div>
                        <div className="font-medium">{transaction.students.name}</div>
                        <div className="text-sm text-gray-500">{transaction.students.email}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      <div>
                        <div className="font-medium">{transaction.books.title}</div>
                        <div className="text-sm text-gray-500">by {transaction.books.author}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                        {new Date(transaction.due_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      <span className="font-bold text-red-600">
                        {daysOverdue} days
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      <span className="font-bold text-green-600">
                        ₹{fineAmount}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {!transaction.fine_amount ? (
                        <button
                          onClick={() => applyFine(transaction.id, fineAmount)}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                        >
                          Apply Fine
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                          Fine Applied
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {overdueTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-xl">🎉 No overdue books!</p>
            <p>All books have been returned on time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
