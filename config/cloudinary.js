const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: "dzjkx3pra",
  api_key: "863742124541648",
  api_secret: "k9dIiUoNgvYVjzXJYyn0pnKOMKk",
});

module.exports = cloudinary;     

// CLOUDINARY_CLOUD_NAME=dzjkx3pra
// CLOUDINARY_API_KEY=863742124541648
// CLOUDINARY_API_SECRET=k9dIiUoNgvYVjzXJYyn0pnKOMKk
