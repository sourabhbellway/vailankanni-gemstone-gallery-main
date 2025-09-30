import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserProfile } from "@/lib/api/userController";

const Profile = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<any | null>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("va_user_token");
    if (!token) {
      window.location.href = "/signin";
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching profile with token:", token);
      const data = await getUserProfile(token);
      // console.log("Profile API response:", data);
      setProfile(data)
     
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
        setError("Request timed out. Please check your internet connection and try again.");
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError("Session expired or unauthorized. Please sign in again.");
        localStorage.removeItem("va_user_token");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        const serverMsg = err?.response?.data?.message;
        setError(serverMsg || err?.message || "Failed to load profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen font-serif bg-gray-50">
        <div className=" mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-[#084526] mb-8">Your Profile</h1>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#084526]"></div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-red-100 text-red-700 border border-red-300">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={fetchProfile}
                  className="ml-4 px-4 py-2 bg-[#084526] text-white rounded hover:bg-[#0a5a2e] transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {profile && (
            <div className="flex gap-8">
              {/* Left Sidebar - Profile Section */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  {/* Profile Picture Section */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <button className="absolute bottom-0 right-0 bg-[#084526] text-white p-2 rounded-full hover:bg-[#0a5a2e] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 uppercase">
                      {profile.data.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      { profile?.data.user_code}
                    </p>
                  </div>

                  {/* Profile Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Profile Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">User Code</label>
                        <p className="text-gray-800 font-semibold">
                          {profile?.data.user_code ?? "-"}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-gray-800 font-semibold">
                          {profile?.data.name ?? "-"}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <p className="text-gray-800 font-semibold">
                          {profile?.data.email ?? "-"}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                        <p className="text-gray-800 font-semibold">
                          {profile?.data.mobile ?? "-"}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Account Status</label>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile?.data.status 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {profile?.data.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Login</label>
                        <p className="text-gray-800 font-semibold text-xs">
                          {profile?.data.last_login_at ?? "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

           
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;



