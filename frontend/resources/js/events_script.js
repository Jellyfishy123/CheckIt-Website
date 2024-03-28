const { getJson } = require("serpapi");


const api_key = "301f554c52f39fbdc0232a29b2f336b059e18c684ca5bb8084a6f1d80573eed0"

const formEl = document.querySelector("form")
const inputEl1 = document.getElementById("EventSearch")
const inputEl2 = document.getElementById("LocSearch")
const inputEl3 = document.getElementById("dateSearch")

const searchResults = document.querySelector(".search-results")
const showMore = document.getElementById("show-more-button")

let inputData = ""
let pageNo = 1;





async function searchImages() {
    inputData = inputEl1.value;
    const url = `https://serpapi.com/search.json?engine=google_events&q=${inputData}&hl=en&api_key=${api_key}`;
    
    getJson({
        engine: "google_events",
        q: inputEl1.value,
        hl: "en",
        //gl: "us",
        api_key: "301f554c52f39fbdc0232a29b2f336b059e18c684ca5bb8084a6f1d80573eed0"
      }, (json) => {
        console.log(json["events_results"]);
      });
    const events_results = await fetch(url);
    const data = await events_results.json();
  
    const results = data.events_results;
  
    if (page === 1) {
      searchResults.innerHTML = "";
    }
  
    results.map((result) => {
      const imageWrapper = document.createElement("div");
      imageWrapper.classList.add("search-result");
      const image = document.createElement("img");
      image.src = result.thumbnail;
      image.alt = "";
      const imageLink = document.createElement("a");
      imageLink.href = result.link;
      imageLink.target = "_blank";
      imageLink.textContent = result.title;
  
      imageWrapper.appendChild(image);
      imageWrapper.appendChild(imageLink);
      searchResults.appendChild(imageWrapper);
    });
  
    page++;
    if (page > 1) {
      showMore.style.display = "block";
    }
  }
  
  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    //page = 1;
    searchImages();
  });
  
  showMore.addEventListener("click", () => {
    searchImages();
  });