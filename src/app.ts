import { DatabaseLoader } from "./loaders/database.loader";
import { ExpressLoader } from "./loaders/express.loader";
import { WebScrap } from "./service/webScrap.service";

// Create an Express application
const app = ExpressLoader.init();

DatabaseLoader.init();
// Set the port number for the server 
const port =3080
//  Number(process.env.PORT);

const webScraper = new WebScrap;


(async () => {
  try {
    const browser = await webScraper.getPopularLanguage()
  } catch (error) {
    console.log("Error " + error.toString());
  }
})();

// app.get('/api/tags', async (req, res) => {
//   const tags = await Tag.find();
//   res.json(tags);
// });

// Start the server and listen on the specified port
app.listen(port, () => console.log(`
    ==================================
    🚀 Server running on port ${port}!🚀
    ==================================
  `));
  
module.exports = app;
