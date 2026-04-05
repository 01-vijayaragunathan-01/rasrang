import { Scale } from "lucide-react";

export default function ContentPolicy() {
  return (
    <div className="min-h-screen bg-[#13072E] text-white px-6 py-32 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#E31E6E]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-2xl relative z-10">
        
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8">
            <div className="p-3 rounded-xl bg-[#E31E6E]/10 border border-[#E31E6E]/30">
                <Scale className="w-8 h-8 text-[#E31E6E]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Content <span className="text-[#E31E6E] italic">Policy</span>
            </h1>
        </div>

        <p className="text-white/70 leading-relaxed mb-8 text-lg">
          This platform celebrates the diverse talents, contributors, and the vibrant spirit of our college cultural fest. We expect all digital interactions to reflect these values.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. User Profiles & Registrations</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          Any user-submitted text—including profile bios, team names, or event registration details—must be appropriate for a university environment. The use of vulgar, offensive, discriminatory, or harassing language will result in immediate account suspension and ticket cancellation.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. Intellectual Property (For Event Admins)</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          Platform Administrators and Event Coordinators are responsible for the media they upload. Event posters, background images, and descriptions must not violate copyright laws. Ensure your respective departments possess the rights to use uploaded visual assets.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Representation</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          The "Architects" (Contributors) page utilizes images and names for recognition purposes only. If you wish to have your name, image, or role removed or updated on the public directory, please contact the Technical Team.
        </p>

      </div>
    </div>
  );
}
