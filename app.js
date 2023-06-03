require('dotenv').config();
let express=require('express');
let bodyParser=require('body-parser');
let ejs = require("ejs");
const mongoose=require('mongoose');
const nodemailer=require("nodemailer");
//const sendMail=require("./sendMail");
const bcrypt=require("bcrypt");
const saltRounds=10;

let app=express();
mongoose.set("strictQuery", false);
mongoose.connect('mongodb://127.0.0.1:27017/guestDB');

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))


let currEvents=[];
let currUsers=[];
let currUserMail;
let currUser;

const userSchema = {
  name:{

    type: String
  },
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
    type: Number
   },
  dept:{
    type: String,
   },
  role:{
    type: String,

   } ,
   preferredTopics:{
    type:[String]
  },
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
   website:String,
   speakerEmail:String
};

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
      depts:{
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
   speakers:[speakerSchema],
   attendeesList:[Object],
   recording:String
};

const feedbackSchema={

  eventName:String,
  experience:Number,
  content:Number,
  expectations:Number,
  engaging:Number,
  improvement:String
}
const User = mongoose.model("User", userSchema);
const Event = mongoose.model("Event", eventSchema);
const Speaker = mongoose.model("Speaker", speakerSchema);
const Feedback=mongoose.model("Feedback",feedbackSchema);


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

  function validateDate(date){
    let today=new Date();
    if (new Date(date)>=today)
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
     
    bcrypt.hash(newPassword,saltRounds,function(err,hash){
      if(newPassword===newPassword1 && validateEmailId(req.body.email))
    {
      const newUser =new User({
        username: newUsername,
        email:newEmail,
        createps:hash,
        confirmps:hash,
        role:assignRoles(newEmail)

        
      });

      User.find({username:newUsername}).then(function(foundItems){

        if(foundItems.length===0){
          currUsers.push(newUser);
          newUser.save();
          if(newUser.email.endsWith("cb.students.amrita.edu"))
          res.redirect("/signup1");
          else
          res.redirect("/dashboard");
        }
        else
        res.redirect("/login");
        

      });
    }  
    else res.redirect("/signup");  
    }) 
    
  })

  app.get("/signup1",function(req,res){
    res.render("signup1",{currUsers1:currUsers});
  
  
  });

  app.get("/login",function(req,res){
    res.render("login",{currUsers1:currUsers});
  
  
  });


  app.post("/signup1",function(req,res){

    if(validateDepartmentYears(req.body.year, req.body.dept)){
      const currUsername=req.body.confirm;
    User.findOne({username:currUsername}).then(function(foundItems){
      if(foundItems.length!=0){
        
        const newYear=req.body.year;
        const newDept=req.body.dept;
        User.updateOne({username:currUsername},{
          year:newYear,
          dept:newDept}).exec();
            res.redirect("/dashboard");
        
        } }) }

    else{
      res.redirect("/signup1");
    }  

  })
  

  app.post("/login",function(req,res){
    const loginUname=req.body.username;
    const loginpwd=req.body.password;
  
    
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
        //console.log(currUsers);
        res.redirect("/dashboard");
      }

      }) 
    }

    else{

      Event.find().then(function(e){
        currEvents2=e;
      })
      res.redirect("/admin");
    }

  })

  app.get("/dashboard",function(req,res){

    let upcomingEvents=[];
    let pastEvents=[];
    Event.find().then(function(currEvents2){
      currEvents2.forEach(function(event){

        if(validateDate(event.startdate))
        upcomingEvents.push(event);
        else
        pastEvents.push(event);
        
      })
      //res.render("dashboard",{currUsers1:currUsers, eventList:currEvents2});
      res.render("dashboard",{currUsers1:currUsers, upcomingEvents1:upcomingEvents, pastEvents1:pastEvents});
    })
  })

  app.get("/admin",function(req,res){

    let upcomingEvents=[];
    let pastEvents=[];
    Event.find().then(function(e){
      e.forEach(function(event){
        if(validateDate(event.startdate))
        upcomingEvents.push(event);
        else
        pastEvents.push(event);
      })
      //res.render("admin",{eventList:e});
      res.render("admin",{upcomingEvents1:upcomingEvents, pastEvents1:pastEvents});
    })

  })


  app.get("/addevent",function(req,res){
    res.render("addevent");
  })
  
  app.post("/addevent",function(req,res){
    if((validateDate(req.body.startdate)) && validateDate(req.body.enddate) && new Date(req.body.enddate)>=new Date(req.body.startdate) ){
    const newEvent=new Event({
      name:req.body.name,
      desc:req.body.desc,
      desc1:req.body.desc1,
      tags:req.body.tags,
      depts:req.body.depts,
      imgURL:req.body.imgURL,
      startdate:req.body.startdate,
      enddate:req.body.enddate,
      starttime:req.body.starttime,
      endtime:req.body.endtime,
      mode:req.body.mode,
      maxAttendees:req.body.maxAttendees,
      link:req.body.link,
      venue:req.body.venue,
      days:new Date(req.body.enddate)-new Date(req.body.startdate)+1
    });

    currEvents.push(newEvent);
    newEvent.save();
    res.redirect("/events/"+req.body.name);
  }

  else
  res.redirect("/addevent");
  })

  app.get("/events/:eventName",function(req,res){

    const eventName=req.params.eventName;
    currentEvent=eventName;

    let speakersList=[];
    Speaker.find().then(function(s){
      //console.log(s);
      speakersList=s;
      //console.log(speakersList);
    })


    Event.findOne({name:eventName}).then(function(currentEvent){
      res.render("events",{event1:currentEvent,speakersList1:speakersList});
    })
  })



  app.get("/events/:eventName/addspeaker",function(req,res){
    Event.findOne({name:req.params.eventName}).then(function(foundEvent){

      res.render("addspeaker",{currEvent1:foundEvent})
      
    })
  })

  app.post("/events/:eventName/addspeaker",function(req,res){

    let currSpeakers2=[];

    let eventName=req.params.eventName;
    Event.findOne({name:eventName}).then(function(foundEvent){
      currSpeakers2=foundEvent.speakers;

    })
    if(currSpeakers2.length==0)
    currSpeakers2=[];
    //console.log(currSpeakers2);

    let newSpeaker=new Speaker({

      speakername:req.body.speakername,
      twitter:req.body.twitter,
      linkedin:req.body.linkedin,
      imgURL:req.body.imgURL,
      company:req.body.company,
      designation:req.body.designation,
      website:req.body.website,
      bio:req.body.bio,
      speakerEmail:req.body.speakerEmail

    });
    newSpeaker.save();
    currSpeakers2.push(newSpeaker);
    
    Event.updateOne({name:req.params.eventName},{speakers:currSpeakers2}).exec();
    res.redirect("/events/"+req.params.eventName);
    
  })

  app.post("/events/:eventName/removespeaker",function(req,res){
      //console.log(req.body.speakerToRemove);
      let eventName=req.params.eventName;
      //try updateOne and see
      Event.updateOne({name:eventName}, {$pull: {speakers: {speakername: req.body.speakerToRemove}}}).exec();
      res.redirect("/events/"+eventName);
  })

  app.post("/events/:eventName/addexistingspeaker",function(req,res){
    let eventName=req.params.eventName;
    let speakerToAdd=req.body.existingspeaker;
    
    Speaker.findOne({speakername:speakerToAdd}).then(function(foundSpeaker){
      //console.log(foundSpeaker);
      Event.findOne({name:eventName}).then(function(foundEvent){
        foundEvent.speakers.push(foundSpeaker);
        foundEvent.save();
    })

  })
  res.redirect("/events/"+eventName);
})

  app.get("/view-event/:eventName",function(req,res){

    const eventName=req.params.eventName;
    currentEvent=eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      res.render("viewEvent",{event1:currentEvent,currUsers1:currUsers});
    })
  })


  app.get("/view-event/:eventName/RSVP",function(req,res){

    const eventName=req.params.eventName;
    currentEvent=eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      res.render("RSVP",{currUsers1:currUsers,event1:currentEvent});
    })
  })

  app.get("/speakers/:speakerName",function(req,res){

    const speakerName=req.params.speakerName;
    Speaker.findOne({speakername:speakerName}).then(function(currSpeaker){
      res.render("speaker",{speaker1:currSpeaker});
    })
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
      website:req.body.website,
      speakerEmail:req.body.speakerEmail
    }

    Speaker.updateOne({speakername:speakerToEdit},newDetails).exec();
    res.redirect("/events/"+currentEvent);
    
  })


  app.get("/editevent/:eventName",function(req,res){
    const eventName=req.params.eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      res.render("editevent",{eventToEdit:currentEvent});
    })
  })

  app.post("/editevent/:eventName",function(req,res){
    const updatedEvent={
      name:req.body.name,
      desc:req.body.desc,
      desc1:req.body.desc1,
      tags:req.body.tags,
      depts:req.body.depts,
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

  app.post("/view-event/:eventName/RSVP",function(req,res){

    let currEvent=req.params.eventName;

   const attendeeName=req.body.attendeeName;
   const attendeeUserName=req.body.attendeeUserName;
   const attendeeEmail=req.body.attendeeEmail;
   const attendeeYear=req.body.attendeeYear;
   const attendeeDeptStudent=req.body.attendeeDeptStudent;
   const attendeeDeptFaculty=req.body.attendeeDeptFaculty;

   const newAttendee={
    attendeeName:attendeeName,
    attendeeUserName:attendeeUserName,
    attendeeEmail:attendeeEmail,
    attendeeDeptStudent:attendeeDeptStudent,
    attendeeDeptFaculty:attendeeDeptFaculty,
    attendeeYear:attendeeYear
   };
   //console.log(newAttendee);

   User.updateOne({username:attendeeUserName},{name:attendeeName}).exec();

   Event.findOne({name:currEvent}).then(function(foundEvent){

     foundEvent.attendeesList.push(newAttendee);
     foundEvent.maxAttendees-=1;
     foundEvent.save();
     //console.log("List of attendees so far:"+foundEvent.attendeesList); 
     //res.redirect("/view-event/"+currEvent);
     currUserMail=attendeeEmail;
      res.redirect("/view-event/"+currEvent+"/invite");

   })

  })


  app.get("/view-event/:eventName/feedback",function(req,res){
    Event.findOne({name:req.params.eventName}).then(function(foundEvent){

      res.render("feedback",{currEvent1:foundEvent,currUsers1:currUsers})
      
    })
  })



  app.post("/view-event/:eventName/feedback",function(req,res){
    const newFeedback=new Feedback({
      eventName:req.body.eventName,
      experience:req.body.experience,
      content:req.body.content,
      expectations:req.body.expectations,
      engaging:req.body.engaging,
      improvement:req.body.improvement

    });
    newFeedback.save();
    res.redirect("/thankyou")

  })

  app.get("/thankyou",function(req,res){

    res.render("thankyou")
  })

  app.post("/addrecording",function(req,res){
    const video=req.body.video;
    const eventName=req.body.recording;
    Event.updateOne({name:eventName},{recording:video}).exec();
      res.redirect("/events/"+eventName);
  
  })

  app.get("/view-event/:eventName/cancelRSVP",function(req,res){

    const eventName=req.params.eventName;
    currentEvent=eventName;
    Event.findOne({name:eventName}).then(function(currentEvent){
      res.render("cancelRSVP",{event1:currentEvent,currUsers1:currUsers});
    })
  })

  app.post("/view-event/:eventName/cancelRSVP",function(req,res){

    const eventName=req.params.eventName;
    currentEvent=eventName;
    let attendees;
    //const studentToCancel1=req.body.studentToCancel;
    Event.findOne({name:req.params.eventName}).then(function(foundEvent){
      foundEvent.maxAttendees+=1;;
      foundEvent.save();
    })
    Event.updateOne({name:req.params.eventName}, {$pull: {attendeesList: {attendeeUserName: req.body.studentToCancel}}}).exec();

    res.redirect("/dashboard");

    
  })


  app.get("/editprofile",function(req,res){
    res.render("editprofile",{currUsers1:currUsers})
  })

  app.post("/editprofile",function(req,res){

    const editedProfile={
      name:req.body.name,
      username:req.body.username,
      email:req.body.email,
      year:req.body.year,
      dept:req.body.dept,
      preferredTopics:req.body.preferredTopics
    };
    User.updateOne({username:req.body.username},editedProfile).exec();
    res.redirect("/dashboard");

    
  })


  app.get("/view-event/:eventName/invite", async function(req,res){
    let currEvent1;
    Event.findOne({name:req.params.eventName}).then(function(foundEvent){
      currEvent1=foundEvent;
    })
    let testAccount=await nodemailer.createTestAccount();
    let transporter= await nodemailer.createTransport({
        host: process.env.HOST,
        port: 587,
        //secure: account.smtp.secure,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    });
    

    let message = {
      from: '"Amrita Vishwa Vidyapeetham" <amrita@amrita.edu>',
      to: currUserMail,
      subject: 'New Guest Lecture titled '+currEvent1.name
      
  };
  if(currEvent1.mode=='Offline'){

    message.html= '<h1>Amrita Vishwa Vidyapeetham presents '+currEvent1.name+'</h1><br><p>'+
      currEvent1.desc+'</p><p>Here are the details of the event:<br>Date:'+currEvent1.startdate+'-'+currEvent1.enddate+
      '<br>Timings:'+currEvent1.starttime+'-'+currEvent1.endtime+'<br>Venue:'+currEvent1.venue+'</p><p>Please RSVP at least 3 days before the event to receive important updates.<br>Find more information <a href="/view-event/'+
      currEvent1.name+'">here.</a><br>Regards,<br>Amrita Vishwa Vidyapeetham.'
  }

  else if(currEvent1.mode=='Online'){

    message.html= '<h1>Amrita Vishwa Vidyapeetham presents '+currEvent1.name+'</h1><br><p>'+
      currEvent1.desc+'</p><p>Here are the details of the event:<br>Date:'+currEvent1.startdate+'-'+currEvent1.enddate+
      '<br>Timings:'+currEvent1.starttime+'-'+currEvent1.endtime+'<br>Link to join:'+currEvent1.link+'</p><p>Please RSVP at least 3 days before the event to receive important updates.<br>Find more information <a href="/view-event/'+
      currEvent1.name+'">here.</a><br>Regards,<br>Amrita Vishwa Vidyapeetham.'
  }
  else{

    message.html= '<h1>Amrita Vishwa Vidyapeetham presents '+currEvent1.name+'</h1><br><p>'+
      currEvent1.desc+'</p><p>Here are the details of the event:<br><br>Date:'+currEvent1.startdate.DateString()+'-'+currEvent1.enddate.toDateString()+
      '<br>Timings:'+currEvent1.starttime+'-'+currEvent1.endtime+'<br>Venue:'+currEvent1.venue+'<br>Link to join:'+currEvent1.link+'</p><p>Please RSVP at least 3 days before the event to receive important updates.<br>Find more information <a href="/view-event/'+
      currEvent1.name+'">here.</a><br>Regards,<br>Amrita Vishwa Vidyapeetham.'
  }
    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });

      res.redirect("/view-event/"+req.params.eventName);

  })

  app.get("/forgotpwd",function(req,res){
    res.render("getemail");
  })


  app.post("/forgotpwd",async function(req,res){

    let currUserMail=req.body.email;
    

    let testAccount=await nodemailer.createTestAccount();
    let transporter= await nodemailer.createTransport({
        host: process.env.HOST,
        port: 587,
        //secure: account.smtp.secure,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS
        }
    });


    let message = {
      from: '"Amrita Vishwa Vidyapeetham" <amrita@amrita.edu>',
      to: currUserMail,
      subject: 'Change your password'
      
  };

    message.html= '<p> Dear student, </p><p> Click <a href="http://localhost:3000/new-password">this link</a> to redirect to the password change page, and follow the instructions to reset your password. </p> <br> <p>Regards,<br>Amrita Vishwa Vidyapeetham Guest Lecture Portal';

    transporter.sendMail(message, (err, info) => {
      if (err) {
          console.log('Error occurred. ' + err.message);
          return process.exit(1);
      }

      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });

  User.findOne({email:currUserMail}).then(function(foundUser){
    currUser=foundUser;
  })
  

    res.redirect("/forgotpwd");
  })

app.get("/new-password",function(req,res){
  res.render("newpwd",{currUser1:currUser});
})


app.post("/new-password",function(req,res){
  let createps1=req.body.pwd;
  let confirmps1=req.body.pwd1;
  bcrypt.hash(createps1,saltRounds,function(err,hash){
    if(createps1===confirmps1){

      User.updateOne({username:req.body.confirm},{createps:hash,confirmps:hash}).exec();
      res.redirect("/login");
    }
  })
})
app.listen(3000, function() {
    console.log("Server listening on port 3000 @ http://localhost:3000/ ");
  });
  