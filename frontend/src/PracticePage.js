import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function PracticePage() {
  const videoRef = useRef(null);
  const [currentLetter, setCurrentLetter] = useState("A");
  const [result, setResult] = useState(""); // correct, incorrect, or ""
  const [predictedSign, setPredictedSign] = useState("...");
  const [geminiFeedback, setGeminiFeedback] = useState("Great form! Keep your hand steady.");
  const [feedbackLocked, setFeedbackLocked] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  

  const getRandomLetter = () => {
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXY";
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet[randomIndex];
  };

  // Send normalised landmark data to backend to receive prediction
  const processPrediction = async (normalized) => {
    try {
      if (!isLocked) {
        const response = await fetch("https://sign2me-production.up.railway.app/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ landmarks: normalized, target: currentLetter }),
        });

        const prediction = await response.json();

        if (!isLocked && prediction.sign && !feedbackLocked) {
          setPredictedSign(prediction.sign);
        
          if (prediction.feedback) {
            setGeminiFeedback(prediction.feedback);
            setFeedbackLocked(true);
        
            // Unlock after 10 seconds
            setTimeout(() => {
              setFeedbackLocked(false);
            }, 10000);
          }
        }
      } 
    }
    catch (err) {
        console.error("Prediction error:", err);
      }
  };

  // Check if prediction is correct
  useEffect(() => {
    if(isLocked) return; // Prevent running after locked

    if (predictedSign === currentLetter) {
      setIsLocked(true);
      setResult("correct");
      setGeminiFeedback("✅ Great job! That's the right sign.");
      setPredictedSign(predictedSign); // freeze correct value

    } else if (!feedbackLocked) {
      setResult("incorrect");
      setGeminiFeedback("🤔 Try adjusting your fingers and try again.");
    }
  }, [predictedSign, currentLetter, isLocked]);

  // Use MediaPipe to record landmarks, normalise data
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
      if (isLocked) return; // Prevent updating while locked

      const landmarks = results.multiHandLandmarks[0];
      const wrist = landmarks[0];
      const normalized = landmarks.flatMap((lm) => [
        lm.x - wrist.x,
        lm.y - wrist.y
      ]);

      processPrediction(normalized);
    });

    let camera;
    if (videoRef.current) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
    
    // Cleanup when component unmounts
    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, []);

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
        <section className="max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl font-logo font-bold text-gray-900 mb-4">Practice</h1>
          <div className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase">Practice Your Signage Skills</h2>
            <p className="text-gray-700 leading-relaxed">
              Put your knowledge into action! Use your webcam and hand tracking to practice signing letters and basic ASL words in real time. Get instant visual feedback and improve your accuracy with every try.
            </p>
          </div>
        </section>

        {/* Practice Section */}
        <section className="max-w-4xl mx-auto bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Sign the following: {currentLetter}
          </h2>

          <div className="relative border-4 border-purple-400 rounded-xl overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-xl transform scale-x-[-1]" />

            {/* Gemini Feedback Popup (top-left) */}
            <div className="absolute top-4 left-4">
              <div className="bg-white p-3 rounded-xl shadow-md border-2 border-blue-400 w-64">
                <p className="font-bold text-sm text-blue-600">Gemini Feedback</p>
                <p className="text-xs text-gray-700 mt-1">{geminiFeedback}</p>
              </div>
            </div>

            {/* Prediction Box (bottom-right) */}
            <div className="absolute bottom-4 right-4">
              <div className={`bg-white p-3 rounded-xl shadow-md border-2 ${
                result === "correct"
                  ? "border-green-400"
                  : result === "incorrect"
                  ? "border-red-400"
                  : "border-gray-300"
              }`}>
                <p className="font-bold text-sm text-black">
                  Predicted: {predictedSign}
                </p>

                {/* Only show NEXT if correct */}
                {isLocked && (
                  <button
                    className="mt-2 px-4 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-semibold"
                    onClick={() => {
                      setCurrentLetter(getRandomLetter());
                      setIsLocked(false);
                      setResult("");
                      setGeminiFeedback("Great form! Keep your hand steady.");
                    }}
                  >
                    NEXT
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PracticePage;
