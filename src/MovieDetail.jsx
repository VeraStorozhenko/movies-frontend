import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:8000/movies/${id}`)
      .then(response => response.json())
      .then(data => {
        setMovie(data)
        setIsLoading(false)
      })
  }, [id])

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500 text-xl">{t("loading")}</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-blue-500 hover:text-blue-700 font-medium"
      >
        {t("back")}
      </button>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
        <p className="text-gray-600 mb-2">📝 {movie.description}</p>
        <p className="text-gray-600 mb-2">🎬 {t("director")}: {movie.director}</p>
        <p className="text-gray-600 mb-2">📅 {t("year")}: {movie.year}</p>
        <p className="text-yellow-500 font-bold">⭐ {t("rating")}: {movie.rating}</p>
      </div>
    </div>
  )
}

export default MovieDetail