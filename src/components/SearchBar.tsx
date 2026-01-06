import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
  debounceMs?: number;
}

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  initialValue = '',
  debounceMs = 500
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = window.setTimeout(() => {
      onSearch(value.trim());
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, debounceMs, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative flex items-center bg-white rounded-xl shadow-sm transition-all ${
          isFocused ? 'ring-2 ring-offset-2 shadow-md' : ''
        }`}
        style={isFocused ? { ringColor: 'var(--color-primary)' } : {}}
      >
        {/* Search Icon */}
        <div className="absolute left-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-3 pl-12 pr-12 text-gray-900 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none"
          aria-label="Search"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ ringColor: 'var(--color-primary)' }}
            aria-label="Clear search"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search hint */}
      {value && value.length > 0 && value.length < 3 && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
}
