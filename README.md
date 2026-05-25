# website-sparc

- **Node version:** v18 (installed via `nvm use 18`).
- **Install dependencies:** `npm install` to pull all required packages.
- **Environment variables:**
  - Added a `.env` file at the project root.
  - Installed the `dotenv` package and required it in `index.js` to load variables.
  - Populated `.env` with `PORT`, `MONGODB_URI`, and other needed keys.


### Projects not displayed on the server
- **Problem:** Server rendered *“There are no projects.”* because the MongoDB connection string was missing or incorrect, resulting in an empty `Project.find({})` query.
- **Fix:** Added a proper `.env` file with `MONGODB_URI`, whitelisted the server IP in MongoDB Atlas, and added optional error handling in `projectController.js`.

### Replace SendGrid with local email mock
- **Problem:** The application relied on SendGrid for email notifications, which is unnecessary for a local/self‑contained environment.
- **Fix:** Implemented a simple local mock that logs email data to the console and stores it in a JSON file, removing the external dependency.

### Localize media and image handling
- **Problem:** Images were originally configured for cloud storage (AWS S3), leading to broken links locally.
- **Fix:** Switched Multer storage to a local `./www/uploads/` directory, updated controller routes to serve files from this path, and added a fallback placeholder image in the gallery template.

### Image rendering & UI improvements
- **Problem:** Some pages displayed broken images or layout issues due to missing `project.images` data.
- **Fix:** Added checks in `gallery.pug` and `shop.pug` to handle missing images, and introduced a carousel with fallback images.

## Deployment Steps
1. Copy the local `.env` (especially `MONGODB_URI`) to the server root.
2. Ensure the upload directories `./www/uploads/projects` and `./www/uploads/products` exist and are writable.
3. Restart the Node process (`npm restart` or your process manager).
4. Verify MongoDB Atlas network access includes the server IP.

---

This is the GitHub repository for website of [SpArc Architects](https://github.com/dayshmookh/website-sparc)

