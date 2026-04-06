import { useState } from 'react'
import axios from 'axios'

function App() {
  const [formData, setFormData] = useState({
    user_id: 1,
    movie_id: 1,
    age_genre: "1_Animation",
    gender_genre: "F_Animation",
    year_scaled: 0.95
  });

  // Updated state to handle the rich metadata from the API
  const [prediction, setPrediction] = useState(null);
  const [movieTitle, setMovieTitle] = useState("");
  const [userDesc, setUserDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await axios.get('https://ml-movie-backend.onrender.com/predict', {
        params: {
          user_id: parseInt(formData.user_id),
          movie_id: parseInt(formData.movie_id),
          age_genre: formData.age_genre,
          gender_genre: formData.gender_genre,
          year_scaled: parseFloat(formData.year_scaled)
        }
      });

      if (response.data.success) {
        // Save the prediction AND the metadata to state
        setPrediction(response.data.predicted_rating);
        setMovieTitle(response.data.movie_title);
        setUserDesc(response.data.user_desc);
      } else {
        setError(response.data.error || "An error occurred on the server.");
      }
    } catch (err) {
      setError("Failed to connect to the ML API. Is the Python server running?");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 font-sans text-zinc-300 selection:bg-amber-500 selection:text-zinc-900">
      
      {/* Main Card Container */}
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-8 text-center">
          <h1 className="text-3xl font-light text-zinc-100 tracking-wide mb-2">
            AI Movie Recommender
          </h1>
          <p className="text-amber-500/80 text-sm tracking-widest uppercase font-semibold">
            Wide & Deep Engineering Dashboard
          </p>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left Column: The Form */}
          <div className="px-8 py-8 md:w-3/5 border-b md:border-b-0 md:border-r border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">User ID</label>
                  <input type="number" name="user_id" value={formData.user_id} onChange={handleChange} required 
                    className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Movie ID</label>
                  <input type="number" name="movie_id" value={formData.movie_id} onChange={handleChange} required 
                    className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Age + Genre (Wide)</label>
                <input type="text" name="age_genre" value={formData.age_genre} onChange={handleChange} required 
                  className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Gender + Genre (Wide)</label>
                <input type="text" name="gender_genre" value={formData.gender_genre} onChange={handleChange} required 
                  className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Scaled Release Year</label>
                <input type="number" step="0.01" name="year_scaled" value={formData.year_scaled} onChange={handleChange} required 
                  className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-colors" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 px-4 text-zinc-900 font-bold uppercase tracking-widest rounded-lg shadow-lg transition-all duration-200 
                  ${loading ? 'bg-amber-700 cursor-not-allowed text-zinc-300' : 'bg-amber-500 hover:bg-amber-400 hover:shadow-amber-500/20'}`}
              >
                {loading ? "Analyzing Matrix..." : "Predict Rating"}
              </button>
            </form>
          </div>

          {/* Right Column: The Explanations & Results */}
          <div className="px-8 py-8 md:w-2/5 bg-zinc-900/50 flex flex-col justify-between">
            
            {/* Contextual Guide */}
            <div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Input Guide</h3>
              <ul className="text-xs text-zinc-400 space-y-4">
                <li>
                  <strong className="text-amber-500/80">Age Brackets:</strong><br/>
                  1 (Under 18), 18, 25, 35, 45, 50, 56+
                </li>
                <li>
                  <strong className="text-amber-500/80">Movie Genres:</strong><br/>
                  Action, Animation, Comedy, Drama, Sci-Fi, Romance, Thriller...
                </li>
                <li>
                  <strong className="text-amber-500/80">Formatting the Wide Features:</strong><br/>
                  Combine the bracket/gender with a genre using an underscore.<br/>
                  <span className="text-zinc-500 italic">Example: "25_Action" or "M_Sci-Fi"</span>
                </li>
                <li>
                  <strong className="text-amber-500/80">Scaled Year:</strong><br/>
                  A normalized value between 0.0 and 1.0 representing the release decade. (0.95 ≈ 1995).
                </li>
              </ul>
            </div>

            {/* Dynamic Results Display */}
            <div className="mt-8">
              {prediction !== null && (
                <div className="p-6 bg-zinc-950 border border-amber-500/30 rounded-xl shadow-inner animate-fade-in">
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4 text-center">
                    Based on our model's analysis, an <strong className="text-zinc-200">{userDesc}</strong> will likely give the movie <strong className="text-amber-500">"{movieTitle}"</strong> a rating of:
                  </p>
                  <div className="text-4xl font-light text-amber-500 text-center">
                    {prediction} <span className="text-xl text-zinc-500">/ 5.0</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
                  <p className="text-sm text-red-400 font-medium">System Error: {error}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default App