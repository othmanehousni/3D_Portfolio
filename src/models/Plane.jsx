import React, { useEffect, useRef } from 'react'
import planeScene from '../assets/3d/plane.glb'
import planeAnimation from '../assets/3d/plane2.glb'
import { useAnimations, useGLTF } from '@react-three/drei'

const Plane = ({isRotating, planePosition, planeScale, ...props}) => {
  const ref = useRef()
  const { scene, animations } = useGLTF(planeScene)
  const {animations: animations2} = useGLTF(planeAnimation)
  const { actions } = useAnimations(animations2, ref)

  useEffect(() => {
    
    if(isRotating){
      actions['Take 001'].play()
    } else {
      actions['Take 001'].stop()
    }
  }, [actions, isRotating])

  return (
    <mesh position={planePosition} scale={planeScale} ref ={ref}{...props}>
      <primitive object={scene} />
    </mesh>
  )
}

export default Plane