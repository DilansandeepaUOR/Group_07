import React from "react";
import "../../Styles/Mainsection/Mainsection.css";
import mainimage from "../../assets/Untitled-2.png";

function Mainsection() {
return (
    <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[#028478] via-[#25dfcd] to-[#028478] h-[100vh]">
        <div className="flex flex-row items-center justify-between w-full px-8">
            <div className="flex flex-col items-start justify-center ml-[100px] w-1/2 mt-0">
                <h1 className="text-[#22292F] font-Poppins text-6xl Fredoka1">
                    Sharing <span className="text-red-500">Love</span> With Our
                </h1>
                <h1 className="Monoton text-[#22292F] text-8xl pt-3">Care</h1>
                <p className="text-[#ffffff] font-Poppins text-1xl Fredoka pt-3 font-bold">
                    When you choose the veterinarians at 4paws Veterinary Clinic to be
                    your pet care partner, you can be assured your pet is receiving the
                    most advanced veterinary care from experienced pet care providers.
                </p>
                <button className="Poppins pt-15">Make an Appointment</button>
            </div>
            <div className="flex items-center justify-center w-1/2">
                <img src={mainimage} alt="" />
            </div>
        </div>
    </div>
);
}

export default Mainsection;
