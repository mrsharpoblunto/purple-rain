# Purple-Rain
Control Hue lights in a room to show the current air quality from Purpleair.com

# Running
- Copy/clone the source across to a Raspberry Pi running Raspbian
- Run ```cp config.default.json config.json``` and then open config.json and ensure the Philips Hue bridge IP/UserId & Hue light configuration matches what you have
- Go to www.purpleair.com, and get the id's of the closest few sensors to your location and add them to the sensorIds array in the config
- Run ```node index.js```
