class LocationService {
    static searchLocation(searchVal) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(false);
            const xhr = new XMLHttpRequest();
            const encodedSearchVal = encodeURIComponent(searchVal);
           
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === this.DONE) {
                    if (this.status === 200) {
                        resolve(JSON.parse(this.responseText).results);
                    } else {
                        reject(new Error('Error occurred while fetching location data'));
                    }
                }
            });

            xhr.open("GET", `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodedSearchVal}&returnGeom=N&getAddrDetails=Y&pageNum=1`);
            xhr.send(data);
        });
    }
}
export default LocationService;