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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-pastel-gradient overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
                Where Art Meets
                <span className="block gradient-text">Technology</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                Discover, collect, and celebrate extraordinary art from talented creators around the globe
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/gallery">
                  <Button size="lg" icon={Sparkles}>
                    Explore Gallery
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" size="lg" icon={Palette}>
                    Join as Artist
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              Why Choose Artvinci?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
                className="card-elegant p-8 text-center group hover:scale-105"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
              Featured Artists
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
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
                  <div className="card-elegant overflow-hidden group cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-6xl font-bold">
                      {artist.name.charAt(0)}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        {artist.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {artist.specialty}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Start Your Art Journey?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Join thousands of art lovers and creators on Artvinci today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
