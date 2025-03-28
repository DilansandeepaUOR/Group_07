import React from "react";
import "../../Styles/Fonts/Fonts.css";
import logo from "../../assets/logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaHome,
  FaPhone,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className=" bg-[#22292F] text-neutral-200 lg:text-left">
      <div className="flex items-center justify-center border-b-2 border-neutral-500 p-6 lg:justify-between">
        <div className="mr-12 hidden lg:block">
          <span>Get connected with us on social networks:</span>
        </div>

        {/* <!-- Social network icons container --> */}
        <div className="flex justify-center ">
          <div className=" mr-6 text-neutral-200 hover:text-[#69cac2]">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>
          </div>

          <div className="mr-6 text-neutral-200 hover:text-[#69cac2]">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
          </div>

          <div className="mr-6 text-neutral-200 hover:text-[#69cac2]">
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
          </div>

          <div className="mr-6 text-neutral-200 hover:text-[#69cac2]">
            <a
              href="https://www.gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-6 py-10 text-center border-b-2 p-6 border-neutral-500 md:text-left">
        <div className=" grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* <!-- 4paws logo section --> */}
          <div className="">
            <h6 className="mb-4 flex justify-center font-semibold uppercase md:justify-start Poppins">
              Our business
            </h6>
            <div className="">
              <a href="">
                <img
                  src={logo}
                  alt="4paws logo"
                  className="w-[150px] object-cover mb-5"
                />
              </a>
            </div>
            <p>
              4Paws Animal Hospital is dedicated to providing compassionate care
              and advanced veterinary services for your beloved pets.
            </p>
          </div>

          {/* <!-- Products section --> */}
          <div className="">
            <h6 className="mb-6 flex justify-center font-semibold uppercase md:justify-start Poppins">
              Our Products
            </h6>

            <p className="mb-4 hover:text-[#69cac2]">
              <a className="text-neutral-200">Pharmacy items</a>
            </p>
            <p className="mb-4 hover:text-[#69cac2]">
              <a className="text-neutral-200">Pets</a>
            </p>
            <p className="mb-4 hover:text-[#69cac2]">
              <a className="text-neutral-200">Pet accessories</a>
            </p>
          </div>

          {/* <!-- Find us section --> */}
          <div className="">
            <h6 className="mb-6 flex justify-center font-semibold uppercase md:justify-start Poppins">
              Find us
            </h6>
            <p className="mb-4 hover:text-[#69cac2]">
              <a className="text-neutral-200">Facebook</a>
            </p>
            <p className="mb-4 hover:text-[#69cac2]">
              <a className="text-neutral-200">Instagram</a>
            </p>
            <p className="mb-4 hover:text-[#69cac2]">
              <a className="text-neutral-200">Twitter</a>
            </p>
          </div>

          {/* <!-- Contact section --> */}
          <div>
            <h6 className="mb-6 flex justify-center font-semibold uppercase md:justify-start Poppins">
              Contact
            </h6>
            <p className="mb-4 flex items-center justify-center md:justify-start">
              <div className="mr-3 h-5 w-5">
                <FaHome />
              </div>
              526/A, Colombo Rd, Rathnapura
            </p>
            <p className="mb-4 flex items-center justify-center md:justify-start">
              <div className="mr-3 h-5 w-5">
                <FaEnvelope />
              </div>
              4pawslk@gmail.com
            </p>
            <p className="mb-4 flex items-center justify-center md:justify-start">
              <div className="mr-3 h-5 w-5">
                <FaPhone />
              </div>
              +94 760999899
            </p>
          </div>
        </div>
      </div>

      {/* <!--Copyright section--> */}
      <div className=" p-6 text-center">
        <span>© 2025 Copyright: </span>
        <a
          className="font-semibold text-neutral-600 dark:text-neutral-400"
          href="https://4paws.lk/"
        >
          4Paws.lk
        </a>
      </div>
    </footer>
  );
}

export default Footer;
