import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion
import paw from "../assets/paw_vector.png";
import "../Styles/Fonts/Fonts.css";
import "../Styles/Home/Home.css";
import Buttons from "../Components/Buttons/Buttons.jsx";
import s1 from "../assets/Surgery.png";
import s2 from "../assets/OPD_Treatments.jpg";
import s3 from "../assets/Vet_lab.jpg";
import s4 from "../assets/Mobile_service.jpeg";
import Cards from "../Components/Cards/Cards.jsx";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const floatVariants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function Home() {
  const service = [
    { name: "Surgery", image: s1 },
    { name: "OPD Treatments", image: s2 },
    { name: "Vet Laboratory", image: s3 },
    { name: "Mobile Service", image: s4 },
  ];

  return (
    <motion.section 
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      
      {/* Main Home Section */}
      <div className="container max-w-full bg-gradient-to-b from-[#22292F] via-[#71C9CE] to-[#A6E3E9] text-white relative">
        {/* Background image*/}
        <div className="bgimage">
          <div className="bgopacity">
            {/* Text Section */}
            <motion.div 
              className="w-full lg:w-7/12 mb-8 lg:mb-0 items-center lg:items-start text-center lg:text-left px-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="text-5xl font-bold text-[#028478] Fredoka1"
                variants={itemVariants}
              >
                Sharing <span className="text-red-500">Love</span> with
                compassionate care for every pet’s health and
              </motion.h1>

              <motion.h1 
                className="text-4xl font-extrabold text-gray-200 mt-2 Poppins lg:text-9xl"
                variants={itemVariants}
              >
                Happiness.
              </motion.h1>

              <motion.p 
                className="text-lg text-[ffffff] text-center my-10"
                variants={itemVariants}
              >
                When you choose 4Paws Veterinary Clinic, you ensure advanced
                <br />
                veterinary care from experienced pet care providers.
                <br />
                {/* Appointment Button */}
                <Link to="/appointmentlanding">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Buttons
                      label="Make an Appointment"
                      css="bg-[#028478] text-[#ffffff] px-6 py-3 rounded-lg mt-6 font-bold shadow-md transition duration-300 hover:bg-[#71C9CE] hover:text-[#000000] hover:shadow-lg Poppins cursor-pointer"
                    />
                  </motion.div>
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Subtle paw graphic */}
        <motion.img
          src={paw}
          alt="paw"
          className="absolute bottom-0 right-0 w-24 opacity-30 transform rotate-45"
          variants={floatVariants}
          animate="float"
        />
        
        <div className="bg-gradient-to-b from-[#71C9CE] via-[#028478] to-[#22292F]">
          {/* Our Services Section */}
          <div className="overflow-hidden">
            <div className="flex flex-col items-center py-10">
              <motion.h2 
                className="text-5xl font-bold text-center text-[#22292F] mb-12 pt-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
              >
                Our services
              </motion.h2>
              <motion.img
                src={paw}
                alt="paw"
                className="absolute justify-center w-16 h-16 opacity-50"
                animate={{
                  rotate: [0, 20, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <div className="flex flex-wrap justify-center gap-12 pt-10">
                {service.map((item, index) => (
                  <motion.div
                    key={index}
                    className="shadow-[5px_5px_15px_rgba(0,0,0,0.3)] rounded-lg w-70 h-80 flex flex-col items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -10,
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                    }}
                  >
                    <Cards name={item.name} image={item.image} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Testimonials Section */}
          <div className="py-50 px-10">
            {/* Section Header */}
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-200 mb-4">
                Wisdom from Veterinarians
              </h2>
            </motion.div>

            {/* Testimonial Cards */}
            <div className="container mx-auto px-4">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Dr. Jane Goodall */}
                <motion.div 
                  className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#028478] border-l-4 border-transparent"
                  variants={itemVariants}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.15)"
                  }}
                >
                  <p className="text-gray-600 italic mb-4">
                    "The least I can do is speak for those who cannot speak for
                    themselves."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-[#028478] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      JG
                    </div>
                    <div>
                      <p className="font-bold text-[#028478]">
                        Dr. Jane Goodall
                      </p>
                      <p className="text-sm text-gray-500">
                        Primatologist & Animal Rights Advocate
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Dr. James Herriot */}
                <motion.div 
                  className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#028478] border-l-4 border-transparent"
                  variants={itemVariants}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.15)"
                  }}
                >
                  <p className="text-gray-600 italic mb-4">
                    "If having a soul means being able to feel love and loyalty,
                    then animals are better off than a lot of humans."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-[#028478] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      JH
                    </div>
                    <div>
                      <p className="font-bold text-[#028478]">
                        Dr. James Herriot
                      </p>
                      <p className="text-sm text-gray-500">
                        Author of <em>All Creatures Great and Small</em>
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Dr. Marty Becker */}
                <motion.div 
                  className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#028478] border-l-4 border-transparent"
                  variants={itemVariants}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.15)"
                  }}
                >
                  <p className="text-gray-600 italic mb-4">
                    "Pets are not our whole life, but they make our lives
                    whole."
                  </p>
                  <div className="flex items-center">
                    <div className="bg-[#028478] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      MB
                    </div>
                    <div>
                      <p className="font-bold text-[#028478]">
                        Dr. Marty Becker
                      </p>
                      <p className="text-sm text-gray-500">
                        "America's Veterinarian"
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </motion.section>
  );
}

export default Home;