/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["mammoth", "pdf-parse"],
};

export default nextConfig;
