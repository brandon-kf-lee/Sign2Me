import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white bg-center bg-cover bg-no-repeat" style={{ backgroundImage: "url('/images/aura-bg.png')" }}>
      
      {/* Nav Bar */}
      <nav className="bg-gray-100/60 backdrop-blur-md text-black">
  <div className="max-w-6xl mx-auto px-8 md:px-16 py-4 flex items-center justify-between">
    <span className="font-logo font-bold text-xl">Sign2Me</span>
    <ul className="flex gap-6 font-semibold text-sm uppercase">
      <li><Link to="/">Home</Link></li>
      <li><Link to="/learn">Learn</Link></li>
      <li><Link to="/practice">Practice</Link></li>
      <li><Link to="/profile">Profile</Link></li>
    </ul>
  </div>
</nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mt-20 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Text Column */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-8xl font-black text-black font-logo">Sign2Me</h1>
          <h2 className="mt-6 text-xl font-bold text-gray-800">LEARN WITH AI-POWERED ASL</h2>
          <p className="mt-4 text-gray-700 max-w-xl mx-auto md:mx-0">
            Learning American Sign Language (ASL) should be accessible to everyone.
            Our web app makes it easy to learn, practice, and build confidence using
            real-time AI feedback. Whether you're a beginner or brushing up on your
            skills, we’re here to support inclusive communication.
          </p>
          <Link to="/learn">
            <button className="mt-8 px-6 py-3 bg-black text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition">
              START LEARNING
            </button>
          </Link>
        </div>

        {/* Image Column */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src="/images/hands-hero.png"
            alt="ASL Hero Hands"
            className="max-w-lg w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
