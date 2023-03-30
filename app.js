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


let currEvents=[];
let currUsers=[];
let currEvents2=[];
let currSpeakers=[];



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

    
  }
  app.post("/signup",function(req,res){
    const newUsername=req.body.username;
    const newEmail=req.body.email;
    const newPassword=req.body.createps;
    const newPassword1=req.body.confirmps;
     
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
    
    if(loginUname!="admin"){
    var LoggedInUsers=User.find({username:loginUname, confirmps: loginpwd}).then(function(foundItems){
      if(foundItems.length===0){  
        res.redirect("/login");
      }
      else
      {

        Event.find().then(function(e){
          currEvents2=e;
        })
        currUsers=(foundItems);
        console.log(currUsers);
        res.redirect("/dashboard");
      }

      }) 
    }

    else{

      Event.find().then(function(e){
        //console.log(e);
        currEvents2=e;
      })
      res.redirect("/admin");
    }

  })

  app.get("/dashboard",function(req,res){
    res.render("dashboard",{currUsers1:currUsers, eventList:currEvents2});
  })

  app.get("/admin",function(req,res){
    Event.find().then(function(e){
      currEvents2=e;
    })
    res.render("admin",{eventList:currEvents2});
  })


  app.get("/addevent",function(req,res){
    res.render("addevent");
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
      maxAttendees:req.body.maxAttendees,
      link:req.body.link,
      venue:req.body.venue
    })

    newEvent.save();
    currEvents.push(newEvent);
    res.redirect("/events/"+req.body.name);
  })




  
  app.get("/events/:eventName/addspeaker",function(req,res){
    Event.findOne({name:req.params.eventName}).then(function(foundEvent){

      console.log(foundEvent);
      res.render("addspeaker",{currEvent1:foundEvent});

      
    })
  })

 


  app.get("/events/:eventName",function(req,res){

    const eventName=req.params.eventName;
    currentEvent=eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      //console.log("I am at event "+currentEvent.name);
      res.render("events",{event1:currentEvent});
    })
  })

  app.get("/speakers/:speakerName",function(req,res){

    const speakerName=req.params.speakerName;
    Speaker.findOne({speakername:speakerName}).then(function(currSpeaker){
      console.log(currSpeaker);
      res.render("speaker",{speaker1:currSpeaker});
    })
  })


  app.post("/events/:eventName/addspeaker",function(req,res){

    let newSpeaker=new Speaker({

      speakername:req.body.speakername,
      twitter:req.body.twitter,
      linkedin:req.body.linkedin,
      imgURL:req.body.imgURL,
      company:req.body.company,
      designation:req.body.designation,
      website:req.body.website,
      bio:req.body.bio

    })
    newSpeaker.save();
    currSpeakers.push(newSpeaker);
    
    Event.updateOne({name:req.params.eventName},{speakers:currSpeakers}).exec();
    res.redirect("/events/"+req.params.eventName);
    
  })

  app.get("/speakers/:speakerName/edit",function(req,res){

    let speakerToEdit=req.params.speakerName;
    Speaker.findOne({speakername:speakerToEdit}).then(function(foundSpeaker){

      res.render("editspeaker",{currSpeaker1:foundSpeaker})
    })
  })


  app.post("/speakers/:speakerName/edit",function(req,res){

    let speakerToEdit=req.params.speakerName;

    let newDetails={

      speakername:req.body.speakername,
      twitter:req.body.twitter,
      linkedin:req.body.linkedin,
      designation:req.body.designation,
      company:req.body.company,
      bio:req.body.bio,
      imgURL:req.body.imgURL,
      website:req.body.website
    }


    
    Speaker.updateOne({speakername:speakerToEdit},newDetails).exec();
    res.redirect("/events/"+currentEvent);
    
  })



  app.get("/editevent/:eventName",function(req,res){
    const eventName=req.params.eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      console.log(currentEvent);
      res.render("editevent",{eventToEdit:currentEvent});
    })
  })

  app.post("/editevent/:eventName",function(req,res){
    const updatedEvent={
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
      maxAttendees:req.body.maxAttendees,
      link:req.body.link,
      venue:req.body.venue
    }

    Event.updateOne({name:req.body.name},updatedEvent).exec();
    res.redirect("/events/"+req.body.name);
  })




  app.get("/delete/:eventName",function(req,res){
    const eventName=req.params.eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      res.render("delete",{eventToDelete:currentEvent});
    })
  })


  app.post("/delete/:eventName",function(req,res){
    const eventName=req.params.eventName;
    Event.deleteOne({name:eventName}).exec();

    
    Event.find().then(function(foundEvents){

      currEvents=foundEvents;
      res.redirect("/admin");

    })
  })

app.listen(3000, function() {
    console.log("Server listening on port 3000 @ http://localhost:3000/ ");
  });
  