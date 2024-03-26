import requests
import datetime

lat = 1.3691
lon = 103.8454

url = "https://api.tomorrow.io/v4/weather/forecast?location={}%2C%20{}&timesteps=1h&units=metric&apikey=dOIp1fIQ6V6NJyOEr210VfbesFyZSkis".format(lat, lon)

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

# print(response.text)
print(response.json()["timelines"]["hourly"][1])