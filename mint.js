const { 
    Client, 
    TokenCreateTransaction,
    TokenMintTransaction,
    PrivateKey,
    TokenSupplyType,
    TokenType,
    Hbar,
    CustomFixedFee,
    CustomRoyaltyFee,
    TokenInfoQuery
  } = require("@hashgraph/sdk");

const { NFTStorage, File, Blob } = require("nft.storage");
const fs = require("fs");

//------------------------------------------CONFIGURE MINT SETTINGS HERE-----------------------------------------------

//----------------> This minting script can be used to mint the last generated batch of items <------------------------

//1) NFT.Storage Api Key - Go to https://nft.storage/ -> create a new account -> go to api keys and create a new one -> paste it here. 
const nftStorageAPI = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

//2) Hedera Account ID To Mint With (Make sure there are funds available in wallet) - 0.0.xxxxxx 
const operatorID = "0.0.xxxxxx";

//3) Hedera Private Key
const operatorPrivateKey = PrivateKey.fromString("302exxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); 

//4) Token Name - Name of the Entire Collection
const collectionName = "Hash Dudes";

//5) Collection Size (Should be the same as the growEditionSizeTo defined above for generation)
const maxSupply = '1000';

//6) Set Token Symbol
const tokenSymbol = "DUDE";

//7) Set Royalty - Num 1 and Den 20 would represent a 5% royalty
//setRoyalty = true -> NFT will have royalty
//setRoyalty = false -> NFT will not have royalty
const setRoyalty = true;
const royaltyNum = "1";
const royaltyDen = "20";
const royaltyCollector = "0.0.xxxxxx";//Set as Hedera Account that royalties will be paid out to. 



//--------------------------------------------------END CONFIGURATION AREA--------------------------------------------


async function main() {

    const client = Client.forMainnet();
    //const operatorPrivateKey = operatorPrivateKey);
    client.setOperator(operatorID, operatorPrivateKey);


    // DEFINE CUSTOM FEE SCHEDULE
    let nftCustomFee = await new CustomRoyaltyFee()
        .setNumerator(royaltyNum)
        .setDenominator(royaltyDen)
        .setFeeCollectorAccountId(royaltyCollector);

    //Create Non Fungible Token
    let nftCreate = await new TokenCreateTransaction()
    .setTokenName(collectionName)
    .setTokenSymbol(tokenSymbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(operatorID)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(maxSupply)
    .setCustomFees([nftCustomFee])
    .setAdminKey(operatorPrivateKey)
    .setSupplyKey(operatorPrivateKey)
    .setPauseKey(operatorPrivateKey)
    .setFreezeKey(operatorPrivateKey)
    .setWipeKey(operatorPrivateKey)
    .freezeWith(client)
    .sign(operatorPrivateKey);

    let nftCreateTxSign = await nftCreate.sign(operatorPrivateKey);
    let nftCreateSubmit = await nftCreateTxSign.execute(client);
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let tokenId = nftCreateRx.tokenId;
    console.log(`Created NFT with Token ID: ${tokenId} \n`);



    let nftMetadata = fs.readFileSync("build/json/_metadata.json");
    const nftData = JSON.parse(nftMetadata);

    const storageClient = new NFTStorage({ token: nftStorageAPI });
    
    
    for (let i = 0; i < nftData.length; i++) {
            
            var nftName = nftData[i].name;

            var creator = nftData[i].creator;

            var category = nftData[i].category;
            
            var description = nftData[i].description;

            var attributes = nftData[i].attributes;
    
            var nftImageNum = nftData[i].image;
    
            const nftImage = `build/images/${nftImageNum}`;
            
            const newImage = new File([await fs.promises.readFile(nftImage)], nftImageNum, { type: 'image/*' });
    
            const storeImage = await storageClient.storeBlob(newImage);
    
            const hedera_metadata = {
                    'name': nftName,
                    'description': description,
                    'creator': creator,
                    'category': category,
                    'supply': maxSupply,
                    'cid': storeImage,
                    'image': 'https://cloudflare-ipfs.com/ipfs/' + storeImage,
                    'attributes':attributes,
            };
                    
            const newBlob = new Blob(JSON.stringify(hedera_metadata), { type: 'application/json' });
                    
            const storeBlob = await storageClient.storeBlob(newBlob);

            var metadataURL = "https://cloudflare-ipfs.com/ipfs/" + storeBlob;
            
            var mintNew = await mintToken(tokenId, metadataURL);
            async function mintToken(useToken, useMetadata) {
                let mintTx = await new TokenMintTransaction()
                    .setTokenId(useToken)
                    .setMetadata([Buffer.from(useMetadata)])
                    .freezeWith(client);
                let mintTxSign = await mintTx.sign(operatorPrivateKey);
                let mintTxSubmit = await mintTxSign.execute(client);
                let mintRx = await mintTxSubmit.getReceipt(client);
                return mintRx;
            }

            console.log(`Minted NFT Serial #${mintNew.serials[0].low} on Token ID ${tokenId}`);
            console.log('Image Minted:' + nftImageNum);
            console.log("\n");
    
    
    }//end collection loop
    
    
    
    } /* Close main() */
    
    main(); //call main() function