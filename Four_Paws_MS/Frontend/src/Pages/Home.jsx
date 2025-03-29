import React from "react";
import paw from "../assets/paw_vector.png";
import mainimage from "../assets/mainsection4.png";
import "../Styles/Fonts/Fonts.css";
import Buttons from "../Components/Buttons/Buttons.jsx";
import s1 from "../assets/Surgery.png";
import s2 from "../assets/OPD_Treatments.jpg";
import s3 from "../assets/Vet_lab.jpg";
import s4 from "../assets/Mobile_service.jpeg";
import Cards from "../Components/Cards/Cards.jsx";

function Home() {
  const service = [
    { name: "Surgery", image: s1 },
    { name: "OPD Treatments", image: s2 },
    { name: "Vet Laboratory", image: s3 },
    { name: "Mobile Service", image: s4 },
  ];

  return (
    <section id="home">
      {/* Main Home Section */}
      <div className="container mx-auto px-6 py-16 bg-gradient-to-b from-[#22292F] via-[#028478] to-[#46dfd0] text-white relative">
        <div className="flex flex-wrap items-center justify-between">
          {/* Text Section */}
          <div className="w-full lg:w-7/12 mb-8 lg:mb-0">
            <h1 className="text-5xl font-bold text-[#FFD700] leading-tight Fredoka1">
              Sharing <span className="text-red-500">Love</span> with
              compassionate care for every pet’s health and
            </h1>
            <h1 className="text-4xl font-extrabold text-[#fff] mt-2 Poppins md:text-8xl">
              Happiness.
            </h1>

            <p className="text-lg text-gray-200 mt-4 w-3/4">
              When you choose 4Paws Veterinary Clinic, you ensure advanced
              veterinary care from experienced pet care providers.
            </p>
            {/* Appointment Button */}
            <Buttons
              label="Make an Appointment"
              css="bg-[#FFD700] text-[#22292F] px-6 py-3 rounded-lg mt-6 font-bold shadow-md transition duration-300 hover:bg-[#E6C200] hover:shadow-lg Poppins cursor-pointer transform hover:scale-105"
            />
          </div>
          {/* Image Section */}
                <div className="hidden absolute top-0 right-0 justify-center items-center xl:flex">
                <img
                  src={mainimage}
                  alt="Main Dog Image"
                  className="w-96 lg:w-150 transform transition duration-300 hover:scale-105"
                />
                </div>

                <div className="top-0 right-0 justify-center items-center xl:hidden">
                <img
                  src={mainimage}
                  alt="Main Dog Image"
                  className="w-96 lg:w-150 transform transition duration-300 hover:scale-105"
                />
                </div>

              </div>

              {/* Subtle paw graphic */}
        <img
          src={paw}
          alt="paw"
          className="absolute bottom-0 right-0 w-24 opacity-30 transform rotate-45"
        />
      </div>

      {/* Our Services Section */}
      <div>
        <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-[#22292F] via-[#333F48] to-[#555E64]">
          <div className="flex flex-col items-center pt-10 pb-20 rounded-2xl shadow-[5px_5px_15px_rgba(0,0,0,0.3)] bg-gradient-to-b from-[#22292F] via-[#333F48] to-[#555E64]">
            <h1 className="text-[#FFD700] text-5xl Fredoka1 text-center pt-10 pb-10 font-bold">
              Our Services
            </h1>
            <img
              src={paw}
              alt="paw"
              className="absolute justify-center w-16 h-16 opacity-50"
            />
            <div className="flex flex-wrap justify-center gap-12 pt-10">
              {service.map((item) => (
                <div className="shadow-[5px_5px_15px_rgba(0,0,0,0.3)] rounded-lg w-70 h-80 flex flex-col items-center justify-center">
                  <Cards name={item.name} image={item.image} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
