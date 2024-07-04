import Path from "path";

// CONFIG
const staticDir = "static/dist";
const defaultPage = "index.html";
const errorPage = "404.html";

// SERVER
const server = Bun.serve({
  fetch(request, server) {
    const requestPath = new URL(request.url).pathname;

    try {
      switch (requestPath) {
        case "/":
          return createFileResponse(defaultPage);
        default:
          return createFileResponse(requestPath);
      }
    } catch {
      return createFileResponse(errorPage);
    }
  },
});

function createFileResponse(requestPath: string): Response {
  const fullPath = Path.join(staticDir, requestPath);
  return new Response(Bun.file(fullPath));
}

console.log(`Server up on port ${server.port}.`);
