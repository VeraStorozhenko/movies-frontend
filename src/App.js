import './App.css';
import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MoviesList from "./MoviesList"
import MovieDetail from "./MovieDetail"
import { Toaster } from "react-hot-toast"
import Auth from "./Auth"

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"))

    const handleLogin = (newToken) => {
      setToken(newToken)
    }

    const handleLogout = () => {
      localStorage.removeItem("token")
      setToken(null)
    }

    if (!token) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth onLogin={handleLogin} />
      </>
    )
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<MoviesList token={token} onLogout={handleLogout} />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
