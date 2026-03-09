import { useState } from "react"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

function Auth({ onLogin }) {
  const { t } = useTranslation()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = () => {
    if (!username || !password) {
      toast.error(t("fillAll"))
      return
    }

    const url = isLogin
      ? `${process.env.REACT_APP_API_URL}/auth/login`
      : `${process.env.REACT_APP_API_URL}/auth/register`

    fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password})
    })
      .then(response => {
        if (!response.ok) throw new Error()
        return response.json()
      })
      .then(data => {
        if (isLogin) {
          localStorage.setItem("token", data.access_token)
          onLogin(data.access_token)
          toast.success(t("loginSuccess"))
        } else {
          toast.success(t("registerSuccess"))
          setIsLogin(true)
        }
      })
      .catch(() => toast.error(t("authError")))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">
          🎬 {isLogin ? t("login") : t("register")}
        </h1>

        <div className="mb-4">
          <label className="text-sm text-gray-600">{t("username")}</label>
          <input
            className="border rounded-lg p-2 w-full mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("username")}
          />
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-600">{t("password")}</label>
          <input
            className="border rounded-lg p-2 w-full mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 w-full font-medium mb-4"
        >
          {isLogin ? t("login") : t("register")}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-center text-sm text-blue-500 hover:text-blue-700 cursor-pointer"
        >
          {isLogin ? t("noAccount") : t("hasAccount")}
        </p>
      </div>
    </div>
  )
}

export default Auth