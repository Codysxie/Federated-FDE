import { Link } from 'react-router-dom';

export default function CityFilter({ cities, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500 font-medium mr-1">🌍 城市：</span>
      <button
        onClick={() => onChange('')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          !selected
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        全部
      </button>
      {cities.map(city => (
        <button
          key={city}
          onClick={() => onChange(city)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            selected === city
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {city}
        </button>
      ))}
    </div>
  );
}
