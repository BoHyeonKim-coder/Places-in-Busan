
import React from 'react';
import { GeneratedResult, Language, NearbyPlace } from '../types';
import { BookOpen, Film, HeartHandshake, Quote, Share2, Download, Instagram, Twitter, Facebook, Camera, Map, Coffee, BedDouble, Tent, Utensils, Loader2, Leaf, Star, CheckCircle, ExternalLink } from 'lucide-react';
import { translations } from '../constants/translations';

interface ResultViewProps {
  result: GeneratedResult;
  onReset: () => void;
  language: Language;
  onLoadDietary: () => void;
  isDietaryLoading: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onReset, language, onLoadDietary, isDietaryLoading }) => {
  const { textData, imageUrl, landscapeImageUrl, nearbyInfo, dietaryPlaces } = result;
  const t = translations[language];

  const shareText = `[${t.title}]\n\n${textData.contentTitle}\n${textData.location} / ${textData.emotion}\n\n"${textData.posterSlogan}"\n\n#Busan #Storytelling #NanoBanana`;
  const currentUrl = window.location.href;

  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(textData.location)}`;
  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(textData.location)}`;

  const handleShare = (platform: string) => {
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + currentUrl)}`, '_blank');
        break;
      case 'instagram':
        alert("Download the image to share on Instagram!");
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: textData.contentTitle,
            text: shareText,
            url: currentUrl,
          }).catch(console.error);
        } else {
          navigator.clipboard.writeText(shareText + "\n" + currentUrl);
          alert("Copied to clipboard.");
        }
    }
  };

  const renderPlaceCard = (place: NearbyPlace, type: 'food' | 'sleep' | 'fun') => {
     let Icon = Coffee;
     if (type === 'sleep') Icon = BedDouble;
     if (type === 'fun') Icon = Tent;

     return (
        <div key={place.name} className="flex flex-col bg-slate-50 rounded-lg p-3 border border-slate-100 hover:shadow-md transition-shadow">
           <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-full ${type === 'food' ? 'bg-orange-100 text-orange-600' : type === 'sleep' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 <Icon className="w-3 h-3" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm truncate">{place.name}</h4>
           </div>
           <span className="text-xs text-slate-500 mb-1 font-medium bg-white self-start px-2 py-0.5 rounded border border-slate-100">{place.category}</span>
           <p className="text-xs text-slate-600 line-clamp-2 mb-2 flex-grow">{place.description}</p>
           {place.price && (
             <div className="mt-auto pt-2 border-t border-slate-200">
               <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.priceInfo}</span>
               <span className="text-sm font-bold text-slate-900">{place.price}</span>
             </div>
           )}
        </div>
     );
  };

  const renderDietaryList = (items: NearbyPlace[], icon: React.ReactNode, label: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mt-4">
        <h5 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
          {icon} {label}
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, idx) => {
             const itemKakao = `https://map.kakao.com/link/search/${encodeURIComponent(item.name)}`;
             const itemNaver = `https://map.naver.com/p/search/${encodeURIComponent(item.name)}`;
             
             return (
               <div key={idx} className="bg-white rounded p-3 border border-slate-100 shadow-sm text-sm flex flex-col h-full">
                  <div className="font-bold text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-500 mb-1">{item.category}</div>
                  <div className="text-xs text-slate-600 mb-3 flex-grow">{item.description}</div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto print:hidden">
                    <a href={itemKakao} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center justify-center gap-1 py-1.5 rounded bg-[#FEE500] text-black text-[10px] font-bold hover:brightness-95 transition-all">
                       <Map className="w-3 h-3" /> K-Map
                    </a>
                    <a href={itemNaver} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center justify-center gap-1 py-1.5 rounded bg-[#03C75A] text-white text-[10px] font-bold hover:brightness-95 transition-all">
                       <Map className="w-3 h-3" /> N-Map
                    </a>
                    {item.url && (
                       <a href={item.url} target="_blank" rel="noopener noreferrer" 
                          className="col-span-2 flex items-center justify-center gap-1 py-1.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-all">
                          <ExternalLink className="w-3 h-3" /> Website
                       </a>
                    )}
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-12 pb-20 fade-in">
      
      {/* Print Layout Section (Hidden on screen, visible on print) */}
      <div className="hidden print:block space-y-8 p-8 max-w-[210mm] mx-auto bg-white">
          {/* Cover Page */}
          <div className="text-center border-b-2 border-black pb-8 mb-8">
            <h1 className="text-4xl font-black mb-2">{textData.contentTitle}</h1>
            <p className="text-xl text-gray-600">{textData.location} | {textData.emotion}</p>
            <div className="mt-4 text-sm text-gray-400">Generated by Busan History Storytelling AI</div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
             {imageUrl && (
               <div>
                  <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Poster Concept</h3>
                  <img src={imageUrl} className="w-full object-cover rounded shadow-sm border border-gray-200" alt="Poster" />
                  <p className="text-center font-bold text-lg mt-2 italic">"{textData.posterSlogan}"</p>
               </div>
             )}
             {landscapeImageUrl && (
               <div>
                  <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Location View</h3>
                  <img src={landscapeImageUrl} className="w-full object-cover rounded shadow-sm border border-gray-200" alt="Landscape" />
               </div>
             )}
          </div>

          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded">
                   <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">Project Info</h3>
                   <p><span className="font-semibold">Type:</span> {textData.contentType}</p>
                   <p><span className="font-semibold">Target:</span> {textData.targetAudience}</p>
                   <p><span className="font-semibold">Effect:</span> {textData.effect}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                   <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">History Context</h3>
                   <p className="text-sm text-justify leading-relaxed">{textData.history}</p>
                </div>
             </div>
             
             <div>
                <h3 className="font-bold text-lg mb-2">Synopsis</h3>
                <div className="p-4 border border-gray-200 rounded text-sm text-justify leading-relaxed">
                   {textData.plot}
                </div>
             </div>

             <div>
                <h3 className="font-bold text-lg mb-2">Consolation Message</h3>
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded text-sm italic text-gray-700">
                   "{textData.consolationMessage}"
                </div>
             </div>
          </div>
          
          <div className="mt-8 pt-8 border-t-2 border-black text-center text-xs text-gray-400">
             Report generated on {new Date().toLocaleDateString()}
          </div>
      </div>

      {/* Screen Layout Section */}
      <div className="print:hidden space-y-12">
          {/* 1. Header Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-black rounded-full text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Nano Banana Project
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {textData.contentTitle}
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              {textData.location} <span className="text-yellow-500 mx-2">●</span> {textData.emotion}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            
            {/* 2. Poster & Visuals Section (Left/Top) */}
            <div className="space-y-6">
              {/* Main Artistic Poster */}
              <div className="relative group bg-black rounded-sm overflow-hidden shadow-2xl aspect-[3/4] border-8 border-white ring-4 ring-black transform rotate-1 transition-transform hover:rotate-0 z-10">
                 {/* Poster Image */}
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Generated Poster" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-400 text-black p-6 text-center">
                    <span className="font-black text-2xl uppercase">{t.noImage}</span>
                  </div>
                )}
                
                {/* Overlay Slogan */}
                <div className="absolute bottom-8 left-0 right-0 px-6">
                  <div className="bg-yellow-400 text-black text-xs font-black inline-block px-2 py-1 mb-3 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    NANO BANANA ORIGINAL
                  </div>
                  <h3 className="text-white text-3xl md:text-4xl font-black leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black" style={{WebkitTextStroke: "1px black"}}>
                    {textData.posterSlogan}
                  </h3>
                </div>
              </div>

              {/* Real Landscape Photo (Added) */}
              <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 transform -rotate-1 hover:rotate-0 transition-transform">
                 <div className="relative aspect-video overflow-hidden rounded bg-slate-100">
                    {landscapeImageUrl ? (
                       <img src={landscapeImageUrl} alt="Real Landscape" className="w-full h-full object-cover" />
                    ) : (
                       <div className="flex items-center justify-center h-full text-slate-400 text-xs">{t.noLandscape}</div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>AI Generated Landscape</span>
                    </div>
                 </div>
                 
                 {/* Map Buttons */}
                 <div className="mt-3 grid grid-cols-2 gap-2">
                    <a 
                      href={kakaoMapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 rounded bg-[#FEE500] text-black text-xs font-bold hover:brightness-95 transition-all"
                    >
                      <Map className="w-3 h-3" />
                      {t.kakaoMap}
                    </a>
                    <a 
                      href={naverMapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 rounded bg-[#03C75A] text-white text-xs font-bold hover:brightness-95 transition-all"
                    >
                      <Map className="w-3 h-3" />
                      {t.naverMap}
                    </a>
                 </div>
                 <p className="text-center text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">
                   {t.landscapeLabel}
                 </p>
              </div>
              
              <div className="flex gap-4">
                 <button 
                    onClick={() => window.print()}
                    className="flex-1 py-3 px-4 bg-white border-2 border-slate-900 rounded-none font-bold text-slate-900 hover:bg-yellow-400 hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition-all active:translate-y-1 active:shadow-none">
                    <Download className="w-4 h-4" />
                    {t.posterSave} (PDF)
                 </button>
                 <button 
                    onClick={onReset}
                    className="flex-1 py-3 px-4 bg-slate-900 border-2 border-slate-900 text-white rounded-none font-bold hover:bg-slate-800 hover:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] flex items-center justify-center gap-2 transition-all active:translate-y-1 active:shadow-none">
                    <Share2 className="w-4 h-4" />
                    {t.newProject}
                 </button>
              </div>
            </div>

            {/* 3. Details Section (Right/Bottom) */}
            <div className="space-y-8 pt-4">
              
              {/* Social Share Bar (Added) */}
              <div className="bg-slate-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.shareTitle}</span>
                 <div className="flex gap-3">
                    <button onClick={() => handleShare('instagram')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-600 hover:scale-110 transition-transform" title="Instagram">
                       <Instagram className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleShare('whatsapp')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-500 hover:scale-110 transition-transform" title="WhatsApp">
                       <div className="w-5 h-5 border-2 border-green-500 rounded-full flex items-center justify-center text-[10px] font-bold">W</div>
                    </button>
                     <button onClick={() => handleShare('twitter')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-black hover:scale-110 transition-transform" title="X (Twitter)">
                       <Twitter className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleShare('facebook')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 hover:scale-110 transition-transform" title="Facebook">
                       <Facebook className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleShare('native')} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center shadow-sm text-white hover:scale-110 transition-transform" title="More">
                       <Share2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              {/* History Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-slate-900">
                <div className="flex items-center gap-2 mb-3 text-slate-900">
                  <BookOpen className="w-6 h-6" />
                  <h3 className="font-bold text-xl">{t.historyFact}</h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm md:text-base font-medium">
                  {textData.history}
                </p>
              </div>

              {/* Planning Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-400">
                <div className="flex items-center gap-2 mb-3 text-slate-900">
                  <Film className="w-6 h-6" />
                  <h3 className="font-bold text-xl">{t.contentPlan}</h3>
                </div>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-1">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">{t.type}</span>
                        <p className="font-bold text-slate-900 bg-slate-100 inline-block px-2 py-1 rounded">{textData.contentType}</p>
                    </div>
                    <div className="flex-1">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">{t.target}</span>
                        <p className="font-bold text-slate-900 bg-slate-100 inline-block px-2 py-1 rounded">{textData.targetAudience}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">{t.synopsis}</span>
                    <p className="text-slate-700 text-sm leading-relaxed border-t border-slate-100 pt-2">{textData.plot}</p>
                  </div>
                </div>
              </div>

              {/* Empathy/Healing Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HeartHandshake className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-2 mb-3 text-rose-500 relative z-10">
                  <HeartHandshake className="w-6 h-6" />
                  <h3 className="font-bold text-xl">{t.toYou}</h3>
                </div>
                <div className="relative z-10">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-rose-200/50 -z-10 transform -scale-x-100" />
                  <p className="text-slate-800 font-serif italic leading-relaxed text-lg pl-2">
                    "{textData.consolationMessage}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 relative z-10">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.effect}</span>
                  <p className="text-sm text-slate-600 mt-1 font-medium">{textData.effect}</p>
                </div>
              </div>

              {/* Nearby Info Section */}
              {nearbyInfo && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                   <h3 className="font-bold text-xl mb-4 text-slate-900 flex items-center gap-2">
                      <Map className="w-6 h-6 text-blue-500" />
                      {t.nearbyTitle}
                   </h3>
                   
                   <div className="space-y-6">
                      {/* Restaurants */}
                      <div>
                         <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Coffee className="w-4 h-4" /> {t.restaurants}
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {nearbyInfo.restaurants.map((place, i) => renderPlaceCard(place, 'food'))}
                         </div>
                      </div>

                      {/* Accommodations */}
                      <div>
                         <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <BedDouble className="w-4 h-4" /> {t.accommodations}
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {nearbyInfo.accommodations.map((place, i) => renderPlaceCard(place, 'sleep'))}
                         </div>
                      </div>

                      {/* Attractions */}
                      <div>
                         <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Tent className="w-4 h-4" /> {t.attractions}
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {nearbyInfo.attractions.map((place, i) => renderPlaceCard(place, 'fun'))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Dietary Options Section (New) */}
              <div className="bg-emerald-50 rounded-xl p-6 shadow-sm border border-emerald-100">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-xl text-emerald-900 flex items-center gap-2">
                     <Utensils className="w-6 h-6" />
                     {t.dietaryTitle}
                   </h3>
                 </div>

                 {!dietaryPlaces ? (
                   <button
                     onClick={onLoadDietary}
                     disabled={isDietaryLoading}
                     className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {isDietaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Utensils className="w-4 h-4" />}
                     {isDietaryLoading ? t.dietaryLoading : t.findDietary}
                   </button>
                 ) : (
                   <div className="space-y-6 fade-in">
                     {dietaryPlaces.vegan.length === 0 && dietaryPlaces.halal.length === 0 && dietaryPlaces.kosher.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm py-4">{t.noOptionsFound}</p>
                     ) : (
                        <>
                          {renderDietaryList(dietaryPlaces.vegan, <Leaf className="w-4 h-4 text-green-600" />, t.vegan)}
                          {renderDietaryList(dietaryPlaces.halal, <CheckCircle className="w-4 h-4 text-blue-600" />, t.halal)}
                          {renderDietaryList(dietaryPlaces.kosher, <Star className="w-4 h-4 text-orange-600" />, t.kosher)}
                        </>
                     )}
                   </div>
                 )}
              </div>

            </div>
          </div>
      </div>
    </div>
  );
};

export default ResultView;
