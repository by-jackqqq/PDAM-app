"use client"

import { CreateAdminPayload } from "@/types/admin"
import { useState } from "react"

interface Props {
    defaultValue?: {
        name: string
        username: string
    }
    onSubmit: (data: CreateAdminPayload) => void
}

export default function AdminForm({ defaultValue, onSubmit }: Props) {

    const [name, setName] = useState(defaultValue?.name ?? "")
    const [username, setUsername] = useState(defaultValue?.username ?? "")
    const [password, setPassword] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        onSubmit({
            name,
            username,
            password,
        })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow max-w-md"
        >

            <h2 className="text-lg font-semibold mb-4">
                Admin Form
            </h2>

            <input
                className="border p-2 w-full mb-3"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                className="border p-2 w-full mb-3"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="password"
                className="border p-2 w-full mb-4"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button className="bg-blue-600 text-white w-full py-2 rounded">
                Save
            </button>

        </form>
    )
}