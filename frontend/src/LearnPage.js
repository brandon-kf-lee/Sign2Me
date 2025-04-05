import React from "react";
import { Link } from "react-router-dom";

function LearnPage() {
    const aslLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
    return (
        <div
        className="min-h-screen bg-center bg-cover bg-no-repeat px-8 pt-0 pb-20"
        style={{ backgroundImage: "url('/images/aura-learn.png')" }}
        >

       
        {/* Nav Bar */}
        <nav className="w-full bg-gray-100/60 backdrop-blur-md text-black">
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
        
        {/* Header Section */}
        <section className="max-w-4xl mx-auto text-left mb-12 pt-12">
          <h1 className="text-5xl font-logo font-bold text-gray-900 mb-4">Learn</h1>
          <div className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase">Let’s Learn American Sign Language!</h2>
            <p className="text-gray-700 leading-relaxed">
              American Sign Language (ASL) is a complete, natural language used by the Deaf and hard of hearing community in the United States and parts of Canada. Instead of spoken words, ASL uses hand shapes, facial expressions, and body movements to communicate. It has its own grammar, sentence structure, and rich cultural history—making it more than just a way to “translate” English into gestures.
            </p>
          </div>
        </section>
  
        {/* ASL Grid Section */}
        <section className="max-w-4xl mx-auto grid grid-cols-5 gap-6">
          {aslLetters.map((letter) => (
            <div
              key={letter}
              className="relative bg-white bg-opacity-60 rounded-xl shadow-md p-4 hover:scale-105 transition transform cursor-pointer group"
            >
              <img
                src={`/asl/${letter}.png`}
                alt={`ASL ${letter}`}
                className="w-full h-auto mb-2"
              />
              {/* Letter overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-4xl font-bold">{letter}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }
  
  export default LearnPage;
  