/**
 * @format
 */
const http = require('http');
const https = require('https');
const path = require('path');
const {
  bridgeIp,
  userId,
  light,
  sensorIds,
} = require('./config.json');

class HueAPI {
  constructor(bridge, user) {
    this.bridge = bridge;
    this.user = user;
  }
  getGroups() {
    return this._httpGet('/groups');
  }
  getGroup(groupId) {
    return this._httpGet(`/groups/${groupId}`);
  }
  putGroup(groupId, data) {
    return this._httpPut(`/groups/${groupId}/action`, data);
  }
  putLight(lightId, data) {
    return this._httpPut(`/lights/${lightId}/state`, data);
  }
  _httpGet(path) {
    return new Promise((resolve, reject) => {
      http
        .get(
          {
            host: this.bridge,
            port: 80,
            path: '/api/' + this.user + path,
          },
          res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', data => {
              body += data;
            });
            res.on('end', () => {
              let parsed;
              try {
                parsed = JSON.parse(body);
              } catch (ex) {}
              resolve({statusCode: res.statusCode, body: parsed || body});
            });
          },
        )
        .on('error', e => {
          reject(e);
        });
    });
  }
  _httpPut(path, data) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: this.bridge,
          port: 80,
          method: 'PUT',
          path: '/api/' + this.user + path,
          headers: {'Content-Type': 'application/json'},
        },
        res => {
          res.setEncoding('utf8');
          let body = '';
          res.on('data', data => {
            body += data;
          });
          res.on('end', () => {
            let parsed;
            try {
              parsed = JSON.parse(body);
            } catch (ex) {}
            resolve({statusCode: res.statusCode, body: parsed || body});
          });
        },
      );
      req.on('error', e => {
        reject(e);
      });
      req.write(JSON.stringify(data));
      req.end();
    });
  }
}


async function getAirQuality() {
  let result = 0;
  let resultLength = 0;
  for (const s of sensorIds) {
    try {
      const r = await new Promise((resolve, reject) => {
          https.get(
            {
              host: 'www.purpleair.com',
              port: 443,
              path: '/json?show=' + s,
            },
            res => {
              res.setEncoding('utf8');
              let body = '';
              res.on('data', data => {
                body += data;
              });
              res.on('end', () => {
                let parsed;
                try {
                  parsed = JSON.parse(body);
                } catch (ex) {}
                resolve({statusCode: res.statusCode, body: parsed || body});
              });
            },
          )
          .on('error', e => {
            reject(e);
          });
        });
      result += JSON.parse(r.body.results[0].Stats).v1;
      ++resultLength;
    } catch (ex) {
      console.error(ex);
    }
  }
  return result / resultLength;
}

function colorForP25(p25) {
  // based on https://www3.epa.gov/airnow/aqi-technical-assistance-document-sept2018.pdf, Table 4
  return  p25 <=   6.0 ? 19236 
        : p25 <=  12.0 ? 14927//     - 50
        : p25 <=  35.4 ? 10922  //  51 - 100
        : p25 <=  55.4 ? 4733  // 101 - 150
        : p25 <= 150.4 ? 910     // 151 - 200
        : p25 <= 250.4 ? 60801  // 201 - 300
        : 63532;  
}

async function run(api) {
  console.log('Getting air quality data...');
  const q = await getAirQuality();
  const hue = colorForP25(q);
  console.log('Updating light color...');
  await api['put' + light.type](light.id, {
    hue: hue,
  });
}


const api = new HueAPI(bridgeIp, userId);
run(api);
