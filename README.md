# Gmail CSV to XML

## Intro

This tool provides an easy way to generate a Gmail Filter XML based on a CSV input.

## Usage
1. Follow the example of this repository `/testdata/sample-filter.csv`, 
create a CSV for your filter configuration.

2. Run the `main.ts`
```bash
ts-node main.ts --input_file=[your_csv_file]
```
3. Find your output xml file in the `output` folder.

4. Follow the vidoe here to import the gmail filter from xml you generated.
[![Video: Import Gmail filter from XML file](http://img.youtube.com/vi/bqtqKcJXYxQ/0.jpg)](https://youtu.be/bqtqKcJXYxQ?t=32s)
## Questions

For questions please contact github+gmail_filter_gen@zzn.im



## Further Developoment
1. Add a label for all auto-archived email for debugging purposes
2. Shot a video introducing the useage.

## Reference
* [Gmail Help: Create rules to filter your emails](https://support.google.com/mail/answer/6579?hl=en)
* [Gmail Help: Search operators you can use with Gmail](https://support.google.com/mail/answer/7190?hl=en)