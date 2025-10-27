import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import PuzzleRoom from '../components/PuzzleRoom';

const About = () => {
  const [revealedFacts, setRevealedFacts] = useState([]);
  
  const handlePuzzleProgress = (facts) => {
    setRevealedFacts(facts);
  };

  return (
    <section className="flex flex-col md:flex-row min-h-screen w-full bg-gray-900">
      {/* 3D Puzzle Room Section */}
      <div className="w-full md:w-3/5 h-[70vh] md:h-screen relative">
        <Canvas shadows dpr={[1, 2]} className="h-full w-full">
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault fov={60} />
            <ambientLight intensity={0.1} color="#8b754c" />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={0.2} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
              color="#e8c98a"
            />
            <spotLight
              position={[-10, 10, 5]}
              angle={0.15}
              penumbra={1}
              intensity={0.1}
              castShadow
              color="#e8c98a"
            />
            
            <PuzzleRoom onPuzzleProgress={handlePuzzleProgress} />
            
            <ContactShadows 
              opacity={0.6} 
              scale={10} 
              blur={1} 
              far={10} 
              resolution={256} 
              color="#000000" 
            />
          </Suspense>
        </Canvas>
        
        {/* Mobile Controls Overlay */}
        <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-2 z-10">
          <div className="bg-black bg-opacity-70 p-4 rounded-full text-amber-200 text-center">
            <p>Use arrows to move</p>
            <p className="text-xs mt-1">Tap and drag to look around</p>
          </div>
        </div>
        
        {/* Instructions Overlay */}
        <div className="fixed top-20 left-4 right-4 md:top-4 md:right-auto md:left-4 bg-black bg-opacity-70 p-3 rounded-lg text-sm pointer-events-none z-10 text-amber-200 border border-amber-900/50">
          <p className="font-medium">Use WASD keys to move, click and drag to look around</p>
          <p className="text-xs mt-1">Click on puzzle stations to solve them and reveal facts</p>
        </div>
      </div>
      
      {/* About Me Information Section */}
      <div className="w-full md:w-2/5 p-4 md:p-8 bg-gray-900 overflow-y-auto text-amber-100">
        <h1 className="text-3xl md:text-4xl font-bold font-poppins text-amber-300 mb-4 md:mb-6">The Mystery Room</h1>
        
        <p className="text-base md:text-lg text-amber-100 mb-4 md:mb-6">
          Welcome to my mysterious puzzle chamber! Explore the dark room, find the puzzle stations, and solve them to uncover hidden knowledge about me.
        </p>
        
        {revealedFacts.length > 0 ? (
          <div className="mt-4 md:mt-8">
            <h2 className="text-xl md:text-2xl font-semibold font-poppins text-amber-300 mb-3 md:mb-4">Discovered Knowledge:</h2>
            <ul className="space-y-3 md:space-y-4">
              {revealedFacts.map((fact, index) => (
                <li 
                  key={index} 
                  className="p-3 md:p-4 bg-gray-800 rounded-lg shadow-amber-900/20 shadow-lg border-l-4 border-amber-700 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-amber-100">{fact}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 md:mt-8 p-4 md:p-6 bg-gray-800 rounded-lg text-center border border-amber-900/30">
            <p className="text-amber-400 italic">The secrets remain hidden... solve the puzzles to reveal them.</p>
          </div>
        )}
        
        {revealedFacts.length >= 10 && (
          <div className="mt-4 md:mt-8 p-4 md:p-6 bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
            <h3 className="text-lg md:text-xl font-semibold text-amber-300 mb-2">Remarkable Progress!</h3>
            <p className="text-amber-100">You're unveiling the mysteries of my character. Continue your quest to discover all there is to know!</p>
          </div>
        )}
        
        {revealedFacts.length === 15 && (
          <div className="mt-4 md:mt-8 p-4 md:p-6 bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
            <h3 className="text-lg md:text-xl font-semibold text-purple-300 mb-2">The Chamber's Secrets are Yours!</h3>
            <p className="text-purple-100">You've mastered all puzzles and uncovered every secret about me. Your journey of discovery is complete!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;