import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FoodsDatabase } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FoodSearch({ onSelectFood, className }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const foods = await FoodsDatabase.search(term, 10);
      setResults(foods);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching foods:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSelectFood = (food) => {
    onSelectFood(food);
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          placeholder="חפש מזון (לפחות 2 תווים)..."
          className="pr-10 text-right"
        />
        {loading && (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg border border-gray-200">
          <div className="divide-y divide-gray-100">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className="w-full text-right p-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{food.name_he}</div>
                    {food.name_en && (
                      <div className="text-sm text-gray-500">{food.name_en}</div>
                    )}
                    {food.brand && (
                      <div className="text-xs text-blue-600 mt-1">{food.brand}</div>
                    )}
                  </div>
                  <div className="mr-4 text-left">
                    <div className="text-sm font-medium text-blue-600">
                      {food.calories} קלוריות
                    </div>
                    <div className="text-xs text-gray-500">
                      ל-{food.serving_size}{food.serving_unit}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-gray-600">
                  <span>חלבון: {food.protein}ג</span>
                  <span>פחמימות: {food.carbs}ג</span>
                  <span>שומן: {food.fats}ג</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showResults && searchTerm.length >= 2 && results.length === 0 && !loading && (
        <Card className="absolute z-50 w-full mt-1 p-4 shadow-lg border border-gray-200 text-center text-gray-500">
          לא נמצאו תוצאות. נסה חיפוש אחר.
        </Card>
      )}
    </div>
  );
}
