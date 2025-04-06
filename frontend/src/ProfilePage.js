import { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { useNavigate, Link } from "react-router-dom";

function ProfilePage() {
  const { username, setUsername } = useContext(UserContext);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (input.trim()) {
      setUsername(input);
      navigate("/learn"); // or wherever you want to send them next
    }
  };

  return (
    <div
    className="min-h-screen bg-cover bg-center text-black"
    style={{ backgroundImage: "url('/images/aura-bg.png')" }}
    >
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

      {/* Profile Content */}
      <div className="p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold mb-4">Welcome{username ? `, ${username}` : ""}!</h1>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your username"
          className="border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-xs"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
