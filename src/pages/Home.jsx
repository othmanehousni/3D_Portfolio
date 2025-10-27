import React, { useState } from 'react'
import { Suspense } from 'react'
import Loader from '../components/Loader'
import { Canvas } from '@react-three/fiber'
import Island from '../models/Island'
import { Sky } from '@react-three/drei'
import Bird from '../models/Bird'
import Plane from '../models/Plane'
import HomeInfo from '../components/HomeInfo'

const Home = () => {
  const [isRotating, setIsRotating] = useState(false)
  const [currentStage, setCurrentStage] = useState(1)


  const adjustIslandForScreenSize = () => {
   
    let screenScale = null
    let screenPosition = [-1.281, -0.401, 1.779]
    let rotation=[0.1, -0.185, -0.01]
    if(window.innerWidth < 768){
      screenScale = [0.3, 0.3, 0.3]
    } else {
      screenScale = [0.05, 0.05, 0.05]

    }
    return [screenScale, screenPosition, rotation];
  }

  const [screenScale, screenPosition, rotation] = adjustIslandForScreenSize()

  const adjustPlaneForScreenSize = () => {
    let planeScale, planePosition
    if(window.innerWidth < 768){
      planeScale = [1.5, 1.5, 1.5]
      planePosition = [0, -1.5, 0]
    } else {
      planeScale = [0.25, 0.25, 0.25]
      planePosition = [0, -0.1, 4]
    }
    return [planeScale, planePosition];
  }
  const [planeScale, planePosition] = adjustPlaneForScreenSize()

  return (
    <section className='"w-full h-screen relative'>
       <div className='absolute top-28 left-0 right-0 z-10 flex 
      items-center justify-center'>
        {currentStage && <HomeInfo currentStage ={currentStage}/>}
      </div>
      <Canvas
        className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'} `}
        camera={{ near: 0.1, far : 1000 }}
      >
        <Suspense fallback={ <Loader />}>
          <directionalLight position = {[1,1,1]} intensity={3} />
  
          <Bird/>
          <Sky isRotating={isRotating}/>
          <Island
          isRotating={isRotating}
          setIsRotating={setIsRotating}
          islandScale={screenScale}
          islandPosition={screenPosition}
          rotation={rotation}
          setCurrentStage={setCurrentStage}
          currentStage={currentStage}

           />
          <Plane
          isRotating={isRotating}
          planeScale={planeScale}
          planePosition={planePosition}
          rotation={[0, 20, 0]}
          />
        </Suspense>
      
      </Canvas>
    </section>
  )
}

export default Home