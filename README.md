# Guest Lecture Details Maintenance

## Here's a detailed guide to run this project.

1. Open Hyper terminal (or CMD), navigate to a suitable directory and type

`git clone https://github.com/xxpennyxx/guest-lecture.git`

2. To run it on Localhost, simply type

`nodemon`

3. To generate admin login details,

a) run `mongod` on another terminal (to start up the MongoDB server), and `mongosh` on yet another.

b) Switch to the guestDB using the command `use guestDB`

c) Run the following command:

`db.users.insertOne({username: "admin",email:"admin@amrita.edu",createps:"Password12345!", confirmps:"Password12345!", role:"admin" });`

You're good to go! ;)

## Installing Required Packages:

1. Make sure you have NodeJS installed in your system. The preferred version is 18.13.0 .

2. Make sure you are in the same directory as your project. Install additional packages required for the project i.e. Mongoose, Express, EJS and Body Parser; using the following command:

`npm install express mongoose ejs body-parser`

Preferred versions:
- body-parser@1.20.2
- ejs@3.1.9
- express@4.18.2
- mongoose@7.0.1
- nodemon@2.0.20
- typescript@4.9.3

## Configuring MongoDB with the terminal:

1. Make sure you have MongoDB installed. You may use the command `mongod --version` to check the version. The recommended version is 6.0.3.

2. Use `cd ~` to navigate to the home directory.

3. Create a new .bash_profile file using the command `touch .bash_profile`. Check if it's present by running the command `ls -a`.

4. Edit the file using VS Code by typing `code .` and searching for it (hours of pain :/)

Insert the following code:

`alias mongod="/c/Program\ Files/MongoDB/Server/6.0/bin/mongod.exe"`

`alias mongosh="/c/Program\ Files/MongoDB/Server/6.0/bin/mongosh.exe"`

5. And finally check if the installation was successful! Typing `mongod` should start up your MongoDB server, while typing `mongosh` should open up your MongoDB CLI terminal. In short, if anything interesting pops up, you're good to go!


References: 

https://blog.londonappbrewery.com/how-to-download-install-mongodb-on-mac-2895ccd2b5c1

https://medium.com/@LondonAppBrewery/how-to-download-install-mongodb-on-windows-4ee4b3493514

(probably outdated :p)




