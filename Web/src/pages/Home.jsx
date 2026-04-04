import About from "./home/About"
import Hero from "./home/Hero"
import PastEvents from "./home/PastEvents"

// FestivalBackground is intentionally NOT here anymore.
// It lives in App.jsx so it sits above all z-index layers correctly.
const Home = () => {
    return (
        <div className="relative w-full bg-transparent">
            <Hero />
            <div className="relative z-10 bg-transparent">
                <About />
                <PastEvents />
            </div>
        </div>
    )
}

export default Home