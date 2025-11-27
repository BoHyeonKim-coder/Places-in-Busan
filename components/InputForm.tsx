import React, { useState, useEffect } from 'react';
import { MapPin, Heart, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { LoadingState, Language } from '../types';
import { translations } from '../constants/translations';

interface InputFormProps {
  onSubmit: (location: string, emotion: string) => void;
  loadingState: LoadingState;
  language: Language;
}

const BUSAN_PLACES = [
  "Gamcheon Culture Village", "Haeundae Beach", "Gwangalli Beach", 
  "Jagalchi Market", "Haedong Yonggungsa", "Taejongdae", 
  "Oryukdo Skywalk", "Songdo Cable Car", "Beomeosa Temple", 
  "UN Memorial Cemetery", "Dadaepo Beach", "Huinnyeoul Culture Village",
  "40 Steps", "Yongdusan Park", "Busan Cinema Center"
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, loadingState, language }) => {
  const [location, setLocation] = useState('');
  const [emotion, setEmotion] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const t = translations[language];

  // Randomly select 3-4 places on mount
  useEffect(() => {
    shuffleRecommendations();
  }, []);

  const shuffleRecommendations = () => {
    const shuffled = [...BUSAN_PLACES].sort(() => 0.5 - Math.random());
    setRecommendations(shuffled.slice(0, 4));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && emotion.trim()) {
      onSubmit(location, emotion);
    }
  };

  const isLoading = loadingState !== 'idle' && loadingState !== 'complete' && loadingState !== 'error';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
              {t.locationLabel}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 rtl:left-auto rtl:right-3" />
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none rtl:pl-4 rtl:pr-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="emotion" className="block text-sm font-semibold text-slate-700 mb-2">
              {t.emotionLabel}
            </label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 rtl:left-auto rtl:right-3" />
              <input
                id="emotion"
                type="text"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                placeholder={t.emotionPlaceholder}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none rtl:pl-4 rtl:pr-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !location || !emotion}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]
              ${isLoading || !location || !emotion
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {loadingState === 'researching' && t.loadingResearch}
                  {loadingState === 'planning' && t.loadingPlan}
                  {loadingState === 'designing' && t.loadingDesign}
                </span>
              </>
            ) : (
              <>
                <span>{t.submitButton}</span>
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.recommendationTitle}</h3>
          <button onClick={shuffleRecommendations} className="p-1 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-blue-500">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {recommendations.map((place) => (
            <button
              key={place}
              onClick={() => setLocation(place)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all text-left"
            >
              {place}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputForm;