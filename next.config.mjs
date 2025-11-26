/** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//     domains: ["images.unsplash.com","res.cloudinary.com"],
//   },
// };
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "res.cloudinary.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // 👈 زود الحد الأقصى للـ body
    },
  },
};
 
export default nextConfig;
