Since Budibase does not support a direct CSV import from FE a CSV to JSON JavaScript parser was implemented. 
Also MYSQL procedures that that can receive JSON text as input and use property values to insert data to db was implemented.

Information on requirements is bellow:

Update: 2023-02-17
==================

CSV specs
==========
- Row line in csv represents a table row. New lines [enter] in field values cannot not be used unless a special char (eg \n <br> ..) is used.
- Field values are seperated by seperator. Default Field seperator is ',' but can be configurable at JS script.
- Default value seperator (',') , rows are seperated by newline ([CR]LF). 
- First row in csv contains the column name colums names should be unquoted and seperated by same seperator used above. Any spaces before/after column names will be trimmed.
- Values are considered the content between seperators. If seperator char need to be in value the value should be inside double quotes eg. "blahblah,blah,blah" and no space should exist before/after, otherwise quotes are treated as part of the value.
- Spaces before after value are kept if not in quotes.
- Default quote character is considered double quote ("). This can be also configured at JS script. 


CsvToJson parser will treat field values as follows:
-----------------------------------------------------
* Seperator and quote character are configurable at the csvToJson function.
* empty as null, "" as empty string.
* numeric, double as number if unquoted
* true, false as boolean true, false if unquoted.
* anything else as string. 
* If value is within quote chars (") and no space exists before first and after last quote, value in quotes is used otherwise all letters between 2 seperators are considered field value. Quote and seperator character is allowed between the 2 quotes enclosing the field value. Better avoid it.
* New lines chars in quoted values are tested to be supported but not suggested.



