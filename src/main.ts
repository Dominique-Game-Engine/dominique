import app from "./app/main";

const canvas = document.querySelector("#gpuCanvas");
// @ts-ignore
const ctx: WebGL2RenderingContext = canvas.getContext("webgl2");

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

app(ctx);
