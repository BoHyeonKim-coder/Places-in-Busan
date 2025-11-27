import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import InputForm from './components/InputForm';
import ResultView from './components/ResultView';
import { getHistoricalFact, planContent, generateWatercolorImage, generateLandscapeImage, getNearbyPlaces, getDietaryPlaces } from './services/geminiService';
import { GeneratedResult, LoadingState, Language } from './types';
import { AlertCircle, Globe } from 'lucide-react';
import { translations } from './constants/translations';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en'); // Default to English
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Handle RTL languages
  useEffect(() => {
    const rtlLanguages = ['ar', 'he', 'fa'];
    if (rtlLanguages.includes(language)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const handleGenerate = async (location: string, emotion: string) => {
    try {
      setError(null);
      setResult(null);
      
      // Step 1: Research History
      setLoadingState('researching');
      const history = await getHistoricalFact(location, language);
      
      // Step 2: Plan Content
      setLoadingState('planning');
      const textData = await planContent(location, emotion, history, language);
      
      // Step 3: Generate Images (Watercolor & Landscape) & Scout Nearby Places
      setLoadingState('scouting');
      
      // Run image generations and nearby place search in parallel for speed
      const [watercolorImageUrl, landscapeImageUrl, nearbyInfo] = await Promise.all([
        generateWatercolorImage(textData.visualPrompt),
        generateLandscapeImage(location),
        getNearbyPlaces(location, language)
      ]);

      setResult({ textData, watercolorImageUrl, landscapeImageUrl, nearbyInfo });
      setLoadingState('complete');

    } catch (err: any) {
      console.error(err);
      setError(translations[language].error);
      setLoadingState('error');
    }
  };

  const handleLoadDietary = async () => {
    if (!result || !result.textData) return;
    
    setLoadingState('dietary-loading');
    try {
      const dietaryPlaces = await getDietaryPlaces(result.textData.location, language);
      setResult(prev => prev ? { ...prev, dietaryPlaces } : null);
    } catch (err) {
      console.error("Dietary fetch error", err);
      // We don't block the UI with error, just maybe log it or show a toast in future
    } finally {
      setLoadingState('complete');
    }
  };

  const handleReset = () => {
    setLoadingState('idle');
    setResult(null);
    setError(null);
  };

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 relative">
      
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50 rtl:right-auto rtl:left-4">
        <button 
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-slate-100 transition-colors"
          aria-label="Change Language"
        >
          <Globe className="w-5 h-5 text-slate-600" />
        </button>
        
        {showLangMenu && (
          <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 h-96 overflow-y-auto">
            <button onClick={() => toggleLanguage('en')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'en' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>English</button>
            <button onClick={() => toggleLanguage('ko')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'ko' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>한국어 (Korean)</button>
            <button onClick={() => toggleLanguage('ja')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'ja' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>日本語 (Japanese)</button>
            <button onClick={() => toggleLanguage('zh')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'zh' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>中文 (Chinese)</button>
            <button onClick={() => toggleLanguage('fr')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'fr' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>Français (French)</button>
            <button onClick={() => toggleLanguage('ru')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'ru' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>Русский (Russian)</button>
            <button onClick={() => toggleLanguage('ar')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'ar' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>العربية (Arabic)</button>
            <button onClick={() => toggleLanguage('he')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'he' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>עברית (Hebrew)</button>
            <button onClick={() => toggleLanguage('fa')} className={`w-full text-left rtl:text-right px-4 py-2 text-sm hover:bg-slate-50 ${language === 'fa' ? 'font-bold text-blue-600' : 'text-slate-600'}`}>فارسی (Persian)</button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        
        {/* Header / Hero */}
        <div className={`transition-all duration-500 ${result ? 'hidden md:block' : 'block'}`}>
          <Hero language={language} />
        </div>

        {/* Main Content Area */}
        <main className="mt-8">
          {error && (
             <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p>{error}</p>
             </div>
          )}

          {loadingState !== 'complete' && loadingState !== 'dietary-loading' ? (
            <InputForm onSubmit={handleGenerate} loadingState={loadingState} language={language} />
          ) : (
            result && (
              <ResultView 
                result={result} 
                onReset={handleReset} 
                language={language}
                onLoadDietary={handleLoadDietary}
                isDietaryLoading={loadingState === 'dietary-loading'}
              />
            )
          )}
        </main>
        
        {/* Footer */}
        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>© 2024 Busan History Storyteller. Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;