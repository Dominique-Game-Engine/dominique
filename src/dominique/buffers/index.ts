import { genPlaneData } from "../geometry/plane.ts";

function initBuffers(gl: WebGL2RenderingContext) {
  const plane = genPlaneData();
  const positionBuffer = initPositionBuffer(gl, plane.vertices);
  const uvBuffer = initUvBuffer(gl, plane.uvs);

  return {
    position: positionBuffer,
    uv: uvBuffer
  };
}

function initPositionBuffer(gl: WebGL2RenderingContext, positions: number[]) {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function initUvBuffer(gl: WebGL2RenderingContext, uvs: number[]) {
  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

  return uvBuffer;
}

export { initBuffers };
