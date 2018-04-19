# Gmail Filter XML Generator

## Intro

Ever want to create Gmail Filter XML by editing a spreadsheet or excel file? 
This program gives you an easy way to generate Gmail Filter XML files based on a CSV input.
It can take single multiple files, or a folder of input and output individial files and 
merged XML files to be easily imported to Gmail Filter.

See Gmail Help Doc [^1].

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

For more advanced usage of search operators, see [^2].

## Questions

For questions please contact `github+gmail_filter_gen@zzn.im`


## Further Developoment

1. Add a label for all auto-archived email for debugging purposes
2. Add title to xml file and title to each entry from notes
3. Shoot a video (less than 30s) introducing the usage.

## Reference

[^1]: [Gmail Help: Create rules to filter your emails](https://support.google.com/mail/answer/6579?hl=en)
[^2] [Gmail Help: Search operators you can use with Gmail](https://support.google.com/mail/answer/7190?hl=en)
