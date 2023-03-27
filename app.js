let express=require('express');
let bodyParser=require('body-parser');
let ejs = require("ejs");
const mongoose=require('mongoose');



let app=express();
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://127.0.0.1:27017/guestDB');

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

let currUsers=[];
let currEvents=[];
let numSpeakers=0;
let getSpeakers=[];
let currEvent="";
let currEvents2=[];

const userSchema = {
  username:{
   type: String,
  required:[true, ""],
  unique:true
  },
  email:{
    type: String,
   required:[true, ""],
   unique:true
   },
  createps:{
    type: String,
   required:[true, ""]
   },
  confirmps:{
    type: String,
   required:[true, ""]
   },
  year:{
    type: String
   },
  dept:{
    type: String,
   },
  role:{
    type: String,

   } 
};


const speakerSchema={
  speakername:{
    type: String,
   required:[true, ""]
   },
   twitter:String,
   linkedin:String,
   bio:String,
   imgURL:String,
   company:String,
   designation:String,
   website:String
}

const eventSchema={

  name:{
    type: String,
   required:[true, ""],
   unique:true
   },
   desc:{
     type: String,    },
     desc1:{
      type: String,    },

      tags:{
        type:[String]
      },

      
   imgURL:{
     type: String,
    required:[true, ""]
    },
   startdate:{
    type:String,
    required:[true,""]
   },
   enddate:{
    type:String,
    required:[true,""]
   },
   starttime:{
    type:String,
    required:[true,""]
   },
   endtime:{
    type:String,
    required:[true,""]
   },
   mode:{
    type:String,
    required:[true,""]
   },
   days:Number,
   link:String,
   venue:String,
   agenda:[String],
   maxAttendees:Number,
   numSpeakers:Number,
   speakers:[speakerSchema]
}
const User = mongoose.model("User", userSchema);
const Event = mongoose.model("Event", eventSchema);
const Speaker = mongoose.model("Speaker", speakerSchema);




