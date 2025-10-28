import { Coffee } from 'lucide-react';

const CircularProgress = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-teal-50">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-teal-200"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset="125.6"
              className="text-teal-600 animate-spin"
              style={{ animationDuration: '2s' }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Coffee className="w-8 h-8 text-teal-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Sedang Memuat</h3>
          <p className="text-gray-600">Menyiapkan pengalaman terbaik untuk Anda</p>
        </div>
      </div>
    </div>
  );

  export default CircularProgress