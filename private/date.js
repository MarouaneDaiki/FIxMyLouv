function date(){
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
  
    document.getElementById("current_day").innerHTML = day + "/" + (month+1) + "/" + year;
}