"use strict";

const { Client, 
  TokenCreateTransaction,
  TokenMintTransaction,
  PrivateKey,
  TokenSupplyType,
  TokenType,
  CustomRoyaltyFee,
  TokenInfoQuery
} = require("@hashgraph/sdk");

const { NFTStorage, File, Blob } = require("nft.storage");
const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const sha1 = require(path.join(basePath, "/node_modules/sha1"));
const { createCanvas, loadImage } = require(path.join(
  basePath,
  "/node_modules/canvas"
));
const buildDir = path.join(basePath, "/build");
const layersDir = path.join(basePath, "/layers");
console.log(path.join(basePath, "/src/config.js"));
const {
  mint,
  setRoyalty,
  royaltyDen,
  royaltyNum,
  royaltyCollector,
  collectionName,
  operatorPrivateKey,
  operatorID,
  tokenSymbol,
  format,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  shuffleLayerConfigurations,
  debugLogs,
  nftName,
  category,
  creator,
  nftStorageAPI,
  maxSupply,
  useAdditionalData,
} = require(path.join(basePath, "/src/configAdmin.js"));
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
var metadataList = [];
var attributesList = [];
var dnaList = [];

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(path.join(buildDir, "/json"));
  fs.mkdirSync(path.join(buildDir, "/images"));
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split("#").pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 0;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  var dna = Number(_str.split(":").shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split("#").shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    blendMode:
      layerObj["blend"] != undefined ? layerObj["blend"] : "source-over",
    opacity: layerObj["opacity"] != undefined ? layerObj["opacity"] : 1,
  }));
  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    edition: _edition,
    name: `${useAdditionalData ? addedData[_edition -1] : nftName +' #'+ _edition}`,
    creator: creator,
    category: category,
    description: description,
    image: `IPFS://CID_GOES_HERE/${_edition}.png`,
    attributes: attributesList,
  };
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addNewMeta = (_dna, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    edition: _edition,
    name: `${useAdditionalData ? addedData[_edition -1] : nftName +' #'+ _edition}`,
    creator: creator,
    category: category,
    description: description,
    image: `IPFS://CID_GOES_HERE/${_edition}.png`,
    attributes: attributesList,
  };
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  return new Promise(async (resolve) => {
    const image = await loadImage(`${_layer.selectedElement.path}`);
    resolve({ layer: _layer, loadedImage: image });
  });
};

