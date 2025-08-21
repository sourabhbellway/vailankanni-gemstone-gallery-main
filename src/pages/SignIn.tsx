import React from "react";
import logo from "@/assets/logo.jpg";
import signinImg from "@/assets/signin.png";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const SignIn = () => {
  const [showOtp, setShowOtp] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [timer, setTimer] = React.useState(60);

  React.useEffect(() => {
    if (showOtp && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [showOtp, timer]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOtp(true);
    setTimer(60);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle OTP verification here
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center font-serif">
        <div className="bg-white flex w-full overflow-hidden">
          {/* Left Image */}
          <div className="hidden md:block w-1/2 bg-gray-100">
            <img src={signinImg} alt="Sign In" className="object-cover w-full h-full" />
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
            <h2 className="text-3xl font-bold mb-2 text-[#084526]">Sign In</h2>
            <div className="text-sm mb-6">
              Don't Have An Account? <a href="/signup" className="text-[#eab308] ml-1">Sign Up</a>
            </div>
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input type="text" placeholder="e.g. John Doe" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#084526]" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Mobile Number</label>
                <input type="text" placeholder="e.g. +91 985 652 0198" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#084526]" required />
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded mt-4 font-semibold hover:bg-[#222] transition">Get OTP</button>
            </form>
          </div>
        </div>
        <Dialog open={showOtp} onOpenChange={setShowOtp}>
          <DialogContent className="max-w-xl p-8 font-serif">
            <form onSubmit={handleOtpSubmit} className="flex flex-col items-center">
              <h2 className="text-2xl font-bold my-2 text-center">Enter Your OTP</h2>
              <div className="text-sm text-center my-4">Please Enter Your 4-Digit Verification Code We Sent To<br /><span className="font-semibold">+91******3198</span></div>
              <InputOTP maxLength={4} value={otp} onChange={setOtp} className="mb-4 ">
                <InputOTPGroup>
                  {[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
              </InputOTP>
              <div className="text-xs text-gray-500 my-4">Didn't Get The Code? Resend in 0:{timer.toString().padStart(2, '0')}</div>
              <button type="submit" className="w-fit px-10 bg-black text-white py-2 font-semibold hover:bg-[#222] transition">Submit</button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default SignIn; 