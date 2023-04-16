import React, { Suspense, useRef, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas, useThree, extend, useFrame } from '@react-three/fiber'
import { shaderMaterial, useVideoTexture, Plane } from '@react-three/drei'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import '@/site.css'

import vsBasic from './shaders/basic.vs.glsl?raw'
import fsTvBass from './shaders/tv-bass.fs.glsl?raw'
import fsEq from './shaders/eq.fs.glsl?raw'

// more ideas here:
// https://codesandbox.io/s/react-three-fiber-custom-geometry-with-fragment-shader-material-vxswf
// https://javascript.plainenglish.io/mic-audio-visualizer-using-react-and-canvas-4e89905141ac
// https://youtu.be/e2ntx-fyXaE
// https://youtu.be/EWnZMFApCx4

function Scene ({ src, fallback, width, height, eqL, eqR }) {
  const { viewport } = useThree()
  const depthMaterial = useRef()
  const video = useVideoTexture(src)

  useFrame(state => {
    depthMaterial.current.eqL = eqL
    depthMaterial.current.eqR = eqR
  })

  return (
    <Plane args={[1, 1]} scale={[viewport.width, viewport.height, 1]}>
      {/* <bassTvMaterial ref={depthMaterial} video={video} /> */}
      <eqMaterial ref={depthMaterial} video={video} />
    </Plane>
  )
}

extend({
  BassTvMaterial: shaderMaterial({
    video: null,
    time: 0.0,
    eqL: new Float32Array(32),
    eqR: new Float32Array(32),
    speed: 100.0
  }, vsBasic, fsTvBass)
})

extend({
  EqMaterial: shaderMaterial({
    video: null,
    eqL: new Float32Array(32),
    eqR: new Float32Array(32)
  }, vsBasic, fsEq)
})

// TODO: setup fullscreen
function App () {
  const handle = useFullScreenHandle()
  const [eq, setEq] = useState([new Float32Array(32), new Float32Array(32)])

  // temporary till I setup sound
  useEffect(() => {
    const i = setInterval(() => {
      setEq(e => {
        return [
          e[0].map(i => Math.random()),
          e[1].map(i => Math.random())
        ]
      })
    }, 100)
    return () => clearInterval(i)
  }, [])

  return (
    <FullScreen handle={handle}>
      <Canvas orthographic>
        <Scene src='/space.mp4' width={640} height={360} eqL={eq[0]} eqR={eq[1]} />
      </Canvas>
    </FullScreen>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
