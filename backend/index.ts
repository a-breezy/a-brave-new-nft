import express from "express";
// functions to interact with pinata
import pinataSDK from "@pinata/sdk";
// to manipulate data sent by user
import fs from 'fs';
import pinFileToIPFS from "@pinata/sdk/types/commands/pinning/pinFileToIPFS";
// prevents unwanted requests form unauthorized sources
const cors = require('cors');
// helps with handling picture sent by user
const multer = require('multer');

// tells heroku where to start server
const app = express();
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 8080; // define 8080 as default port


// set up pinata to contact env and get api and secret keys
let pinata: any;
if (process.env.NODE_ENV === 'production') {
    pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);
} else {
    const PinataKeys = require("./PinataKeys").default;
    pinata = pinataSDK(PinataKeys.apiKey, PinataKeys.apiSecret);
}

// determine urls that can communicate with server
const corsOptions = {
    origin: [
        "http://localhost:8082",
        "https://a-brave-new-nft.com"
    ],
    optionsSuccessStatus: 200
};

// middleware multer, which sets 'uploads' as folder as destination to store picture
const upload = multer({ dest: 'uploads/'});

app.use(cors(corsOptions));
// allows app to receive 50mb of JSON -> the picture
app.use(express.json({ limit: "50mb" }));
app.use(
    // works with express.json to allow server to reveive picture
    express.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000
    })
);

// post single image to this endpoint
app.post("/mint", upload.single('image'), async (req, res) => {
    // store request in multerReq, which is 'any' type
    const multerReq = req as any;

    // if no file provided log no file, otherwise fileName = filename
    if (!multerReq.file) {
        res.status(500).json({ status: false, msg: "no file provided" });
    } else {
        const fileName = multerReq.file.filename;

        // verify pinata authentication
        await pinata    
            .testAuthentication()
            .catch((err: any) => res.status(500).json(JSON.stringify(err)));

        // creates readable stream which allows you to pin
            // createReadStream
        const readableStreamForFile = fs.createReadStream(`./uploads/${fileName}`);
        const options: any = {
            pinataMetadata: {
                // metadata values displayed in pinata pin manager
                name: req.body.title.replace(/\s/g, "-"),
                keyvalues: {
                    description: req.body.description
                }
            }
        };

        // pins picture to IPFS 
        const pinnedFile = await pinata.pinFileToIPFS(
            readableStreamForFile,
            options
        );
        // if both files and not 0, the file was correctly pinned
        if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0) {

            // remove user image from server
            fs.unlinkSync(`./uploads/${fileName}`);
            // pins metadata
                // must follow the following structure:
            const metadata = {
                // name of nft
                name: req.body.title,
                // description of nft
                description: req.body.description,
                // symbol appears in wallet to represent nft
                symbol: "TUT",
                // link to assets as formatted by hash
                artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
                // link to picture as formatted by hash
                displayUri: `ipfs://${pinnedFile.IpfsHash}`,
                // lists creators of nft
                creators: [req.body.creator],
                // always set to 0 for nft
                decimals: 0,
                // thumbnail to display nft for wallter
                thumbnailUri: "https://tezostaqquito.io/img/favicon.png",
                // whether or not nft can be transfered
                is_transferable: true,
                // allow wallets to choose to display symbol instead of name
                shouldPreferSymbol: false
            }

            // pin metadata to IPFS
            const pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
                // add some metadata to the metadata
                pinataMetadata: {
                    name: "TUT-metadata"
                }
            });

            // if IPFS hash is returned and size is over 0, everything has been pinned
            if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {
                res.status(200).json({
                    status: true,
                    msg: {
                        imageHash: pinnedFile.IpfsHash,
                        metadataHash: pinnedMetadata.IpfsHash
                    }
                });
            } else {
                res.status(500)
                    .json({ status: false, msg: "metadata were not pinned"});
            }
        } else {
            res.status(500).json({ status: false, msg: "file was not pinned"})
        }
    }
})


// start express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});