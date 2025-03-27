import React from "react";
import paw from "../assets/paw_vector.png";
import mainimage from "../assets/mainsection2.jpg";
import "../Styles/Fonts/Fonts.css";
import Buttons from "../Components/Buttons/Buttons.jsx";
import s1 from "../assets/Surgery.png";
import s2 from "../assets/OPD_Treatments.jpg";
import s3 from "../assets/Vet_lab.jpg";
import s4 from "../assets/Mobile_service.jpeg";
import Cards from "../Components/Cards/Cards.jsx";

function Home() {

    const service = [
        { name: "Surgery", image: s1},
        { name: "OPD Treatments", image: s2},
        { name: "Vet Laboratory", image: s3},
        { name: "Mobile Service", image: s4},
        ];

  return (

    
    <section id="home">
      {/* <!-- Main home section --> */}
      <div className="container mx-auto px-4 relative bg-gradient-to-b from-[#028478] via-[#46dfd0] to-[#70ded3] text-white py-12">
        <div className="flex flex-wrap ml-24">
          <div className="w-full lg:w-7/12 mb-8 lg:mb-0">
            <h1 className="text-[#22292F] text-5xl Fredoka1">
              Sharing <span className="text-red-500">Love</span> with
              compassionate care for every pet's health and
              <h1 className=" text-gray-900 pt-3 text-7xl Monoton text-center">
                {" "}
                happiness.{" "}
              </h1>
              
            </h1>
            <h3 className="text-[#ffffff]text-1xl pt-3 font-bold w-1/2">
              When you choose the veterinarians at 4paws Veterinary Clinic to be
              your pet care partner, you can be assured your pet is receiving
              the most advanced veterinary care from experienced pet care
              providers.
            </h3>
        

            <Buttons
              label="Make an Appointment"
              css="bg-[#22292F] text-white px-4 py-2 rounded-lg mt-5 Poppins cursor-pointer hover:bg-[#343b41] hover:shadow-[5px_5px_15px_rgba(0,0,0,0.3)] hover:font-bold"
            />
          </div>
          <div className="w-full lg:w-5/12 flex justify-center items-center">
            <img src={paw} alt="paw" className="w-16 h-16 opacity-50" />
            <img
              src={mainimage}
              alt="Dog1"
              className="w-80 shadow-[5px_5px_15px_rgba(0,0,0,0.3)] rounded-lg"
            />
            <img src={paw} alt="paw" className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </div>

      {/* <!-- Our services section --> */}
      <div>
        <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-[#70ded3] via-[#8bd9d1] to-[#b7e0dc] ">
          <div className="flex flex-col items-center pt-10 pb-20 rounded-2xl shadow-[5px_5px_15px_rgba(0,0,0,0.3)] bg-gradient-to-b from-[#d7e6e4] via-[#7fe1d8] to-[#d7e6e4]">
          <h1 className="text-[#22292F] text-5xl Fredoka1 text-center pt-10 pb-10 font-bold">
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
