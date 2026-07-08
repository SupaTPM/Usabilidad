/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Permite aislar el build de los tests (Playwright) del dev normal.
  // Evita que dos dev servers compartan `.next` y corrompan la caché.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
