"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Customer } from "@/types/customer"
import { getCustomers } from "@/services/customer.service"

export default function CustomerManagement() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchCustomers() {
        try {
            const token = localStorage.getItem("token") || ""
            const res = await getCustomers(token, 1, 10, "")
            setCustomers(res.data.customers)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h1 className="text-2xl font-bold">Customer Management</h1>

            <div className="bg-white rounded-xl shadow p-4">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Name</th>
                                <th className="text-left p-2">Username</th>
                                <th className="text-left p-2">NIK</th>
                                <th className="text-left p-2">Phone</th>
                                <th className="text-left p-2">Address</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id} className="border-b">
                                    <td className="p-2">{customer.name}</td>
                                    <td className="p-2">{customer.username}</td>
                                    <td className="p-2">{customer.customer_number}</td>
                                    <td className="p-2">{customer.phone}</td>
                                    <td className="p-2">{customer.address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    )
}