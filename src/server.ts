import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
const url = require('url');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Supported image exttensions from jimp lib
  const jimpSuportedList: string[] = ['jpg', 'png', 'bmp', 'tiff', 'gif'];

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // endpoint to filter an image from a public url.
  app.get("/filteredimage/", async (req: Request, res: Response) => {
    let { image_url } = req.query;
    // Check if there is image_url
    if (!image_url) {
      return res.status(400).send("Image URL is Required!");
    }

    // Parse the image_url using Node.js URL module
    let parsedURL = url.parse(image_url, true);

    // Check the image_url validity
    if (!parsedURL.protocol || !parsedURL.slashes || !parsedURL.hostname || !parsedURL.pathname) {
      return res.status(400).send("Malformed Image URL!");
    }

    // Check if image_url path extension is supported by jimp lib
    if (jimpSuportedList.indexOf(parsedURL.pathname.split(".")[1]) === -1) {
      return res.status(415).send("Sorry, your Image extension not Supported!");
    }

    // Filter the image and send it back as response
    let filteredImageURI: string = await filterImageFromURL(image_url);
    res.status(200).sendFile(filteredImageURI);
    res.on('finish', () => deleteLocalFiles([filteredImageURI]));
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();