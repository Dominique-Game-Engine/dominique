function log(options: { level: "error" | "warning" | "info" }, ...data: any) {
  switch (options.level) {
    case "error":
      console.error(...data);
      alert(...data);
      break;
    case "warning":
      console.warn(...data);
      break;
    case "info":
      console.log(...data);
      break;
    default:
      break;
  }
}

function error(...data: any) {
  log({ level: "error" }, ...data);
}

function warn(...data: any) {
  log({ level: "warning" }, ...data);
}

function info(...data: any) {
  log({ level: "info" }, ...data);
}

const logger = {
  log,
  error,
  warn,
  info,
};

// Abstraction to allow for multiple sinks in the future
export function getMultiSinkLogger() {
  return logger;
}

export default logger;
