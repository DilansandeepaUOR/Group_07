import React from "react";
import { Link } from "react-router-dom";
import paw from "../assets/paw_vector.png";
import mainimage from "../assets/mainsection4.png";
import "../Styles/Fonts/Fonts.css";
import Buttons from "../Components/Buttons/Buttons.jsx";
import s1 from "../assets/Surgery.png";
import s2 from "../assets/OPD_Treatments.jpg";
import s3 from "../assets/Vet_lab.jpg";
import s4 from "../assets/Mobile_service.jpeg";
import Cards from "../Components/Cards/Cards.jsx";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";

function Home() {
  const service = [
    { name: "Surgery", image: s1 },
    { name: "OPD Treatments", image: s2 },
    { name: "Vet Laboratory", image: s3 },
    { name: "Mobile Service", image: s4 },
  ];

  return (
    <section id="home">
      <Navbar />
      {/* Main Home Section */}
      <div className="container mx-auto px-6 py-16 bg-gradient-to-b from-[#22292F] via-[#71C9CE] to-[#A6E3E9] text-white relative">
        <div className="flex flex-wrap items-center justify-center">
          {/* Text Section */}
          <div className="w-full lg:w-7/12 mb-8 lg:mb-0">
            <h1 className="text-5xl font-bold text-[#FFD700] leading-tight Fredoka1">
              Sharing <span className="text-red-500">Love</span> with
              compassionate
              <br />
              care for every pet’s health and
            </h1>
            <h1 className="text-4xl font-extrabold text-[#fff] mt-2 Poppins md:text-8xl">
              Happiness.
            </h1>

            <p className="text-lg text-gray-200 mt-4 w-3/4">
              When you choose 4Paws Veterinary Clinic, you ensure advanced
              <br />
              veterinary care from experienced pet care providers.
              <br />
              {/* Appointment Button */}
              <Link to="/Appointment">
                <Buttons
                  label="Make an Appointment"
                  css="bg-[#FFD700] text-[#22292F] px-6 py-3 rounded-lg mt-6 font-bold shadow-md transition duration-300 hover:bg-[#E6C200] hover:shadow-lg Poppins cursor-pointer transform hover:scale-105"
                />
              </Link>
            </p>
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

        {/* Our Services Section */}
        <div>
          <div className="flex flex-col items-center pt-10 pb-20]">
            <h2 className="text-5xl font-bold text-center text-[#028478] mb-12 pt-10">
              Our services
            </h2>
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

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 pb-20 bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#22292F]">
        <div className="flex flex-col items-center pt-10 pb-20]">
          <div />
          <h2 className="text-4xl font-bold text-center text-[#028478] p-10">
            What Pet Owners Say
          </h2>

          <img
            src={paw}
            alt="paw"
            className="absolute justify-center w-16 h-16 opacity-50"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The care my dog received was exceptional. The staff truly loves animals!",
                author: "Sarah J.",
                pet: "Golden Retriever Owner",
              },
              {
                quote:
                  "Emergency service saved my cat's life. Forever grateful to 4Paws!",
                author: "Michael T.",
                pet: "Cat Owner",
              },
              {
                quote:
                  "Professional and compassionate care every time we visit. Highly recommend!",
                author: "Emily R.",
                pet: "Multiple Pet Owner",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-[#FFD700]"
              >
                <p className="text-gray-600 italic mb-4">
                  "{testimonial.quote}"
                </p>
                <p className="font-bold text-[#028478]">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.pet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

export default Home;
