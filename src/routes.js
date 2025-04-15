export const parse = function(request) {
  const parsedUrl = new URL(request.url);
  const path = parsedUrl.pathname;
  const pathParts = path.split('/');

  const doName = pathParts[1];
  const routePath = pathParts.slice(2).join('/');
  const host = parsedUrl.hostname;

  return { doName, routePath, host };
};

const sMap = {
  "test-secret": "/xyz"
};

const HeaderName = "X-Route-Map";

export const isAllowed = function(request) {
  const secret = request.headers.get(HeaderName); // Use `.get()` for Headers object
  if (!secret || !(secret in sMap)) {
    return false;
  }

  const allowedPath = sMap[secret];
  const parsedUrl = new URL(request.url);
  return parsedUrl.pathname.startsWith(allowedPath);
}
