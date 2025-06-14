"use client";
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Search, RefreshCw } from 'lucide-react';

// Define interfaces for Edamam API response
interface Recipe {
  label: string;
  image: string;
  ingredientLines: string[];
  url: string;
  yield?: number;
  totalTime?: number;
  cuisineType?: string[];
  mealType?: string[];
  dishType?: string[];
  source?: string;
  calories?: number;
}

interface EdamamResponse {
  hits: { recipe: Recipe }[];
}

// Define interface for Axios error
interface AxiosError extends Error {
  response?: {
    status: number;
    data: unknown;
  };
}

const RecipeFinder: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fixed environment variable access for client-side
  const APP_ID = process.env.NEXT_PUBLIC_EDAMAM_APP_ID;
  const APP_KEY = process.env.NEXT_PUBLIC_EDAMAM_APP_KEY;
  
  // Fixed API URL - using the correct endpoint
  const API_URL = 'https://api.edamam.com/api/recipes/v2';

  const handleSearch = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients');
      return;
    }

    if (!APP_ID || !APP_KEY) {
      setError('API credentials are missing. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<EdamamResponse>(API_URL, {
        params: {
          type: 'public',
          app_id: APP_ID,
          app_key: APP_KEY,
          q: ingredients.trim(),
          // Fixed: 'field' should be 'fields' and should be a comma-separated string
          fields: 'label,image,ingredientLines,url,yield,totalTime,cuisineType,mealType,dishType,source,calories',
          // Optional: add more specific parameters
          from: 0,
          to: 12, // Limit results
        },
        timeout: 15000, // Increased timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('API Response:', response.data); // For debugging

      if (!response.data?.hits || !Array.isArray(response.data.hits)) {
        throw new Error('Invalid API response: No recipes found or unexpected response format');
      }

      if (response.data.hits.length === 0) {
        setError('No recipes found for these ingredients. Try different ingredients!');
        setRecipes([]);
        return;
      }

      const validRecipes = response.data.hits
        .map(hit => hit.recipe)
        .filter(recipe => recipe && recipe.label && recipe.image); // Filter out invalid recipes

      setRecipes(validRecipes);
      
      // Store recipes in localStorage for the detail page to access
      if (typeof window !== 'undefined') {
        localStorage.setItem('searchResults', JSON.stringify(validRecipes));
      }
      
      if (validRecipes.length === 0) {
        setError('No valid recipes found. Try different ingredients!');
      }

    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching recipes:', axiosError);
      console.error('Error details:', {
        message: axiosError.message,
        response: axiosError.response?.data ?? null,
        status: axiosError.response?.status ?? null,
      });

      let errorMessage = 'Failed to fetch recipes. Please try again.';
      
      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 401:
            errorMessage = 'Invalid API credentials. Please verify your APP_ID and APP_KEY.';
            break;
          case 403:
            errorMessage = 'Access forbidden. Please check your API subscription and credentials.';
            break;
          case 429:
            errorMessage = 'API rate limit exceeded. Please wait a minute and try again.';
            break;
          case 400:
            errorMessage = 'Invalid request. Please check your ingredients and try again.';
            break;
          case 404:
            errorMessage = 'API endpoint not found. Please check the API configuration.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Edamam server error. Please try again later.';
            break;
          default:
            errorMessage = `API error (${axiosError.response.status}). Please try again.`;
        }
      } else if (axiosError.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (axiosError.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      setError(errorMessage);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIngredients('');
    setRecipes([]);
    setError(null);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('searchResults');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  const createRecipeSlug = (label: string, index: number): string => {
    return `${label
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()}-${index}`;
  };

  const handleViewRecipe = (recipe: Recipe, index: number) => {
    const slug = createRecipeSlug(recipe.label, index);
    router.push(`/recipe/${slug}`);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-10 h-10 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Recipe Finder
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Discover delicious recipes by Khaled Iman</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="mb-12 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-full max-w-2xl flex flex-col gap-4">
            <input
              type="text"
              value={ingredients}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIngredients(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter ingredients (e.g., chicken, rice, tomato)"
              className="w-full p-4 bg-gray-700 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 placeholder-gray-400"
            />
            <div className="flex gap-4">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Searching...' : 'Find Recipes'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 mt-4 text-center max-w-2xl"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Recipe Grid */}
        <AnimatePresence>
          {recipes.length > 0 && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {recipes.map((recipe, index) => {
                const slug = createRecipeSlug(recipe.label, index);
                return (
                  <motion.div
                    key={`${recipe.url}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.label}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE4MCA5MEgxNjBWNzBIMTQwVjUwSDE2MFYzMEgxODBWNTBIMjAwVjcwSDIyMFY5MEgyNDBWMTEwSDI2MFYxMzBIMjQwVjE1MEgyMjBWMTcwSDIwMFYxOTBIMTgwVjIxMEgxNjBWMjMwSDE0MFYyMTBIMTYwVjE5MEgxODBWMTcwSDIwMFYxNTBaIiBmaWxsPSIjNkI3MjgwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5OUE2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-3 line-clamp-2">
                        {recipe.label}
                      </h2>
                      <p className="text-gray-300 text-sm mb-4">
                        Ingredients: {recipe.ingredientLines?.length || 0}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewRecipe(recipe, index)}
                          className="flex-1 inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 font-medium text-center"
                        >
                          View Recipe
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results Message */}
        {recipes.length === 0 && !loading && !error && ingredients.trim() === '' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 mt-12"
          >
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-lg mb-2">Ready to find some delicious recipes?</p>
            <p className="text-sm">Enter your ingredients above to get started!</p>
          </motion.div>
        )}

        {loading && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-300">Searching for delicious recipes...</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default RecipeFinder;