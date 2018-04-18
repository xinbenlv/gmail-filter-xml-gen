declare var require: any
const xml = require('xml');
const fs = require('fs');
const SAMPLE_ENTRY =
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
    };

class Generator {
  private nameToColBiMap = {};
  constructor(headRow) {
    this.buildNameToColBiMap(headRow);
  }

  /**
   * NOTE: Assuming there is no pure number int header row, and there is no quote
   * @param headRow
   */
  private buildNameToColBiMap = function(rows:string[][]) {
    let cols = rows[0];
    for (let i = 0; i < cols.length; i++) {
      this.nameToColBiMap[cols[i]] = i;
      this.nameToColBiMap[i] = cols[i];
    }
  };

  public getValueByColName = function(colArray, colName) {
    return colArray[this.nameToColBiMap[colName]];
  };

  public rowToKvs = function(row:string[], label):object[] {
    let colArray:string[] = row;
    let kvs:object[] = [];
    for (let i = 0; i < colArray.length; i++) {
      if (this.nameToColBiMap[i].startsWith('special:')) {
        let specialHead = this.nameToColBiMap[i].slice(8);
        if (specialHead == 'important') {
          // handle 'important
          if (colArray[i] == 'always') {
            kvs.push({name: 'shouldAlwaysMarkAsImportant', value: 'true'})
          } else if (colArray[i] == 'never') {
            kvs.push({name: 'shouldNeverMarkAsImportant', value: 'true'})
          }
        } else if (specialHead == 'apply_labels') {
          // ignore handle outside
        }
      } else {
        if (colArray[i]/*has content*/)
          kvs.push({name: this.nameToColBiMap[i], value: colArray[i]});
      }
    }
    if (label) {
      kvs.push({name: 'label', value: label});
    }

    return kvs;
  };

  public kvsToEntry = function(kvs:object[]):object {
    let ret = {
      entry : [
        {
          category: [{_attr: {term: 'filter'}}]
        },
        {title: 'Mail Filter'},
        {content: ''}
      ]
    };
    kvs.forEach((obj:any) => {
      (ret.entry as object[]).push({
        'apps:property': {
          _attr: {
            name: obj.name,
            value: obj.value,
          }
        }
      });
    });
    return ret;

  };
  public entriesToGrandJson = function(entries): object {
    let ret = [
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
        ]
      }];
    entries.forEach(e => ret[0].feed.push(e));
    return ret;
  }

  public jsonToXml = function(json: object): string {
    return xml(json, {declaration: {encoding: 'UTF-8'}, indent: '\t'});
  }
}


function main() {
  const fs = require('fs');
  const parse = require('csv-parse');
  fs.readFile('testdata/sample-input.csv', function (err, fileData) {
    parse(fileData, {trim: true}, function(err, rows) {
      // Your CSV data is in an array of arrys passed to this callback as rows.

      let gen = new Generator(rows);
      let entries = [];
      let valueRows = rows.slice(1);
      for (let row of valueRows){
        let applyLabels = gen.getValueByColName(row, 'special:apply_labels');
        if (applyLabels && applyLabels.split(',').length > 0) {
          let labels = applyLabels.split(',');
          labels.forEach(label => {
            entries.push(gen.kvsToEntry(gen.rowToKvs(row, label)))
          });
        }
      };
      let json = gen.entriesToGrandJson(entries);
      let result = gen.jsonToXml(json);
      console.log(result);
    })
  });

}

main();
