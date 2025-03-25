import React from "react";
import paw from "../assets/paw_vector.png";
import mainimage from "../assets/mainsection2.jpg";
import "../Styles/Home.css";
import Buttons from "../Components/Buttons/Buttons.jsx";


function Home() {
return (
    <section
        id="home"
        className="relative bg-gradient-to-b from-[#028478] via-[#25dfcd] to-[#028478] text-white py-12"
    >
        <img
            src={paw}
            alt="paw"
            className="absolute top-0 left-0 w-16 h-16 opacity-50"
        />
        <div className="container mx-auto px-4">
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
                    <h3
                        className="text-[#ffffff]text-1xl pt-3 font-bold w-1/2"
                    >
                        When you choose the veterinarians at 4paws Veterinary Clinic to be
                        your pet care partner, you can be assured your pet is receiving
                        the most advanced veterinary care from experienced pet care
                        providers.
                    </h3>

                    <Buttons label="Make an Appointment" css="bg-[#22292F] text-white px-4 py-2 rounded-lg"/>
                </div>
                <div
                    className="w-full lg:w-5/12 flex justify-center items-center"
                >
                    <img src={paw} alt="paw" className="w-16 h-16 opacity-50" />
                    <img src={mainimage} alt="Dog1" className="w-80 border-4 border-gray-300 shadow-lg rounded-lg" />
                    <img src={paw} alt="paw" className="w-16 h-16 opacity-50" />
                </div>
            </div>
        </div>
    </section>
);
}

export default Home;
