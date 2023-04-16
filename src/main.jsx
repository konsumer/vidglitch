import React, { Suspense, useMemo, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { useAspect, useVideoTexture, useTexture } from '@react-three/drei'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import '@/site.css'

import vsBasic from './shaders/basic.vs.glsl?raw'
import fsTvBass from './shaders/tv-bass.fs.glsl?raw'

// TODO: see this for example of applying shader:
// https://codesandbox.io/s/react-three-fiber-custom-geometry-with-fragment-shader-material-vxswf

// more ideas here: https://youtu.be/e2ntx-fyXaE

function VideoMaterial ({ url }) {
  const texture = useVideoTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

function FallbackMaterial ({ url }) {
  const texture = useTexture(url)
  return <meshBasicMaterial map={texture} toneMapped={false} />
}

/*
uniform sampler2D tDiffuse;
uniform float time; // steadily increasing float passed in
uniform float eqL[32]; // EQ left
uniform float eqR[32]; // EQ right
uniform float speed; // distortion vertical travel speed
*/

function Scene ({ video, fallback, width, height }) {
  const size = useAspect(width, height)
  const [time, setTime] = useState(0)
  const [eq, setEq] = useState([
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  ])

  useEffect(() => {
    const i = setInterval(() => {
      setTime(Date.now())
    }, 100)
    return () => clearInterval(i)
  }, [])

  const uniforms = useMemo(
    () => ({
      eqL: { value: eq[0] },
      eqR: { value: eq[1] },
      speed: { value: 1.0 },
      time: { value: time }
    }),
    [time, eq]
  )

  return (
    <mesh scale={size}>
      <planeGeometry />
      <Suspense fallback={<FallbackMaterial url={fallback} />}>
        <VideoMaterial url={video} />
      </Suspense>
      <shaderMaterial attach='material' vertexShader={vsBasic} fragmentShader={fsTvBass} uniforms={uniforms} />
    </mesh>
  )
}

function App () {
  const handle = useFullScreenHandle()
  return (
    <FullScreen handle={handle}>
      <Canvas orthographic>
        <Scene video='/space.mp4' fallback='/space.png' width={640} height={360} />
      </Canvas>
    </FullScreen>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
