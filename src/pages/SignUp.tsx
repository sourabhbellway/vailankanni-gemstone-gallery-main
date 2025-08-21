import React from "react";
import logo from "@/assets/logo.jpg";
import signinImg from "@/assets/signin.png";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SignUp = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center font-serif ">
        <div className="bg-white flex w-full overflow-hidden">
          {/* Left Image */}
          <div className="hidden md:block w-1/2 bg-gray-100">
            <img src={signinImg} alt="Sign Up" className="object-cover w-full h-full" />
          </div>
          {/* Right Form */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <div className="flex justify-center gap-2 items-center mb-8">
              <img src={logo} alt="Vailankanni Logo" className="h-12 w-12 rounded mb-2" />
              <div className="flex flex-col justify-center">
                <span className="text-[#084526] text-xl font-bold">Vailankanni</span>
                <span className="text-xs text-[#8e6e00] uppercase tracking-widest">Jewellers</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-[#084526]">Sign Up</h2>
            <div className="text-sm mb-6">
              Already Have An Account? <a href="/signin" className="text-[#eab308] ml-1">Sign In</a>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input type="text" placeholder="e.g. John Doe" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#084526]" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email Address</label>
                <input type="email" placeholder="e.g. john@email.com" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#084526]" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Mobile Number</label>
                <input type="text" placeholder="e.g. +91 985 652 0198" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#084526]" required />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded mt-4 font-semibold hover:bg-[#222] transition">Get OTP</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUp; 