-------------------------------------------------------------------------

1) Before doing anything, make sure you install nodejs package -> https://nodejs.org/en/

If on Mac you may need to update to latest version of Node using the code below in the terminal:

        npm install n -g

and then

        sudo n stable

-------------------------------------------------------------------------

2) Open CMD (Command Prompt on Windows) or Terminal (Mac) and install the git package - copy and paste line below into your terminal

        git clone https://github.com/HashDudes/Hedera-Hashlips.git

-------------------------------------------------------------------------

3) Then enter into the folder you just cloned using:

        cd hedera-hashlips

-------------------------------------------------------------------------

4) Now that you are in the Hedera-Hashlips folder, install the packages using the command below:

        npm install 

-------------------------------------------------------------------------

5) At this point the software is ready to go! - Time to configure for your project!

*(Optional) To test that everything is correct, run the code below and you should seem the test layers generate (Generated images will be in the folder Hedera-Hashlips -> Build)

        node index

-------------------------------------------------------------------------

6) FIRST! Add your layers into the folder within the Hedera-Hashlips folder called "layers". Each folder in the layers folder will represent one layer of traits. Ex. Background, Donut, Icing, Sprinkles.

    Setting rarities is done by renaming your trait image files in the layers folders. Each trait should have a file name as such -> vanilla#10.png 

    The number after the # will determine how often the generator will select that trait. If you set one background blue#1.png and another red#100.png , there will be many more red backgrounds then blue. This does not mean there will be 100 red and 1 blue, but instead represents a weighted number within the folder.

-------------------------------------------------------------------------

7) Go to the folder on your computer Hedera-Hashlips -> then go into the folder "src" -> Open the file config.js with any text editor. Follow the steps in the file and make sure you fill out all of the sections. If you wish to Mint while you generate set the "mint" variable to true

-------------------------------------------------------------------------

8) After you have uploaded your layers in the "layers" folder and updated the config.js file you are ready to go!

-------------------------------------------------------------------------

9) To start the generation or generation + mint go back to the Command Prompt (Windows) or Terminal (Mac) and make sure you are in the Hedera-Hashlips folder (ex. C:\Users\HashDudes\Hedera-Hashlips> )

-------------------------------------------------------------------------

10) Once you are in the Hedera-Hashlips folder run the command below to start gen or gen + mint:

        node index

-------------------------------------------------------------------------

11) You can find your newly generated images and json data in the folder Hedera-Hashlips -> Build

-------------------------------------------------------------------------

Joing our discord or email us if you have any questions! :)

Discord: https://discord.gg/WzNj2t3CRj
Twitter: https://twitter.com/hashdudes
Email: HashDudesNFT@gmail.com