const drawElement = (_renderObject) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blendMode;
  ctx.drawImage(_renderObject.loadedImage, 0, 0, format.width, format.height);
  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = [], _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna[index])
    );
    return {
      name: layer.name,
      blendMode: layer.blendMode,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

const isDnaUnique = (_DnaList = [], _dna = []) => {
  let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
  return foundDna == undefined ? true : false;
};

const createDna = (_layers) => {
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.elements[i].weight;
      if (random < 0) {
        return randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}`
        );
      }
    }
  });
  return randNum;
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const createToken = async () => {
  const client = Client.forTestnet();
  const UserPrivateKey = PrivateKey.fromString(operatorPrivateKey);
  client.setOperator(operatorID, UserPrivateKey);

  if(setRoyalty === true){
    let nftCustomFee = await new CustomRoyaltyFee()
      .setNumerator(royaltyNum)
      .setDenominator(royaltyDen)
      .setFeeCollectorAccountId(royaltyCollector);
      
    var nftCreate = await new TokenCreateTransaction()
      .setTokenName(collectionName)
      .setTokenSymbol(tokenSymbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorID)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(maxSupply)
      .setCustomFees([nftCustomFee])
      .setAdminKey(UserPrivateKey)
      .setSupplyKey(UserPrivateKey)
      .setPauseKey(UserPrivateKey)
      .setFreezeKey(UserPrivateKey)
      .setWipeKey(UserPrivateKey)
      .freezeWith(client)
      .sign(UserPrivateKey);

  }else {

    var nftCreate = await new TokenCreateTransaction()
      .setTokenName(collectionName)
      .setTokenSymbol(tokenSymbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(operatorID)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(maxSupply)
      .setAdminKey(UserPrivateKey)
      .setSupplyKey(UserPrivateKey)
      .setPauseKey(UserPrivateKey)
      .setFreezeKey(UserPrivateKey)
      .setWipeKey(UserPrivateKey)
      .freezeWith(client)
      .sign(UserPrivateKey);
  }

  let nftCreateTxSign = await nftCreate.sign(UserPrivateKey);
  let nftCreateSubmit = await nftCreateTxSign.execute(client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);
  let tokenId = nftCreateRx.tokenId;
  console.log("\n\n");
  console.log(`Created NEW Non-Fungible Token: ${tokenId} \n`);
  var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  console.table(tokenInfo.customFees[0]);
  console.log("\n");
  return tokenId;
}

const startCreating = async () => {

  if(mint === true){
    var tokenId = await createToken();
  }

  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  for (
    let i = 1;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log("NFTs in Queue: ", abstractedIndexes,)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      let newDna = createDna(layers);

      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          debugLogs ? console.log("..........PROCESSING..........\n\n") : null;
          ctx.clearRect(0, 0, format.width, format.height);
          if (background.generate) {
            drawBackground();
          }
          renderObjectArray.forEach((renderObject) => {
            drawElement(renderObject);
            
          });
          debugLogs

          saveImage(abstractedIndexes[0]);
          addMetadata(newDna, abstractedIndexes[0]);
          saveMetaDataSingleFile(abstractedIndexes[0]);

        });

      if(mint === true){
          let metadata = metadataList.find((meta) => meta.edition == abstractedIndexes[0]);
            
          const nftImage = `${buildDir}\\images\\${abstractedIndexes[0]}.png`;
          const storageKey = nftStorageAPI;
          const client = new NFTStorage({ token: storageKey });
          let dateTime2 = Date.now();

          const newImage = new File([await fs.promises.readFile(nftImage)], 'image.png', { type: 'image/*' });
          const storeImage = await client.storeBlob(newImage);

          const attMeta = metadata['attributes'];
          
          const metadata2 = {
            'name': nftName + ' #' + abstractedIndexes[0],
            'creator': creator,
            'category': category,
            'description': description,
            'image': 'https://cloudflare-ipfs.com/ipfs/' + storeImage,
            'attributes': attMeta,
          };

            const newBlob = new Blob(JSON.stringify(metadata2), { type: 'application/json' });
            const storeBlob = await client.storeBlob(newBlob);
            const metadataURL = "https://cloudflare-ipfs.com/ipfs/" + storeBlob;

            const client2 = Client.forTestnet();
            const UserPrivateKey = PrivateKey.fromString(operatorPrivateKey);
            client2.setOperator(operatorID, UserPrivateKey);

            var mintNew = await mintToken(tokenId, metadataURL);
            async function mintToken(useToken, useMetadata) {
                let mintTx = await new TokenMintTransaction()
                    .setTokenId(useToken)
                    .setMetadata([Buffer.from(useMetadata)])
                    .freezeWith(client2);
                let mintTxSign = await mintTx.sign(UserPrivateKey);
                let mintTxSubmit = await mintTxSign.execute(client2);
                let mintRx = await mintTxSubmit.getReceipt(client2);
                return mintRx;
            }
            console.log(`Minted NFT Serial #${mintNew.serials[0].low} on Token ID ${tokenId}`);
            console.log(metadata2);
            console.log("\n");

      }else {
          let metadata = metadataList.find((meta) => meta.edition == abstractedIndexes[0]);
          const attMeta = metadata['attributes'];
          const metadata2 = {
            'name': nftName + ' #' + abstractedIndexes[0],
            'creator': creator,
            'category': category,
            'description': description,
            'image': 'https://cloudflare-ipfs.com/ipfs/' + "IPFS_CID_WILL_AUTO_FILL_WHEN_MINTING",
            'attributes': attMeta,
          };
          console.log(metadata2);
          console.log("\n");
      }
  
      dnaList.push(newDna);
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }

      }
 
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
