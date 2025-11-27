import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../constants/translations';

interface HeroProps {
  language: Language;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="text-center py-10 px-4">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-blue-600 rounded-full shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 tracking-tight">
        {t.title} <br className="md:hidden" />
        <span className="text-blue-600">{t.subtitle}</span>
      </h1>
      <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
        {t.desc}
      </p>
    </div>
  );
};

export default Hero;