import React from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiAward, FiShield, FiSmile } from 'react-icons/fi';

const AnimatedFeatures = () => {
  const features = [
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Designer Frames",
      description: "Curated luxury eyewear collection",
      color: "bg-red-600"
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Premium Lenses",
      description: "High-index & anti-reflective coating",
      color: "bg-red-600"
    },
    {
      icon: <FiShoppingBag className="w-8 h-8" />,
      title: "Personal Styling",
      description: "Expert style consultation",
      color: "bg-red-600"
    },
    {
      icon: <FiSmile className="w-8 h-8" />,
      title: "Perfect Fit",
      description: "Professional fitting service",
      color: "bg-red-600"
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-black via-black to-zinc-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-red-500 to-white bg-clip-text text-transparent">
            The Opera Experience
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 mx-auto"></div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-xl border border-zinc-800 shadow-lg hover:shadow-red-900/20 transition-all duration-300">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="text-red-600 mb-6 group-hover:text-white transition-colors duration-300"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-500 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-white">
              Luxury Eyewear for the <span className="text-red-500">Discerning</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Experience the perfect blend of style and functionality with our premium eyewear collection. Each piece is carefully selected to ensure the highest quality and most sophisticated designs.
            </p>
            <ul className="space-y-4">
              {[
                "Handcrafted designer frames",
                "Premium lens technology",
                "Lifetime maintenance",
                "Expert style consultation"
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center text-zinc-300"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { value: "2500+", label: "Unique Designs" },
              { value: "100%", label: "UV Protection" },
              { value: "30+", label: "Premium Brands" },
              { value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-lg border border-zinc-800"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="block text-3xl font-bold text-red-500 mb-2"
                >
                  {stat.value}
                </motion.span>
                <span className="text-zinc-400 text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedFeatures; 