import { mat4 } from "gl-matrix";
import { de } from "../dominique";
import { initBuffers } from "../dominique/buffers";
import vsSource from "../dominique/shaders/dummy/vertex.glsl?raw";
import fsSource from "../dominique/shaders/dummy/fragment.glsl?raw";
import {
  DEWebGLProgramInfo,
  DEWebGLUniformsLocationsKeys,
  setPositionAttribute,
  setUniform, setUvAttribute
} from "../dominique/shaders";
import Stats from "stats.js";

type ExtraUniformsLocations = "deltaTime" | "elapsedTime" | "mouseX" | "mouseY";

export default function app(gl: WebGL2RenderingContext) {
  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  const shaderProgram = de.core.createShader(gl, vsSource, fsSource);
  if (!shaderProgram) return null;

  // Stats
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const programInfo: DEWebGLProgramInfo<ExtraUniformsLocations> = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      uv: gl.getAttribLocation(shaderProgram, "aUv")
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      deltaTime: gl.getUniformLocation(shaderProgram, "uDeltaTime"),
      elapsedTime: gl.getUniformLocation(shaderProgram, "uElapsedTime"),
      mouseX: gl.getUniformLocation(shaderProgram, "uMouseX"),
      mouseY: gl.getUniformLocation(shaderProgram, "uMouseY")
    }
  };
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  // Draw scene inside request animation frame
  let then = 0;
  let elapsedTime = 0;

  function render(now: number) {
    stats.begin();

    // convert to seconds
    now *= 0.001;
    const deltaTime = now - then;
    elapsedTime += deltaTime;
    then = now;

    // update shaders with delta time
    setUniform(gl, programInfo, "deltaTime", deltaTime);
    setUniform(gl, programInfo, "elapsedTime", elapsedTime);

    drawScene(gl, programInfo, buffers);

    stats.end();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  window.addEventListener("resize", () => {
    resize(gl);
  });

  window.addEventListener("mousemove", (e) => {
    if (e instanceof MouseEvent) {
      const mouseXClipSpace = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseYClipSpace = (e.clientY / window.innerHeight) * -2 + 1;
      setUniform(gl, programInfo, "mouseX", mouseXClipSpace);
      setUniform(gl, programInfo, "mouseY", mouseYClipSpace);
    }
  });
}

function drawScene<ExtraUniforms extends DEWebGLUniformsLocationsKeys>(
  gl: WebGL2RenderingContext,
  programInfo: DEWebGLProgramInfo<ExtraUniforms>,
  buffers: {
    position: WebGLBuffer | null
    uv: WebGLBuffer | null
  }
) {
  // Clear to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear everything
  gl.clearDepth(1.0);
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 180;
  let aspect = 1;
  if (gl.canvas instanceof HTMLCanvasElement) {
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  } else {
    // Handle the case where gl.canvas is an OffscreenCanvas
  }

  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [0.0, 0.0, -0.5]
  ); // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute(gl, programInfo, buffers);

  setUvAttribute(gl, programInfo, buffers);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}


function resize(gl: WebGL2RenderingContext) {
  const dpr = Math.min(window.devicePixelRatio, 2);
  if (gl.canvas instanceof HTMLCanvasElement) {
    const displayWidth = Math.round(gl.canvas.clientWidth * dpr);
    const displayHeight = Math.round(gl.canvas.clientHeight * dpr);

    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
  } else {
    // Handle the case where gl.canvas is an OffscreenCanvas
  }
}