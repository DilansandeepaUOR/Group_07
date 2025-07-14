import React from "react";
import { FaSyringe, FaFlask, FaAmbulance, FaUserMd } from "react-icons/fa";
import { motion } from "framer-motion"; // Import Framer Motion
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import s1 from "../assets/Surgery.png";
import s2 from "../assets/OPD_Treatments.jpg";
import s3 from "../assets/Vet_lab.jpg";
import s4 from "../assets/Mobile_service.jpeg";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

const floatVariants = {
  float: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function Ourservices() {
  const services = [
    {
      icon: <FaUserMd className="text-4xl text-[#ffffff]" />,
      title: "Surgery",
      description:
        "Our surgical facility is completely furnished with modern equipment, patient monitoring, and skilled personnel.Other than in an emergency, all other surgeries are scheduled in advance. You can call our hotline to find out whether there are any open appointments. Every surgery is performed at a reasonable cost.",
      image: s1,
    },
    {
      icon: <FaSyringe className="text-4xl text-[#ffffff]" />,
      title: "OPD Treatments",
      description:
        "Your pet’s health is our main priority, and we want to give you outstanding service. Our hospital offers a broad variety of general, surgical, and specialist care to deliver the finest possible medical care. All of our doctors and supporting staff are animal lovers who treat pets with the kindness and respect they merit.",
      image: s2,
    },
    {
      icon: <FaFlask className="text-4xl text-[#ffffff]" />,
      title: "Vet Laboratory",
      description:
        "Our clients will benefit from having all of their laboratory testing completed in one location, saving them time and travel expenses. All samples are handled carefully and examined by qualified technical staff. Our lab can test all the animals for hematology, dermatology, clinical chemistry, UFR, and other laboratory tests.",
      image: s3,
    },
    {
      icon: <FaAmbulance className="text-4xl text-[#ffffff]" />,
      title: "Mobile Service",
      description:
        "Is it tough for you to take your pet to the veterinarian? With our mobile veterinary service, the vet treats your pet while visiting your home. Don’t forget to mention your pet’s behavior when scheduling an appointment; this will enable us to serve you more effectively and efficiently. Call our customer service line between the hours of 8 am and 5 pm to schedule your mobile appointment.",
      image: s4,
    },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F]">
        {/* Heading Section */}
        <motion.div 
          className="relative py-20 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-[#A6E3E9] mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Our Services at Four Paws Veterinary Clinic
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-200 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Compassionate care for your beloved pets since 2021
            </motion.p>
          </div>
        </motion.div>
        
        {/* Services Grid */}
        <motion.div 
          className="container mx-auto px-4 py-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.03,
                  boxShadow: "0 20px 30px rgba(0,0,0,0.2)"
                }}
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${service.image})` }}
                ></div>
                <div className="p-6">
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#028478] bg-opacity-10 mx-auto"
                    variants={floatVariants}
                    animate="float"
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-center text-[#028478] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  );
}

export default Ourservices;