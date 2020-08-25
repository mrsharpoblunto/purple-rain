# Purple-Rain
Control Hue lights in a room to show the current air quality from Purpleair.com

# Running
- Copy/clone the source across to a Raspberry Pi running Raspbian
- Run ```cp config.default.json config.json``` and then open config.json and ensure the Philips Hue bridge IP/UserId & Hue light configuration matches what you have
- Run ```node index.js```
