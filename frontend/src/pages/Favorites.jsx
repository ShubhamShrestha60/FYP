import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/favorites', {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Error loading favorites');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">You haven't added any products to your favorites yet.</p>
          <button
            onClick={() => navigate('/collection')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites; 