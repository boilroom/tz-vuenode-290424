import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import YAML from 'yaml';

const PORT = 3002;
const DATA_PATH = path.join(process.cwd(), "./data");

const urlMasks = {
  'OPTIONS': [
    {
      mask: "/api/v1/card-template",
      handler: () => {
        return { status: 'ok' };
      }
    }
  ],
  'PUT': [
    {
      mask: "/api/v1/card-template",
      handler: (formData) => {
        const dataToWrite = YAML.stringify({
          template: formData.template,
          css: formData.css,
        });
        fs.writeFileSync(DATA_PATH + '/card-template.yml', dataToWrite);
        return formData;
      }
    }
  ],
  'GET': [
    {
      mask: "/api/v1/ping",
      handler: () => {
        return { status: 'ok', message: 'pong' };
      }
    },
    {
      mask: "/api/v1/card-template",
      handler: () => {
        const ymlData = fs.readFileSync(DATA_PATH + '/card-template.yml', 'utf8');
        const data = YAML.parse(ymlData);
        if (data.css) {
          data.css = data.css.replaceAll('} ', '}\n');
        }
        return data;
      }
    },
    {
      mask: "/api/v1/cards/(?<productID>\\d+)",
      handler: (routeData) => {
        const productsData = JSON.parse(fs.readFileSync(DATA_PATH + '/cards-data.json'), 'utf8');
        const findProduct = productsData.find((product) => product.id === parseInt(routeData.productID));
        return findProduct ? findProduct : null;
      }
    },
  ]
};

http
  .createServer(async (req, res) => {
    const formData = {};
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let outputResult = {
        status: 404,
        mime: 'text/plain',
        data: 'Error 404: Not Found',
      };
      if (body) {
        body.split('&').forEach((pair) => {
          const [key, value] = pair.split('=');
          formData[key] = decodeURIComponent(value.replaceAll(/\+/g, ' '));
        });
      }
      urlMasks[req.method.toUpperCase()]?.forEach((urlMask) => {
        const regex = new RegExp(`^${urlMask.mask.replace(/\//g, '\\/')}$`);
        const match = req.url.match(regex);
        if (match && typeof urlMask.handler === 'function') {
          const result = urlMask.handler(['PUT'].includes(req.method.toUpperCase()) ? formData : match.groups, req, res);
          if (result) {
            outputResult = {
              status: 200,
              mime: urlMask.mime || 'application/json',
              data: result,
            };
          }
        }
      });
      res.writeHead(outputResult.status, {
        'Content-Type': outputResult.mime,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET, PUT',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      if (outputResult.mime === 'application/json') {
        res.end(JSON.stringify(outputResult.data));
      } else {
        res.end(outputResult.data);
      }
    });
  })
  .listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);
