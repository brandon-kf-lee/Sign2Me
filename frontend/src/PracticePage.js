// IMPORTS
import React, { useState } from "react";
import { Link } from "react-router-dom";

function PracticePage() {
  const [currentLetter, setCurrentLetter] = useState("A");
  const [result, setResult] = useState("correct"); // for now, hardcoded

  const getRandomLetter = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet[randomIndex];
  };
  

  return (
    <div
      className="min-h-screen bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/images/aura-practice.png')" }}
    >
      {/* Nav Bar */}
      <nav className="w-full bg-gray-100/60 backdrop-blur-md text-black">
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-4 flex items-center justify-between">
          <span className="font-logo font-bold text-xl">Sign2Me</span>
          <ul className="flex gap-6 font-semibold text-sm uppercase">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/learn">Learn</Link></li>
            <li><Link to="/practice">Practice</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
      </nav>

      {/* Page Content */}
      <div className="px-8 py-16">
        {/* Header Section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl font-logo font-bold text-gray-900 mb-4">Practice</h1>
          <div className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase">Practice Your Signage Skills</h2>
            <p className="text-gray-700 leading-relaxed">
              Put your knowledge into action! Use your webcam and hand tracking to practice signing letters and basic ASL words in real time. Get instant visual feedback and improve your accuracy with every try. Whether you're just starting out or brushing up, this space is all about learning through doing—one sign at a time.
            </p>
          </div>
        </section>

        {/* Practice Section */}
        <section className="max-w-4xl mx-auto bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign the following: {currentLetter}
          </h2>

          {/* Webcam placeholder */}
          <div className="relative border-4 border-purple-400 rounded-xl overflow-hidden">
            {/* Add actual webcam canvas feed here */}
            <img
              src="/images/sample-sign.png"
              alt="Webcam feed"
              className="w-full h-auto"
            />

            {/* Result popup */}
            <div className="absolute bottom-4 right-4">
              <div
                className={`bg-white p-3 rounded-xl shadow-md border-2 ${
                  result === "correct" ? "border-green-400" : "border-red-400"
                }`}
              >
                <p
                  className={`font-bold text-sm ${
                    result === "correct" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result === "correct" ? "CORRECT" : "INCORRECT"}
                </p>
                <button
                    className="mt-2 px-4 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-semibold"
                    onClick={() => setCurrentLetter(getRandomLetter())}
                >
                    NEXT
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PracticePage;
