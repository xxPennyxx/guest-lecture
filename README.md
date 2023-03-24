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
