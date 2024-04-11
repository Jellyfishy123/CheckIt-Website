//const { getJson } = require("serpapi");


const api_key = "301f554c52f39fbdc0232a29b2f336b059e18c684ca5bb8084a6f1d80573eed0"

async function fetchData(){

  try{

      const eventName = document.getElementById("EventSearch").value.toLowerCase();
      eventLoc = document.getElementById("LocSearch").value.toLowerCase();
      if(!eventLoc == ""){
        eventLoc = " in " + eventLoc;
      }
      console.log(eventName.value);
      const response = await fetch(`https://serpapi.com/search.json?engine=google_events&q=${eventName}${eventLoc}&api_key=${api_key}`);

      if(!response.ok){
          throw new Error("Could not fetch resource");
      }
    

      const data = await response.json();
      console.log(data);
      

      const desc1 = data.events_results[0].title;
      const desc1Element = document.getElementById("desc1");
      desc1Element.innerHTML = desc1;
      const link1 = data.events_results[0].link;
      desc1Element.href = link1;
      desc1Element.style = "display:block;";
      
      const image1 = data.events_results[0].image;
      const imgElement = document.getElementById("img1");
      imgElement.src = image1;
      if(imgElement.naturalWidth!=0){      
        imgElement.style = "display:block;";
      }else{
        imgElement.src = "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg";
        imgElement.style = "display:block;";
      }
      

      
      const desc2 = data.events_results[1].title;
      const desc2Element = document.getElementById("desc2");
      desc2Element.innerHTML = desc2;
      const link2 = data.events_results[1].link;
      desc2Element.href = link2;
      desc2Element.style = "display:block;";
      
      const image2 = data.events_results[1].image;
      const img2Element = document.getElementById("img2");
      img2Element.src = image2;
      if(imgElement.naturalWidth!=0){      
        img2Element.style = "display:block;";
      }else{
        img2Element.src = "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg";
        img2Element.style = "display:block;";
      }


      const desc3 = data.events_results[2].title;
      const desc3Element = document.getElementById("desc3");
      desc3Element.innerHTML = desc3;
      const link3 = data.events_results[2].link;
      desc3Element.href = link3;
      desc3Element.style = "display:block;";
      
      const image3 = data.events_results[2].image;
      const img3Element = document.getElementById("img3");
      img3Element.src = image3;
      if(imgElement.naturalWidth!=0){      
        img3Element.style = "display:block;";
      }else{
        img3Element.src = "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg";
        img3Element.style = "display:block;";
      }

  }
  catch(error){
      console.error(error);
      


  }
}