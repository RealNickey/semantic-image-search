/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.BLOB_HOSTNAME ||
          "tpo2ibmx3wdtfg4k.public.blob.vercel-storage.com",
        port: "",
      },
    ],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
