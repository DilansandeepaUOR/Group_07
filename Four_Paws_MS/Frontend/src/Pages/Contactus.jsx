import React from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock,FaExclamationCircle } from "react-icons/fa";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Contactus() {
  const [ formdata, setFormdata ] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "Feedback",
    message: "",
  });

  const [ error, setError ] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormdata({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formdata.name ||
      !formdata.email ||
      !formdata.phone ||
      !formdata.reason ||
      !formdata.message
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/contact/sendmail",
        formdata
      );
      alert(res.data.message);
      if (res.data.message === "Email sent successfully") {
        navigate(0);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Backend error response:", error.response.data);
      } else {
        alert("Error: Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#22292F] via-[#028478] to-[#22292F]">
        {/* Heading Section */}
        <div className="relative py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#A6E3E9] mb-4">
              Get in Touch with Four Paws Clinic
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Compassionate care for your beloved pets since 2021
            </p>
          </div>
        </div>
        {/* Contact Container */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[#028478] mb-6">
                Send Us a Message
              </h2>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                    <p className="flex items-center gap-2">
                      <FaExclamationCircle /> {error}
                    </p>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="name"
                    className="block font-bold text-[#22292F] mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formdata.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
                    placeholder="Enter Your Full Name"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#22292F] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formdata.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#22292F] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formdata.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
                    placeholder="07x xxx xxxx"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#22292F] mb-2">
                    Reason
                  </label>
                  <select
                    name="reason"
                    id="reason"
                    value={formdata.reason}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
                  >
                    <option value="Feedback" className="bg-[#182020]">
                      Feedback
                    </option>
                    <option value="Contact" className="bg-[#182020]">
                      Contact a veterinary
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#22292F] mb-2">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formdata.message}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#46dfd0] rounded-lg text-white bg-[#182020] focus:ring-2 focus:ring-[#028478]"
                    placeholder="How is our pet service?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#028478] text-white rounded-lg font-bold hover:bg-[#5ba29c] transition-colors cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="flex space-y-8 justify-center items-center">
              {/* Contact Cards */}
              <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9]  rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-[#028478] mb-4">
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-[#028478] text-xl mt-1 mr-4" />
                    <div>
                      <h4 className="font-semibold text-[#22292F]">
                        Our Address
                      </h4>
                      <p className="text-gray-600">
                        526/A, Colombo Rd, Rathnapura, Sri Lanka
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaPhone className="text-[#028478] text-xl mt-1 mr-4" />
                    <div>
                      <h4 className="font-semibold text-[#22292F]">
                        Phone Numbers
                      </h4>
                      <p className="text-gray-600">Main: +94 760999899</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaEnvelope className="text-[#028478] text-xl mt-1 mr-4" />
                    <div>
                      <h4 className="font-semibold text-[#22292F]">Email</h4>
                      <p className="text-gray-600">4pawslk@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaClock className="text-[#028478] text-xl mt-1 mr-4" />
                    <div>
                      <h4 className="font-semibold text-[#22292F]">Hours</h4>
                      <p className="text-gray-600">
                        Mon-Sat: 10:00 AM - 1:00 PM | 4:30 PM - 9:00 PM
                      </p>
                      <p className="text-gray-600">Sun: 10:00 AM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="col-span-1 lg:col-span-2 justify-center pt-10 lg:mt-0">
              <div className="bg-gradient-to-b from-[#A6E3E9] via-[#71C9CE] to-[#A6E3E9] pb-20 rounded-xl shadow-lg overflow-hidden">
                <h1 className="text-2xl text-center font-bold text-[#028478] mb-4 p-4">
                  Find Our Location Here
                </h1>
                <iframe
                  title="Clinic Location"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d22232.011599211222!2d80.39036452148139!3d6.707258117235436!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3bfb4389b8111%3A0x441aad614d721434!2s4%20Paws%20Animal%20Clinic%20%26%20Surgery!5e1!3m2!1sen!2sus!4v1744398329797!5m2!1sen!2sus"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-b-xl"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contactus;
