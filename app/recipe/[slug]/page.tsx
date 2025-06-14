"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  ArrowLeft, 
  Clock, 
  Users, 
  ExternalLink,
  AlertCircle 
} from 'lucide-react';

// Define interfaces
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

const RecipeDetailPage: React.FC = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  
  const slug = params?.slug as string;

  useEffect(() => {
    const loadRecipe = () => {
      try {
        if (typeof window === 'undefined') return;
        
        const storedRecipes = localStorage.getItem('searchResults');
        if (!storedRecipes) {
          setError('No recipe data found. Please search for recipes first.');
          setLoading(false);
          return;
        }

        const recipes: Recipe[] = JSON.parse(storedRecipes);
        
        // Extract index from slug (last number after the last dash)
        const slugParts = slug.split('-');
        const indexStr = slugParts[slugParts.length - 1];
        const recipeIndex = parseInt(indexStr, 10);

        if (isNaN(recipeIndex) || recipeIndex < 0 || recipeIndex >= recipes.length) {
          setError('Recipe not found. The recipe may have been removed or the link is invalid.');
          setLoading(false);
          return;
        }

        const foundRecipe = recipes[recipeIndex];
        if (!foundRecipe) {
          setError('Recipe not found.');
          setLoading(false);
          return;
        }

        setRecipe(foundRecipe);
        setLoading(false);
      } catch (err) {
        console.error('Error loading recipe:', err);
        setError('Failed to load recipe data.');
        setLoading(false);
      }
    };

    if (slug) {
      loadRecipe();
    }
  }, [slug]);

  const handleBackToSearch = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-300">Loading recipe details...</p>
          </motion.div>
        </div>
      </section>
    );
  }

  if (error || !recipe) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.button
            onClick={handleBackToSearch}
            className="flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-8 transition-colors duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-2xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Recipe Not Found</h1>
            <p className="text-gray-300 mb-6">
              {error || 'The recipe you\'re looking for could not be found.'}
            </p>
            <button
              onClick={handleBackToSearch}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 font-medium"
            >
              Search for Recipes
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.button
          onClick={handleBackToSearch}
          className="flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6 transition-colors duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Recipe Header */}
          <div className="relative h-64 md:h-80">
            <img
              src={recipe.image}
              alt={recipe.label}
              className="w-full h-full object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE4MCA5MEgxNjBWNzBIMTQwVjUwSDE2MFYzMEgxODBWNTBIMjAwVjcwSDIyMFY5MEgyNDBWMTEwSDI2MFYxMzBIMjQwVjE1MEgyMjBWMTcwSDIwMFYxOTBIMTgwVjIxMEgxNjBWMjMwSDE0MFYyMTBIMTYwVjE5MEgxODBWMTcwSDIwMFYxNTBaIiBmaWxsPSIjNkI3MjgwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5OUE2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {recipe.label}
              </h1>
              {recipe.source && (
                <p className="text-amber-400 font-medium">
                  Recipe by {recipe.source}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Recipe Info */}
            <div className="flex flex-wrap gap-4 mb-8">
              {recipe.yield && (
                <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span className="text-white text-sm">
                    Serves {recipe.yield}
                  </span>
                </div>
              )}
              {recipe.totalTime && recipe.totalTime > 0 && (
                <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-white text-sm">
                    {recipe.totalTime} min
                  </span>
                </div>
              )}
              {recipe.calories && (
                <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                  <span className="text-amber-500 text-sm font-medium">🔥</span>
                  <span className="text-white text-sm">
                    {Math.round(recipe.calories)} cal
                  </span>
                </div>
              )}
            </div>

            {/* Recipe Tags */}
            {(recipe.cuisineType || recipe.mealType || recipe.dishType) && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.cuisineType?.map((cuisine, index) => (
                    <span key={index} className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm">
                      {cuisine}
                    </span>
                  ))}
                  {recipe.mealType?.map((meal, index) => (
                    <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {meal}
                    </span>
                  ))}
                  {recipe.dishType?.map((dish, index) => (
                    <span key={index} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-amber-500" />
                Ingredients ({recipe.ingredientLines?.length || 0})
              </h3>
              <div className="grid gap-3">
                {recipe.ingredientLines?.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-200 leading-relaxed">{ingredient}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* External Link */}
            <div className="pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-4">
                Want the full recipe with cooking instructions?
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={recipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Recipe
                </a>
                <button
                  onClick={handleBackToSearch}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Search More Recipes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RecipeDetailPage;