import { motion } from 'framer-motion';
import { Palette, Heart, Globe, Users, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Art',
      description: 'We believe art enriches lives and connects communities across the globe.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting artists and collectors from every corner of the world.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building a supportive ecosystem where creativity thrives.'
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Using technology to make art more accessible and enjoyable.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Artists' },
    { number: '50K+', label: 'Artworks' },
    { number: '100K+', label: 'Users' },
    { number: '150+', label: 'Countries' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633]">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Palette className="w-12 h-12 text-[#6d2842] dark:text-[#d4a343]" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent">About Artvinci</span>
            </h1>
            <p className="text-xl text-[#5d5955] dark:text-[#c4bfb9] max-w-2xl mx-auto">
              We're on a mission to democratize art by creating a global platform that connects
              talented artists with passionate collectors and art enthusiasts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-[#2d2a27]">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-[#5d5955] dark:text-[#c4bfb9] font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-[#f5f5f3] dark:bg-[#1a1816]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-[#5d5955] dark:text-[#c4bfb9] text-left">
                <p>
                  Artvinci was born from a simple belief: art should be accessible to everyone, everywhere.
                  We saw talented artists struggling to reach their audience and art lovers searching for
                  unique pieces without a central, trustworthy platform.
                </p>
                <p>
                  In 2024, we set out to change that. By combining cutting-edge technology with a deep
                  appreciation for creativity, we built a platform that serves both artists and collectors.
                  Our glassmorphism design and smooth user experience reflect our commitment to elegance
                  and innovation.
                </p>
                <p>
                  Today, Artvinci is more than just a marketplace—it's a global community where creativity
                  meets opportunity, where art transcends borders, and where everyone can be part of the
                  artistic journey.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-[#2d2a27]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent mb-4">
              Our Values
            </h2>
            <p className="text-lg text-[#5d5955] dark:text-[#c4bfb9] max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#1a1816] border border-[#e8e7e5] dark:border-[#4a4642] rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-[#6d2842]/10 dark:hover:shadow-[#d4a343]/10 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#6d2842] to-[#a64d6d] rounded-2xl flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#2d2a27] dark:text-[#fafaf9]">
                  {value.title}
                </h3>
                <p className="text-[#5d5955] dark:text-[#c4bfb9]">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-[#6d2842] via-[#8b3654] to-[#a64d6d] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#d4a343] rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Target className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-display font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-xl mb-8 opacity-95">
              To empower artists worldwide by providing them with the tools, platform, and community
              they need to share their work, connect with audiences, and build sustainable creative careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-[#6d2842] hover:bg-[#fafaf9] hover:shadow-2xl font-semibold rounded-xl transition-all min-w-[200px]"
                >
                  Join as Artist
                </motion.button>
              </Link>
              <Link to="/gallery">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#6d2842] font-semibold rounded-xl transition-all min-w-[200px]"
                >
                  Explore Gallery
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
