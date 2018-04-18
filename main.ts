import parse = require("csv-parse");
import flags = require("flags");
import xml = require('xml');
import * as fs from 'fs';
import * as path from 'path';
flags.defineString('input_dir', 'testdata', 'Folder that contains input files. All csv files in the folder will be parsed');
flags.defineString('output_dir', 'output', 'Folder to output files. Each input csv will have a corresponding output file');
flags.defineMultiString('input_file', [], 'Individual input file. This flag can be passed in multiple times');
flags.defineString('additional_predicate', '',
    `Additional predicate when filtering the messages. ` +
    `This will be appended to all "hasTheWords" field, and is useful when you need to filter based on label or between time`);

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
        if (flags.get('additional_predicate') && this.nameToColBiMap[i] == 'hasTheWord') {
          kvs.push({name: this.nameToColBiMap[i], value: colArray[i] + ' ' + flags.get('additional_predicate')});
        } else if (colArray[i]/*has content*/)
          kvs.push({name: this.nameToColBiMap[i], value: colArray[i]});
      }
    }
    if (label) {
      kvs.push({name: 'label', value: label});
    }

    return kvs;
  };

  public static kvsToEntry = function(kvs:object[]):object {
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
  public static entriesToGrandJson = function(entries): object {
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
  };

  public static jsonToXml = function(json: object): string {
    return xml(json, {declaration: {encoding: 'UTF-8'}, indent: '\t'});
  }
}
async function parseAsync(fileData, options):Promise<any> {
  return new Promise((resolve, reject) => {
    parse(fileData, options, function (err, rows) {
      if (!err) resolve(rows);
      else reject(err);
    });
  });
}
async function convert(inputFiles, output_dir) {
  let mergedEntries = [];
  for (let input_file of inputFiles) {
    let filepath = path.parse(input_file);
    let fileData = fs.readFileSync(input_file);
    let rows = await parseAsync(fileData, {trim:true});
        // Your CSV data is in an array of arrys passed to this callback as rows.
    let gen = new Generator(rows);
    let singleEntries = [];
    let valueRows = rows.slice(1);
    for (let row of valueRows) {
      let applyLabels = gen.getValueByColName(row, 'special:apply_labels');
      if (applyLabels && applyLabels.split(',').length > 0) {
        let labels = applyLabels.split(',');
        labels.forEach(label => {
          singleEntries.push(Generator.kvsToEntry(gen.rowToKvs(row, label)))
        });
      }
    }
    mergedEntries = mergedEntries.concat(singleEntries);
    let singleJson = Generator.entriesToGrandJson(singleEntries);
    let singleResult = Generator.jsonToXml(singleJson);
    fs.writeFileSync(output_dir + '/' + filepath.name + '.xml', singleResult); // write individual file
  }
  let mergedJson = Generator.entriesToGrandJson(mergedEntries);
  let mergedResult = Generator.jsonToXml(mergedJson);
  fs.writeFileSync(output_dir + '/' + '_merged.xml', mergedResult); // write individual file
  console.log(`Done!`);
}

function main() {
  flags.parse();
  console.assert(
      flags.get('input_file').length > 0 || flags.get('input_dir'),
      'Either --input_file or --input_dir needs to be specified');

  console.assert(
      flags.get('output_dir'),
      '--output_dir needs to be specified');
  let output_dir = flags.get('output_dir');
  let inputFiles = [];
  if (flags.get('input_file').length > 0) {
    inputFiles = flags.get('input_file');
  } else if (flags.get('input_dir')) {
    let ret = fs.readdirSync(flags.get('input_dir'));
    inputFiles = ret.filter(f => (f as string).endsWith('\.csv'))
        .map(file => flags.get('input_dir') + '/' + file); // TODO(zzn): use stable way to generate full path
  }
  convert(inputFiles, output_dir);

}

main();
