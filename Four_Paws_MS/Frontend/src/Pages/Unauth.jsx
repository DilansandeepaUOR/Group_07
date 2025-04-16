import React from "react";
import dog from "../assets/angry_dog.jpg";
import { useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { Link } from "react-router-dom";

function Unauth() {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

return (
    <div
        className="min-h-screen flex flex-col items-center justify-center text-white p-4"
        style={{
            backgroundImage: `url(${dog})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "rgba(0,0,0, 0.7)",
            backgroundBlendMode: "overlay",
        }}
    >
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center max-w-2xl w-full">
                <h1 className="text-4xl font-extrabold text-red-600 mb-2 animate-pulse">
                    401 - Unauthorized
                </h1>
                <p className="text-lg mb-4 text-gray-800">
                    Oops! Your authorization failed.
                </p>

                <div className="flex justify-center">
                    <Link to={"/"}>
                    <button
                        onClick={handleBackHome}
                        className="mt-6 px-6 py-2 bg-[#028478] text-white font-semibold rounded-full shadow-md hover:scale-105 transition-all duration-300 ease-in-out flex items-center gap-2"
                    >
                        <AiFillHome />
                        Back to Home
                    </button>
                    </Link>
            </div>
        </div>
    </div>
);
}

export default Unauth;
