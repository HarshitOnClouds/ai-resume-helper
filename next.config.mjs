/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["mammoth", "pdfjs-dist"],
};

export default nextConfig;
