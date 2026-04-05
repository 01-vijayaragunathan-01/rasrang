import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#13072E] text-white px-6 py-32 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C53099]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E4BD8D]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl relative z-10">
        
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8">
            <div className="p-3 rounded-xl bg-[#E4BD8D]/10 border border-[#E4BD8D]/30">
                <Shield className="w-8 h-8 text-[#E4BD8D]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Privacy <span className="text-[#E4BD8D] italic">Policy</span>
            </h1>
        </div>

        <p className="text-white/70 leading-relaxed mb-8 text-lg">
          We respect your privacy and are committed to protecting your personal data while providing a seamless digital experience for RasRang '26.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. Google User Data & Authentication</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          Our platform utilizes Google OAuth for secure user authentication. We only request and store your basic profile information—specifically your <strong>Name, Email Address, and Profile Picture</strong>—to construct your digital Bio-Metric Vault (User Profile). We do not have access to your passwords or any private Google account data.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. Ticketing & Event Data</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          Your registration data is used solely for generating secure entry passes (QR Codes), managing event capacities, and sending crucial festival updates. We do not sell, rent, or trade your email address or phone number to third-party marketers.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Data Retention & Deletion</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          You maintain full ownership of your data. You have the absolute right to request the deletion of your account, profile data, and event registrations at any time. To initiate a data deletion request, please contact our technical team via the official portal.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">4. Security</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          We implement industry-standard security measures, including encrypted JWT sessions and CSRF protection, to prevent unauthorized access, alteration, or destruction of your personal information.
        </p>

      </div>
    </div>
  );
}
