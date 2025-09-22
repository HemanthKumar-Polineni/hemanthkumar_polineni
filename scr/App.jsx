import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Copy, Download, ExternalLink, Sparkles, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

const API_KEYS = {
  UNSPLASH: '1pkbjCSFTJQMfkA9mnDpWyVEifuTMUtDvOcyT8Yng34',
  PIXABAY: '52415389-bf7da4b65454ecf19dfad7419',
  PEXELS: 'EQKoa9YpnJalElaMzWF2nRZCyrHmOMzkbQOyed6gUwU9NlxgfT92YGs9',
  FREEPIK: 'FPSX124047104eb3567a8dee3a6a04a76451'
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('unsplash');
  const { toast } = useToast();

  const providers = [
    { id: 'unsplash', name: 'Unsplash', color: 'from-green-400 to-blue-500' },
    { id: 'pixabay', name: 'Pixabay', color: 'from-yellow-400 to-orange-500' },
    { id: 'pexels', name: 'Pexels', color: 'from-purple-400 to-pink-500' },
    { id: 'freepik', name: 'Freepik', color: 'from-red-400 to-pink-500' }
  ];

  const searchUnsplash = async () => {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=12`, {
      headers: {
        Authorization: `Client-ID ${API_KEYS.UNSPLASH}`
      }
    });
    if (!response.ok) throw new Error('Unsplash API request failed');
    const data = await response.json();
    return data.results.map(img => ({
      id: img.id,
      url: img.urls.regular,
      alt: img.alt_description || searchTerm,
      photographer: img.user.name,
      originalUrl: img.links.html,
      source: 'Unsplash'
    }));
  };

  const searchPixabay = async () => {
    const response = await fetch(`https://pixabay.com/api/?key=${API_KEYS.PIXABAY}&q=${encodeURIComponent(searchTerm)}&per_page=12`);
    if (!response.ok) throw new Error('Pixabay API request failed');
    const data = await response.json();
    return data.hits.map(img => ({
      id: img.id,
      url: img.webformatURL,
      alt: img.tags || searchTerm,
      photographer: img.user,
      originalUrl: img.pageURL,
      source: 'Pixabay'
    }));
  };

  const searchPexels = async () => {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${searchTerm}&per_page=12`, {
      headers: {
        Authorization: API_KEYS.PEXELS
      }
    });
    if (!response.ok) throw new Error('Pexels API request failed');
    const data = await response.json();
    return data.photos.map(img => ({
      id: img.id,
      url: img.src.large,
      alt: img.alt || searchTerm,
      photographer: img.photographer,
      originalUrl: img.url,
      source: 'Pexels'
    }));
  };

  const searchFreepik = async () => {
    const response = await fetch(`https://api.freepik.com/v1/resources?locale=en-US&page=1&limit=12&term=${searchTerm}`, {
        headers: {
            'x-freepik-api-key': API_KEYS.FREEPIK,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Freepik API request failed');
    const data = await response.json();
    if (!data.data) return [];
    return data.data.map(item => ({
        id: item.id,
        url: item.images.large,
        alt: item.title || searchTerm,
        photographer: item.author.name,
        originalUrl: item.url,
        source: 'Freepik'
    }));
  };

  const searchImages = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a search term to find images",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setImages([]);

    try {
      let results = [];
      switch (selectedProvider) {
        case 'unsplash':
          results = await searchUnsplash();
          break;
        case 'pixabay':
          results = await searchPixabay();
          break;
        case 'pexels':
          results = await searchPexels();
          break;
        case 'freepik':
          results = await searchFreepik();
          break;
        default:
          throw new Error('Invalid provider selected');
      }
      setImages(results);
      toast({
        title: "Images loaded!",
        description: `Found ${results.length} images for "${searchTerm}"`
      });
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error fetching images",
        description: "Could not fetch images. Please check the API key or try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyImageCode = (image) => {
    const code = `<img src="${image.url}" alt="${image.alt}" />`;
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied!", description: "HTML code has been copied to your clipboard" });
  };

  const copyReactCode = (image) => {
    const code = `<img src="${image.url}" alt="${image.alt}" className="w-full h-auto rounded-lg" />`;
    navigator.clipboard.writeText(code);
    toast({ title: "React code copied!", description: "JSX code has been copied to your clipboard" });
  };
  
  const copyUrl = (image) => {
    navigator.clipboard.writeText(image.url);
    toast({ title: "URL Copied!", description: "Image URL has been copied to your clipboard." });
  };

  const downloadImage = (image) => {
    toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });
  };

  const openOriginal = (image) => {
    window.open(image.originalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>Image Library Search - Find Perfect Images</title>
        <meta name="description" content="Search and find free images from multiple libraries including Unsplash, Pixabay, Pexels, and Freepik. Get ready-to-use HTML and React code instantly." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Image Library Search
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find perfect free images from multiple libraries and get ready-to-use code instantly
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedProvider === provider.id
                      ? `bg-gradient-to-r ${provider.color} text-white shadow-lg scale-105`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                    placeholder="Enter your search term (e.g., nature, technology, business)"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={searchImages}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : (
                    'Search Images'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {images.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Found {images.length} images for "{searchTerm}"
                </h2>
                <div className="text-sm text-gray-400">
                  Source: {providers.find(p => p.id === selectedProvider)?.name}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-4">
                      <p className="text-sm text-gray-300 mb-3 truncate">
                        By {image.photographer}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => copyImageCode(image)} size="sm" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30">
                          <Copy className="w-3 h-3 mr-1" /> HTML
                        </Button>
                        <Button onClick={() => copyReactCode(image)} size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30">
                          <Copy className="w-3 h-3 mr-1" /> React
                        </Button>
                        <Button onClick={() => copyUrl(image)} size="sm" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30">
                          <Link className="w-3 h-3 mr-1" /> URL
                        </Button>
                        <Button onClick={() => openOriginal(image)} size="sm" className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30">
                          <ExternalLink className="w-3 h-3 mr-1" /> Original
                        </Button>
                      </div>
                       <div className="mt-2">
                         <Button onClick={() => downloadImage(image)} size="sm" className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30">
                          <Download className="w-3 h-3 mr-1" /> Download
                        </Button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && images.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to find amazing images?
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Enter a search term above and select your preferred image library to get started
              </p>
            </motion.div>
          )}
        </div>
        
        <Toaster />
      </div>
    </>
  );
}

export default App;