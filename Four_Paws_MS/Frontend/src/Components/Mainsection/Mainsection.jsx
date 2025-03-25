import React from "react";
import "../../Styles/Mainsection/Mainsection.css";

function Mainsection() {
return (
    <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[#028478] via-[#25dfcd] to-[#028478] h-[90vh]">
        <div className="flex flex-row items-center justify-between w-full px-8">
            <div className="flex flex-col items-start justify-center ml-[100px]">
                <h1 className="text-[#22292F] font-Poppins text-[36px]">
                    Sharing <h1>Love</h1> With Our
                </h1>
                <h1>Care</h1>
                <h2 className="text-[#22292F] font-Poppins text-[24px]">
                    When you choose the veterinarians at 4paws Veterinary Clinic to be
                    your pet care partner, you can be assured your pet is receiving the
                    most advanced veterinary care from experienced pet care providers.
                </h2>
                <button>Make an Appointment</button>
            </div>
            <div className="flex items-center justify-center">
                image
            </div>
        </div>
    </div>
);
}

export default Mainsection;
