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

      toast.success("Login successful", {
        autoClose: 1500,
        hideProgressBar: true,
      })

      storeCookie("token", data.token)
      storeCookie("role", "ADMIN")

      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Login failed", {
          hideProgressBar: true,
        })
      } else {
        toast.error("Unexpected error occurred", {
          hideProgressBar: true,
        })
      }
    }
  }

  return (
    <>
      <Navbar />
      <ToastContainer />

      
    </>
  )
}

export default LoginPage
