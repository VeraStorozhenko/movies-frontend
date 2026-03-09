import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

function MoviesList({ token, onLogout }) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const moviesPerPage = 3
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    director: "",
    year: "",
    rating: ""
  })
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [currentMovie, setCurrentMovie] = useState(null)
  const [filterYear, setFilterYear] = useState("")
  const [filterRating, setFilterRating] = useState("")
  const [totalPages, setTotalPages] = useState(1)
  const filteredMovies = Array.isArray(movies) ? movies : []
    .filter(movie =>
      movie.title.toLowerCase().includes(search.toLowerCase()) ||
      movie.director.toLowerCase().includes(search.toLowerCase())
    )
    .filter(movie =>
      filterYear ? movie.year >= parseInt(filterYear) : true
    )
    .filter(movie =>
      filterRating ? movie.rating >= parseFloat(filterRating) : true
    ).sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title)
    if (sortBy === "year_asc") return a.year - b.year
    if (sortBy === "year_desc") return b.year - a.year
    if (sortBy === "rating_asc") return a.rating - b.rating
    if (sortBy === "rating_desc") return b.rating - a.rating
    return 0
  })
    const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (filterYear) params.append("year_from", filterYear)
    if (filterRating) params.append("rating_min", filterRating)
    if (sortBy) params.append("sort_by", sortBy)
    params.append("page", currentPage)  

    fetch(`${process.env.REACT_APP_API_URL}/movies/?${params}`)
      .then(response => response.json())
      .then(data => {
        setMovies(data.movies)
        setIsLoading(false)
      })
  }, [search, filterYear, filterRating, sortBy])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSearch = (e) => {
  setSearch(e.target.value)
  setCurrentPage(1)
}

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.director || !formData.year || !formData.rating) {
      toast.error(t("fillAll"))
      return
    }
    fetch(`${process.env.REACT_APP_API_URL}/movies/`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      body: JSON.stringify({
        ...formData,
        year: parseInt(formData.year),
        rating: parseFloat(formData.rating)
      })
    })
      .then(response => response.json())
      .then(newMovie => {
        setMovies([...movies, newMovie])
        toast.success(t("movieAdded"))
        setFormData({title: "", description: "", director: "", year: "", rating: ""})
      })
  }

  const handleDelete = (movieId) => {
    fetch(`${process.env.REACT_APP_API_URL}/movies/${movieId}`, { method: "DELETE" })
      .then(() => setMovies(movies.filter(m => m.id !== movieId)))
      .then(() => toast.success(t("movieDeleted")))
  }

  const handleUpdate = () => {
    fetch(`${process.env.REACT_APP_API_URL}/movies/${selectedMovie.id}`, {
      method: "PATCH",
      headers  : {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        ...selectedMovie,
        year: parseInt(selectedMovie.year),
        rating: parseFloat(selectedMovie.rating)
      })
    })
      .then(response => response.json())
      .then(updatedMovie => {
        setMovies(movies.map(m => m.id === updatedMovie.id ? updatedMovie : m))
        setSelectedMovie(null)
      }).then(() => toast.success(t("movieUpdated")))
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500 text-xl">{t("loading")}</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* переключатель языка */}
      <div className="flex justify-end gap-2 mb-4">
        {["ru", "en", "es"].map(lng => (
          <button
            key={lng}
            onClick={() => i18n.changeLanguage(lng)}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              i18n.language === lng
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {lng.toUpperCase()}
          </button>
        ))}
      </div>
        <button
          onClick={onLogout}
          className="px-3 py-1 rounded-lg text-sm font-medium bg-red-400 hover:bg-red-500 text-white"
        >
          {t("logout")}
        </button>
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">🎬 Фильмы</h1>
      <div className="mb-6 flex gap-3">
        <input
          className="border rounded-lg p-3 flex-1"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          placeholder={`🔍 ${t("search")}...`}
        />
        <select
          className="border rounded-lg p-3"
          value={filterYear}
          onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1) }}
        >
          <option value="">{t("allYears")}</option>
          <option value="2020">2020+</option>
          <option value="2010">2010+</option>
          <option value="2000">2000+</option>
          <option value="1990">1990+</option>
        </select>
        <select
          className="border rounded-lg p-3"
          value={filterRating}
          onChange={(e) => { setFilterRating(e.target.value); setCurrentPage(1) }}
        >
          <option value="">{t("allRatings")}</option>
          <option value="9">9+</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="5">5+</option>
        </select>
      <select
        className="border rounded-lg p-3"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="">{t("sortBy")}</option>
        <option value="title">{t("title")} A-Z</option>
        <option value="year_desc">{t("year")} ↓</option>
        <option value="year_asc">{t("year")} ↑</option>
        <option value="rating_desc">{t("rating")} ↓</option>
        <option value="rating_asc">{t("rating")} ↑</option>
      </select>
      </div>

      {/* форма */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700">{t("addMovie")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm text-gray-600">{t("title")}<span className="text-red-500">*</span></label>
            <input className="border rounded-lg p-2 w-full mt-1" name="title" value={formData.title} onChange={handleChange} placeholder={t("enterTitle")} />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">{t("description")}<span className="text-red-500">*</span></label>
            <input className="border rounded-lg p-2 w-full mt-1" name="description" value={formData.description} onChange={handleChange} placeholder={t("enterDescription")} />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">{t("director")}<span className="text-red-500">*</span></label>
            <input className="border rounded-lg p-2 w-full mt-1" name="director" value={formData.director} onChange={handleChange} placeholder={t("enterDirectorName")} />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">{t("year")}<span className="text-red-500">*</span></label>
            <input className="border rounded-lg p-2 w-full mt-1" name="year" value={formData.year} onChange={handleChange} placeholder={t("enterYear")} />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">{t("rating")}<span className="text-red-500">*</span></label>
            <input className="border rounded-lg p-2 w-full mt-1" name="rating" value={formData.rating} onChange={handleChange} placeholder={t("enterRating")} />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 font-medium"
          >
            {t("add")}
          </button>
        </div>
      </div>

      {/* список фильмов */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMovies.map(movie => (
          <div key={movie.id} className="bg-white rounded-xl shadow p-5">
            {selectedMovie?.id === movie.id ? (
              <div className="grid grid-cols-2 gap-3">
                <input className="border rounded-lg p-2 col-span-2" value={selectedMovie.title} onChange={(e) => setSelectedMovie({...selectedMovie, title: e.target.value})} placeholder={t("title")} />
                <input className="border rounded-lg p-2 col-span-2" value={selectedMovie.description} onChange={(e) => setSelectedMovie({...selectedMovie, description: e.target.value})} placeholder={t("description")} />
                <input className="border rounded-lg p-2" value={selectedMovie.director} onChange={(e) => setSelectedMovie({...selectedMovie, director: e.target.value})} placeholder={t("director")}/>
                <input className="border rounded-lg p-2" value={selectedMovie.year} onChange={(e) => setSelectedMovie({...selectedMovie, year: e.target.value})} placeholder={t("year")} />
                <input className="border rounded-lg p-2" value={selectedMovie.rating} onChange={(e) => setSelectedMovie({...selectedMovie, rating: e.target.value})} placeholder={t("rating")} />
                <div className="col-span-2 flex gap-2">
                  <button onClick={handleUpdate} className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-2 flex-1">{t("save")}</button>
                  <button onClick={() => setSelectedMovie(null)} className="bg-gray-300 hover:bg-gray-400 rounded-lg p-2 flex-1">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1">
                  <h2
                    onClick={() => navigate(`/movies/${movie.id}`)}
                    className="text-xl font-bold text-blue-500 hover:text-blue-700 cursor-pointer mb-2"
                  >
                    {movie.title}
                  </h2>
                  <p className="text-gray-500 text-sm mb-1">🎬 {movie.director}</p>
                  <p className="text-gray-500 text-sm mb-1">📅 {movie.year}</p>
                  <p className="text-yellow-500 text-sm mb-3">⭐ {movie.rating}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedMovie(movie)} className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg px-3 py-1 text-sm">{t("edit")}</button>
                    <button onClick={() => handleDelete(movie.id)} className="bg-red-400 hover:bg-red-500 text-white rounded-lg px-3 py-1 text-sm">{t("delete")}</button>
                  </div>
                </div>
                  <div className="w-64 border-l pl-4">
                    <p className="text-sm text-gray-400 font-medium mb-1">{t("description")}</p>
                    <p className="text-gray-600 text-sm">{movie.description}</p>
                  </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
        >
          ←
        </button>

        {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
        >
          →
        </button>
      </div>
)}
    </div>
    
  )
}

export default MoviesList