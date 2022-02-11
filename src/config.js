
//------------------------------------------CONFIGURE SETTINGS HERE-----------------------------------------------

//1) NFT Name - If you wanted the final name to display "Dude #1" then just enter "Dude"
//The Number will be added as they are generated.
const nftName = "Donut";

//2) NFT Description
const description = "Write about your NFT collection here!";

//3) Creator - Your name goes here
const creator = "Hash Dudes";

//4) NFT Category (Digital Art, Collectible, Art)
const category = "Collectible";

//5) Change the value after the 'name:' tag to match your folders exactly 
//Make sure they are in the correct order from back layer -> front layer
const layerConfigurations = [
  {
    growEditionSizeTo: 15,//Change this to the amount of images you want to generate
    layersOrder: [
      { name: "Background" },//Back Layer / Background 
      { name: "Donut" },
      { name: "Icing" },
      { name: "Sprinkles" },//Top Layer / Up Front
    ],
  },
];

//6) Set Image Size for Generation
const format = {
  width: 750,
  height: 750,
};

//-------------------ADD MINT: MINT WHILE THEY GENERATE-----------------

//7) MINT & GENERATE ART = true , ONLY GENERATE ART = false
const mint = false;

//8) NFT.Storage Api Key - Go to https://nft.storage/ -> create a new account -> go to api keys and create a new one -> paste it here. 
const nftStorageAPI = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

//9) Hedera Account ID To Mint With (Make sure there are funds available in wallet) - 0.0.xxxxxx 
const operatorID = "YOUR_HEDERA_ACCOUNT_ID_GOES_HERE";

//10) Hedera Private Key
const operatorPrivateKey = "YOUR_HEDERA_PRIVATE_KEY_GOES_HERE"; 

//11) Token Name - Name of the Entire Collection
const collectionName = "Hash Dudes";

//12) Collection Size (Should be the same as the growEditionSizeTo defined above for generation)
const maxSupply = '1000';

//13) Set Token Symbol
const tokenSymbol = "DUDE";

//14) Set Royalty - Num 1 and Den 20 would represent a 5% royalty
//setRoyalty = true -> NFT will have royalty
//setRoyalty = false -> NFT will not have royalty
const setRoyalty = true;
const royaltyNum = "1";
const royaltyDen = "20";
const royaltyCollector = "0.0.xxxxxx";//Set as Hedera Account that royalties will be paid out to. 


//--------------------------------------------------END CONFIGURATION AREA--------------------------------------------


const isLocal = typeof process.pkg === "undefined";
const path = require("path");
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));
const shuffleLayerConfigurations = false;
const debugLogs = true;
const background = {generate: true,brightness: "100%",};
const uniqueDnaTorrance = 10000;
const preview = {thumbPerRow: 5,thumbWidth: 50,imageRatio: format.width / format.height,imageName: "preview.png",};

module.exports = {
  setRoyalty,
  mint,
  royaltyCollector,
  royaltyDen,
  royaltyNum,
  collectionName,
  operatorPrivateKey,
  operatorID,
  tokenSymbol,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  nftName,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  category,
  format,
  creator,
  maxSupply,
  nftStorageAPI,
};
