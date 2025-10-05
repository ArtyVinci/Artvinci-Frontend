import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Users, TrendingUp, Palette, ArrowRight, Star } from 'lucide-react';
import { Button } from '../../components/common';

const Home = () => {
  const features = [
    {
      icon: Palette,
      title: 'Discover Unique Art',
      description: 'Explore a curated collection of artworks from talented artists worldwide.'
    },
    {
      icon: Users,
      title: 'Connect with Artists',
      description: 'Follow your favorite artists and stay updated with their latest creations.'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Collection',
      description: 'Build your personal art collection and support emerging artists.'
    },
    {
      icon: Sparkles,
      title: 'Seamless Experience',
      description: 'Easy-to-use platform with secure transactions and fast delivery.'
    }
  ];

  const featuredArtists = [
    { id: 1, name: 'Sarah Chen', specialty: 'Digital Art', followers: '12.5K' },
    { id: 2, name: 'Marcus Rivera', specialty: 'Oil Painting', followers: '8.2K' },
    { id: 3, name: 'Amara Johnson', specialty: 'Sculpture', followers: '15.1K' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="container-custom relative z-10 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#2d2a27]/80 backdrop-blur-sm rounded-full mb-8 shadow-lg border border-[#e8e7e5] dark:border-[#4a4642]"
              >
                <Sparkles className="w-4 h-4 text-[#6d2842] dark:text-[#d4a343]" />
                <span className="text-sm font-medium text-[#5d5955] dark:text-[#c4bfb9]">
                  Join 10,000+ Artists & Collectors
                </span>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-8 leading-tight">
                <span className="block text-[#2d2a27] dark:text-[#fafaf9]">Where Art Meets</span>
                <span className="block bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent mt-2">Technology</span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-[#5d5955] dark:text-[#c4bfb9] mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                Discover, collect, and celebrate extraordinary art from talented creators around the globe
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/gallery">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654] text-white font-semibold rounded-xl shadow-lg shadow-[#6d2842]/30 hover:shadow-xl hover:shadow-[#6d2842]/40 transition-all min-w-[240px]"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Explore Gallery</span>
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-[#2d2a27] border-2 border-[#6d2842] dark:border-[#d4a343] text-[#6d2842] dark:text-[#d4a343] hover:bg-[#6d2842] dark:hover:bg-[#d4a343] hover:text-white dark:hover:text-[#2d2a27] font-semibold rounded-xl transition-all min-w-[240px]"
                  >
                    <Palette className="w-5 h-5" />
                    <span>Join as Artist</span>
                  </motion.button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-[#5d5955] dark:text-[#c4bfb9]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6d2842] to-[#a64d6d] border-2 border-white dark:border-[#2d2a27]"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b8862f] to-[#d4a343] border-2 border-white dark:border-[#2d2a27]"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#508978] to-[#70a596] border-2 border-white dark:border-[#2d2a27]"></div>
                  </div>
                  <span className="font-medium">50K+ Artworks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#6d2842] dark:text-[#d4a343]" />
                  <span className="font-medium">150+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#b8862f] dark:text-[#d4a343]" />
                  <span className="font-medium">Trending Platform</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#6d2842]/20 dark:bg-[#6d2842]/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-[#b8862f]/20 dark:bg-[#b8862f]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-[#508978]/20 dark:bg-[#508978]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fafaf9] dark:to-[#1a1816] pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-[#fafaf9] to-white dark:from-[#1a1816] dark:to-[#2d2a27]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent">Why Choose Artvinci?</span>
            </h2>
            <p className="text-lg text-[#5d5955] dark:text-[#c4bfb9] max-w-2xl mx-auto">
              Experience the perfect blend of creativity and technology in the digital art marketplace
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642] rounded-3xl p-8 text-center group hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#6d2842]/10 dark:hover:shadow-[#d4a343]/10 transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-[#6d2842]/30">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#2d2a27] dark:text-[#fafaf9]">
                  {feature.title}
                </h3>
                <p className="text-[#5d5955] dark:text-[#c4bfb9]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-20 bg-white dark:bg-[#2d2a27]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent">Featured Artists</span>
            </h2>
            <p className="text-lg text-[#5d5955] dark:text-[#c4bfb9]">
              Meet some of our talented creators
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/artist/${artist.id}`}>
                  <div className="bg-white dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-2xl overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-[#6d2842]/10 dark:hover:shadow-[#d4a343]/10 transition-all duration-300">
                    <div className="aspect-square bg-gradient-to-br from-[#6d2842] to-[#a64d6d] flex items-center justify-center text-white text-6xl font-bold">
                      {artist.name.charAt(0)}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-[#2d2a27] dark:text-[#fafaf9]">
                        {artist.name}
                      </h3>
                      <p className="text-[#5d5955] dark:text-[#c4bfb9] mb-3">
                        {artist.specialty}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[#9b9791] dark:text-[#6d6762]">
                        <Star className="w-4 h-4 fill-[#d4a343] text-[#d4a343]" />
                        <span>{artist.followers} followers</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/artists">
              <Button variant="outline" size="lg" icon={ArrowRight} iconPosition="right">
                View All Artists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-[#6d2842] via-[#8b3654] to-[#a64d6d] text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#d4a343] rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Ready to Start Your Art Journey?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-95 font-light">
              Join thousands of art lovers and creators on Artvinci today
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-[#6d2842] hover:bg-[#fafaf9] hover:shadow-2xl font-semibold rounded-xl transition-all min-w-[200px]"
                >
                  Get Started Free
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#6d2842] font-semibold rounded-xl transition-all min-w-[200px]"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
