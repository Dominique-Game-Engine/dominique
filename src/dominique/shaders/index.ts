import { getMultiSinkLogger } from "../logger/logger";

export type DEWebGLUniformsLocationsKeys = string;

export interface DEWebGLProgramInfo<T extends DEWebGLUniformsLocationsKeys = "projectionMatrix"> {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
    uv: number;
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
  } & Record<T, WebGLUniformLocation | null>;
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
  programInfo: DEWebGLProgramInfo,
  buffers: {
    position: WebGLBuffer | null
  },
  components: number = 3
) {
  // pull out 2 values per iteration by default
  const numComponents = components;
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

export function setUvAttribute(gl: WebGL2RenderingContext, programInfo: DEWebGLProgramInfo, buffers: {
  uv: WebGLBuffer | null
}) {
  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
  gl.vertexAttribPointer(
    programInfo.attribLocations.uv,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.uv);
}

// TODO: add support for non 1f uniforms
export function setUniform<ExtraUniforms extends DEWebGLUniformsLocationsKeys>(
  gl: WebGL2RenderingContext,
  programInfo: DEWebGLProgramInfo<ExtraUniforms>,
  name: keyof DEWebGLProgramInfo<ExtraUniforms>["uniformLocations"],
  value: number
) {
  // Set the value of the uniform
  gl.useProgram(programInfo.program);
  gl.uniform1f(programInfo.uniformLocations[name], value);
}