app.get("/",function(req,res){
    res.redirect("/signup");

  });

  app.get("/signup",function(req,res){
    res.render("signup");
  
  
  });

  
  function validateDepartmentYears(year,dept){

    if ((dept.startsWith("BTech")&&(year<=4))||(dept.startsWith("MTech")&&(year<=2))||(dept.startsWith("BA")&&(year<=3))||
    (dept.startsWith("MA")&&(year<=2))||(dept.startsWith("Int. MSc")&&(year<=5))
    )
    return true;
    else
    return false;

  }

  

  function validateEmailId(email){
    if(email.endsWith("amrita.edu"))
    return true;
    else
    return false;
  }

  function assignRoles(email){
    if(validateEmailId(email)){
    if(email.endsWith("cb.amrita.edu"))
    return "faculty";
   
    else if(email.endsWith("cb.students.amrita.edu"))
    return "student";

    
    }
    // else
    // return "speaker";
    
  }
  app.post("/signup",function(req,res){
    const newUsername=req.body.username;
    const newEmail=req.body.email;
    const newPassword=req.body.createps;
    const newPassword1=req.body.confirmps;
    
    //general details, irrespective of role
   
    if(newPassword===newPassword1)
    {
      const newUser =new User({
        username: newUsername,
        email:newEmail,
        createps:newPassword,
        confirmps:newPassword1,
        role:assignRoles(newEmail)

        
      });

      User.find({username:newUsername}).then(function(foundItems){

        if(foundItems.length===0){
          currUsers.push(newUser);
          newUser.save();
          console.log(currUsers);
          if(newUser.email.endsWith("cb.students.amrita.edu"))
          res.redirect("/signup1");
          else
          res.redirect("/dashboard");
        }
        else
        res.redirect("/login");
        

      });
    }     
    
  })

  app.get("/signup1",function(req,res){
    res.render("signup1",{currUsers1:currUsers});
  
  
  });

  app.get("/login",function(req,res){
    res.render("login",{currUsers1:currUsers});
  
  
  });


  app.post("/signup1",function(req,res){



    const currUsername=req.body.confirm;
    console.log(currUsername);

    User.find({username:currUsername}).then(function(foundItems){

      if(foundItems.length!=0){

        const newYear=req.body.year;
        const newDept=req.body.dept;

        User.updateOne({username:currUsername},{
          year:newYear,
          dept:newDept}).then(function(foundItems){

            res.redirect("/dashboard");
          })
        
        
        }
      

       })
  
  
    })
  

  app.post("/login",function(req,res){
    const loginUname=req.body.username;
    const loginpwd=req.body.password;
    console.log(loginUname)
    console.log(loginpwd)

    Event.find().then(function(e){
      console.log(e);
      currEvents2=e;
    })
    if(loginUname!="admin"){
    var LoggedInUsers=User.find({username:loginUname, confirmps: loginpwd}).then(function(foundItems){
      if(foundItems.length===0){  
        //console.log("Invalid User")
        res.redirect("/login");
      }
      else
      {
        //console.log("YAY")
        currUsers=(foundItems);
        console.log(currUsers);
        res.redirect("/dashboard");
      }

      }) 
    }

    else{
      res.redirect("/admin");
    }

  })

  app.get("/dashboard",function(req,res){
    res.render("dashboard",{currUsers1:currUsers, eventList:currEvents2});
  })

  app.get("/admin",function(req,res){
    res.render("admin",{eventList:currEvents2});
  })


  app.get("/addevent",function(req,res){
    res.render("addevent");
  })
  app.get("/addevent1",function(req,res){
    res.render("addevent1",{currEvents1:currEvents});
  })

  app.get("/addspeaker",function(req,res){
    res.render("addspeaker",{currEvents1:currEvents, numSpeakers1:numSpeakers, currEvent1:currEvent});
  })
  
  app.post("/addevent",function(req,res){
    const newEvent=new Event({
      name:req.body.name,
      desc:req.body.desc,
      desc1:req.body.desc1,
      tags:req.body.tags,
      imgURL:req.body.imgURL,
      startdate:req.body.startdate,
      enddate:req.body.enddate,
      starttime:req.body.starttime,
      endtime:req.body.endtime,
      mode:req.body.mode,
      days:(new Date(req.body.enddate).getDate()-new Date (req.body.startdate).getDate())+1
    })

    console.log(newEvent);
    //console.log(req.body.tags);
    //let days=(new Date(newEvent.enddate).getDate()-new Date (newEvent.startdate).getDate())+1;
    console.log(newEvent.days);


    newEvent.save();
    currEvents.push(newEvent);
    res.redirect("/addevent1");
  })



  app.post("/addevent1",function(req,res){
    
    let getEventName=req.body.submit;
    let newLink;
    let newVenue;

    //for online events
    if(req.body.link && !(req.body.venue)){
    newLink=req.body.link;
    Event.updateOne({name:getEventName},{
      link:newLink,
      agenda:req.body.agenda,
      maxAttendees:req.body.maxAttendees,
      numSpeakers:req.body.numSpeakers
    }).then(function(foundItems){
      //console.log(foundItems); 
    })    }


      //for offline events
    if(req.body.venue && !(req.body.link)){
      newVenue=req.body.venue;
      Event.updateOne({name:getEventName},{
        venue:newVenue,
        agenda:req.body.agenda,
        maxAttendees:req.body.maxAttendees,
        numSpeakers:req.body.numSpeakers
      }).then(function(foundItems){
        //console.log(foundItems);
         })    }


         //for hybrid events

    if(req.body.venue && (req.body.link)){
      newVenue=req.body.venue;
      newLink=req.body.link;
      Event.updateOne({name:getEventName},{
        venue:newVenue,
        link:newLink,
        agenda:req.body.agenda,
        maxAttendees:req.body.maxAttendees,
        numSpeakers:req.body.numSpeakers
      }).then(function(foundItems){
        //console.log(foundItems);
         })    }


         numSpeakers=req.body.numSpeakers;
         currEvent=getEventName;

    res.redirect("/addspeaker");
  })
  

 

  app.post("/addspeaker",function(req,res){
    const speakerName=req.body.speakername;
    const twitter=req.body.twitter;
    const linkedin=req.body.linkedin;
    const imgURL=req.body.imgURL;
    const company=req.body.company;
    const website=req.body.website;
    const designation=req.body.designation;
    const bio=req.body.bio;
    const currEvent2=req.body.submit;
    console.log(currEvent2);


    
    if(numSpeakers>1){
    for(let j=0;j<numSpeakers;j++){

      var s={
        speakername:speakerName[j],
        twitter:twitter[j],
        bio:bio[j],
        linkedin:linkedin[j],
        imgURL:imgURL[j],
        company:company[j],
        designation:designation[j],
        website:website[j]
      };

      getSpeakers.push(s);
      console.log(s);

    }

    console.log("Our speakers:")
    console.log(getSpeakers);
    //Speaker.insertMany(getSpeakers);//add the new speakers into the speakers pool
    Event.updateOne({name:currEvent2},{speakers:getSpeakers}).exec();

    Event.find().then(function(e){
      console.log(e);
      currEvents2=e;
    })
    res.redirect("/admin");
  }
  else{
    

      var s1={
        speakername:speakerName,
        twitter:twitter,
        bio:bio,
        linkedin:linkedin,
        imgURL:imgURL,
        company:company,
        designation:designation,
        website:website
      };

      getSpeakers.push(s1);
      console.log(getSpeakers);

      Event.updateOne({name:currEvent2},{speakers:getSpeakers}).exec();

    res.redirect("/admin");

  }

  })


  app.get("/events/:eventName",function(req,res){

    const eventName=req.params.eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      //console.log("I am at event "+currentEvent.name);
      res.render("events",{event1:currentEvent});
    })
  })

app.listen(3000, function() {
    console.log("Server listening on port 3000 @ http://localhost:3000/ ");
  });
  