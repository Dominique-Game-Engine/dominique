import { getMultiSinkLogger } from "../logger/logger";

export type DEWebGLUniforms = Record<string, WebGLUniformLocation | null>;

export interface DEWebGLProgramInfo<T extends DEWebGLUniforms> {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
  } & T;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
export function createShader(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
) {
  const logger = getMultiSinkLogger();

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create the shader program
  const shaderProgram = gl.createProgram();
  // TODO: Handle error here
  if (!shaderProgram || !vertexShader || !fragmentShader) {
    logger.error("An error occurred creating the shader program");
    return null;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    logger.error(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  const logger = getMultiSinkLogger();

  // TODO: Handle error here
  if (!shader) {
    logger.error("An error occurred creating the shaders");
    return null;
  }

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    logger.error(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
export function setPositionAttribute(
  gl: WebGL2RenderingContext,
  programInfo: DEWebGLProgramInfo<{}>,
  buffers: {
    position: WebGLBuffer | null
  }
) {
  // pull out 2 values per iteration
  const numComponents = 2;
  // the data in the buffer is 32bit floats
  const type = gl.FLOAT;
  // don't normalize
  const normalize = false;
  // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const stride = 0;
  // how many bytes inside the buffer to start from
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// TODO: add support for non 1f uniforms
export function setUniform<ExtraUniforms extends DEWebGLUniforms>(
  gl: WebGL2RenderingContext,
  programInfo: DEWebGLProgramInfo<ExtraUniforms>,
  name: keyof DEWebGLProgramInfo<ExtraUniforms>["uniformLocations"],
  value: number
) {
  const uniformLocation = gl.getUniformLocation(programInfo.program, name as string);

  // Set the value of the uniform
  gl.useProgram(programInfo.program);
  gl.uniform1f(uniformLocation, value);
}