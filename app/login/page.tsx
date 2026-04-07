"use client"

import { APP_KEY, BASE_API_URL } from "@/global"
import { storeCookie } from "@/lib/client-cookies"
import axios from "axios"
import React from "react"
import { useRouter } from "next/navigation"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Navbar from "../components/home/Navbar"
import Link from "next/link"

const LoginPage = () => {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = `${BASE_API_URL}/auth`
      const payload = { username, password }

      const { data } = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "App-Key": APP_KEY,
        },
      })

      // Ambil role dari response — sesuaikan field jika API berbeda
      const rawRole: string = data.role ?? data.user?.role

      if (!rawRole) {
        toast.error("Login gagal: role tidak ditemukan dari server.", {
          hideProgressBar: true,
        })
        return
      }

      // Normalisasi ke lowercase agar konsisten dengan middleware
      const role = rawRole.toLowerCase()

      // Simpan ke cookie — HARUS lewat storeCookie agar middleware bisa baca
      storeCookie("token", data.token)
      storeCookie("role", role)

      toast.success("Login berhasil!", {
        autoClose: 1000,
        hideProgressBar: true,
      })

      // Redirect berdasarkan role
      setTimeout(() => {
        router.push(role === "admin" ? "/admin" : "/customer")
      }, 1000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Login gagal", {
          hideProgressBar: true,
        })
      } else {
        toast.error("Terjadi kesalahan, silakan coba lagi.", {
          hideProgressBar: true,
        })
      }
    }
  }

  return (
    <>
      <Navbar />
      <ToastContainer />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8 flex-col justify-center">
            <h1 className="text-2xl font-bold text-slate-800">
              Login PDAM Smart
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Masuk untuk mengelola layanan air Anda
            </p>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-slate-600">
              Username
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="text-sm font-medium text-slate-600">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-blue-600 text-white py-3 font-semibold shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition"
          >
            Login
          </button>

          <div className="text-center text-md text-blue-600 flex gap-1 justify-center mt-4">
            <p>Not a member?</p>
            <Link href="/register" className="font-medium underline">
              Register Now!
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2025 PDAM Smart • Secure Water Service
          </p>
        </form>
      </div>
    </>
  )
}

export default LoginPage