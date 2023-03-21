function setInvalid(){
    var pattern=/^[A-Za-z]\w{8,16}$/;
    if(!(document.signupform.createps.value)===(document.signupform.createps.value))
    document.getElementById("invalid").innerHTML=("Passwords don't match")
    else if(!(document.signupform.createps.value.match(pattern)))
    document.getElementById("invalid").innerHTML=("Passwords don't follow the constraints")


}