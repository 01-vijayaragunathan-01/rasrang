import RetroFilmRoll from "./components/RetroFilmRoll";

const preCultureData = [
  {
    id: 1,
    title: "Vintage Jam '19",
    image_url:
      "https://images.unsplash.com/photo-1514525253361-bee8a4874a73?q=80&w=600",
    frame_number: 124,
  },
  {
    id: 2,
    title: "The First Mic",
    image_url:
      "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=600",
    frame_number: 248,
  },
  {
    id: 3,
    title: "Retro Dance-off",
    image_url:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600",
    frame_number: 372,
  },
  {
    id: 4,
    title: "Behind the Curtains",
    image_url:
      "https://images.unsplash.com/photo-1503095396549-807039045349?q=80&w=600",
    frame_number: 496,
  },
  {
    id: 5,
    title: "Cultural Heritage",
    image_url:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600",
    frame_number: 620,
  },
];

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <header className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-4 font-mono">Rasrang Festival</h1>
        <p className="text-xl text-gray-400">Scroll down to explore our pre-culture events</p>
      </header>

      {/* Hero spacing */}
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl animate-bounce">Keep Scrolling ↓</p>
      </div>

      <RetroFilmRoll events={preCultureData} />
      
      {/* Footer spacing */}
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <h2 className="text-3xl font-mono">More events coming soon...</h2>
      </div>
    </div>
  );
}

export default App;
