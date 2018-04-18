declare var require: any
const xml = require('xml');

function toJson(): object {
  return [
    {
      feed: [
        {
          _attr:
            {
              xmlns: 'http://www.w3.org/2005/Atom',
              'xmlns:apps': 'http://schemas.google.com/apps/2006'
            }
        },
        {title: 'Sample Filter 2'},
        {
          entry: [
            {
              category: [{_attr: {term: 'filter'}}]
            },
            {title: 'Mail Filter'},
            {content: ''},
            {
              'apps:property': {
                _attr: {
                  name: 'hasTheWord',
                  value: 'tom_anonymous2@newsletter.ftchinese.com',
                }
              }
            },
            {
              'apps:property': {
                _attr: {
                  name: 'label',
                  value: 'Notes/Selected News',
                }
              }
            }
          ]
        }
      ]
    }];

}

function jsonToXml(json: object): string {
  return xml(json, {declaration: {encoding: 'UTF-8'}, indent: '\t'});
}

function main() {
  let json = toJson();
  console.log(jsonToXml(json));
}

main();
