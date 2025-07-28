# Sage-Silk 🛍️

**A sleek online clothing store that doesn't suck.**

[🌐 **Live Demo**](https://sagesilk.onrender.com)

![Sage-Silk Homepage](./public/assets/images/homepage.png)

![Sage-Silk Homepage](./public/assets/images/homepage2.png)

![Sage-Silk Homepage](./public/assets/images/homepage3.png)

![Sage-Silk Homepage](./public/assets/images/homepage4.png)

## What's This About?

Sage-Silk is an online clothing store built for people who want to sell clothes without the headache. Clean design, easy admin panel, and it actually works on mobile (shocking, I know).

## Screenshots

### Storefront
![Product Gallery](./public/assets/images/gallery.gif)
*Browse products without wanting to throw your computer out the window*

### Admin Panel
![Admin Dashboard](./public/assets/images/admin-login.png)
*Add products without touching a single line of code*

### Modal 
![Modal View](./public/assets/images/homescreenshot.png)
*Looks good on phones too (revolutionary concept)*

## Features That Actually Matter

**For Customers:**
- Browse products by category (Women, Men, Kids, Accessories)
- Product pages with images and videos that load fast
- Works on every device made in the last decade

**For Store Owners:**
- Upload products through a web interface (no coding required)
- Organize everything with categories and subcategories
- Built on MongoDB so it scales when you get famous

**For Developers:**
- Clean EJS templates that make sense
- MongoDB integration that doesn't fight you
- Express.js backend that's actually readable

## Tech Stack

- **Backend:** Node.js + Express (because it works)
- **Database:** MongoDB  (belt and suspenders approach)
- **Frontend:** EJS templates + vanilla CSS/JS (no framework bloat)

## Getting Started

```bash
# Clone it
git clone https://github.com/yourusername/sage-silk.git
cd sage-silk

# Install stuff
npm install

# Set up your environment
cp .env.example .env
# Edit .env with your MongoDB connection

# Run it
npm run dev

# Visit http://localhost:3000
```

**Admin panel:** `http://localhost:3000/admin`

## Project Structure

```
sage-silk/
├── controllers/     # Where the magic happens
├── models/         # Database schemas
├── views/          # EJS templates
├── public/         # CSS, JS, images
├── routes/         # URL routing
└── config/         # Settings and stuff
```

## What's Coming Next

- [ ] Better API performance (making it faster)
- [ ] Bulk product uploads (for when you have 500 t-shirts)
- [ ] User accounts and login
- [ ] Order tracking
- [ ] Payment integration (the money part)


## Contributing

Found a bug? Have an idea? Cool.

1. Fork this repo
2. Make your changes
3. Test it (seriously, test it)
4. Submit a PR

Or just [open an issue](https://github.com/byjove19/sage-silk/issues) and tell us what's broken.

## License

MIT License - do whatever you want with it.

---

**Made with ☕ and mild frustration with existing e-commerce solutions.**

*Questions? Hit us up at [hello@sagesilk.com](mailto:odionyejovy@gmail.com)*
