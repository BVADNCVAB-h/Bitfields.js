# Bitfields.js
Mapping Bitfields onto Byte Array and vice versa in JavaScript

## Library Interface Notation
```java
namespace NspBitFields {
    class BitFieldsPresets {
        public:
            Constructor() {}
            Object errs;
            Object warns;
            Function errorHandler;         //Function(String)//
            Function warningHandler;       //Function(String)//
            Constructor byteArray;         //default=Array.prototype.constructor//
            Constructor fieldArray;        //default=Array.prototype.constructor//
    }
    class BitFieldsFormat {
        public:
            Constructor( Optional float byteLen_bytes = 1.0, Optional BitFieldsPresets bfPresets ) {}
            String[] propertiesNames = {
                "lenDefined",         //boolean, default=true//
                "lenAligned",         //boolean, default=true//
                "valsDefined",        //boolean, default=true//
                "fieldRepeats",       //integer//
                "bytesNumber"         //integer//
            }
            BitFieldsFormat addField( String name, int size_bits ) {}
            BitFieldsFormat modField( String name, int size_bits ) {}
            BitFieldsFormat addFields( Object fields ) {}
            BitFieldsFormat modFields( Object fields ) {}
            BitFieldsFormat skipFields() {}
            BitFieldsFormat setProperty( String property, Variant value ) {}
            BitFieldsFormat setProperties( Object properties ) {}
            Variant getProperty( String property ) {}
    }
    class BitFields {
        public:
            Constructor( BitFieldsFormat bfFormat, Optional BitFieldsPresets bfPresets ) {}
            int getRowNum() {}
            int getRowSize() {}
            int getTotalSize() {}
            int getValue( Optional int index = 0, String fieldName ) {}
            Object getValues( Optional int index = 0 ) {}
            BitFields getValues( Optional int index = 0, Object outputObj ) {}
            BitFields setValue( Optional int index = 0, String fieldName, int value ) {}
            BitFields setValues( Optional int index = 0, Object values ) {}
            BitFields skipValues() {}
            BitFields setBytes( Indexed bytes, Optional int fromIndex, Optional int toIndex ) {}
            BitFields setBytes( String bytes, Optional int fromIndex, Optional int toIndex ) {}
            Indexed getBytes() {}
            class {
                Indexed getValues() {}
                BitFields setValues( Indexed values ) {}
            } selName( String fieldName ) {}
    }
}
```
## Light version 
Light version has the same functionality and interface but does not provide any kind of type control or consistency check of input data.
## Description
The library is used for representing given sequence of bits in two formats: table with variable-sized columns ( "fields" ) and linear sequence of same-sized cells ( "bytes" ), in order to convert one to the other. 
Using C syntax it could be described this way:
```c
union {
    char bytes[ bytesNumber ];
    struct {
        int fieldA: SIZE_A;
        int fieldB: SIZE_B;
        int fieldC: SIZE_C;
    } fields[ fieldRepeats ];
};
/*
*Comments on disposal order of fields:
*Unlike implementations of bit fields in C/C++ 
*where fields are placed in reverse order (right-to-left), 
*left-to-right order is used here
*(as one unfamiliar with C or C++ would expect)
*/
```
## Limitations
Maximal field size -- 30 bits, maximal char/byte size -- 30 bits
## Usage
### Creating instances
##### Functionality is divided into 3 "classes" -- <i>BitFieldsPresets</i>, <i>BitFieldsFormat</i> and <i>BitFields</i>. In browser environment, they are grouped under the "namespace" <i>NspBitFields</i>. <i>BitFieldsFormat</i> constructor can be initialized with value defining byte size in bytes ( 1 by default ). <i>BitFields</i> constructor must be supplied with an instance of <i>BitFieldsFormat</i>
```javascript
var bfPresets = new NspBitFields.BitFieldsPresets();
/*defining presets here*/
var bfFormat = new NspBitFields.BitFieldsFormat(7/8); //byte size of 7 bits//
/*defining format here*/
/*defining presets here*/
var bf = new NspBitFields.BitFields( bfFormat, bfPresets ); //preset optional//
```
### Defining sizes of bit fields
##### <i>BitFieldsFormat</i> methods <i>addField()</i> and <i>addFields()</i> are used
```javascript
bfFormat.addFields({
  testNum: 12,
  rightAnsw: 8,
  allAnsw: 8,
}).setProperties({
  lenDefined: false,
});
```
### Mapping Byte Array onto Bit Fields
##### <i>BitFields</i> methods <i>setBytes()</i>, <i>getValue()</i> and <i>getValues()</i> are used 
```javascript
var inputData = [ 0, 4, 10, 7, 0, 8, 12, 9 ];
var rownum = bf.setBytes( inputData ).getRowNum();
var outputData = [];
for ( var i=0; i < rownum; i++ ) {
  outputData[i] = bf.getValues(i);
}
console.log( outputData[0], outputData[1] );
/* Object { testNum: 1, rightAnsw: 5, allAnsw: 7 } Object { testNum: 2, rightAnsw: 6, allAnsw: 9 } */
```
### Mapping Bit Fields onto Byte Array
##### <i>BitFields</i> methods <i>setValue()</i>, <i>setValues()</i> and <i>getBytes()</i> are used
```javascript
var i = -1;
bf.setValues(++i, { 
  testNum: 1, 
  rightAnsw: 5, 
  allAnsw: 7 }
).setValues(++i, {
  testNum: 2, 
  rightAnsw: 6, 
  allAnsw: 9 
});
console.log( bf.getBytes() );
/* Array [ 0, 4, 10, 7, 0, 8, 12, 9 ] */
```
### Setting/Retrieving values of specific field
##### <i>BitFields</i> methods <i>selName().setValues()</i> and <i>selName().getValues()</i> are used
```javascript
bf.setBytes( new Uint8Array([ 0, 4, 10, 7, 0, 8, 12, 9 ]) );
var outputData = bf.selName( 'rightAnsw' ).getValues();
console.log( outputData );
/* Array [ 5, 6 ] */
outputData = bf.selName( 'rightAnsw' ).setValues([4, 5]).getBytes();
console.log( outputData );
/* Array [ 0, 4, 8, 7, 0, 8, 10, 9 ] */
```
### Strings as Byte Arrays
##### <i>BitFields</i> methods <i>setBytes()</i> and <i>valueOf()</i> are used
```javascript
/* byte size must be 8 bits */
var bfFormat = new NspBitFields.BitFieldsFormat(8/8);
bfFormat.addFields({a: 8, b: 8, c: 8}).setProperty('fieldRepeats', 2);
var bf = new NspBitFields.BitFields( bfFormat );
/* -------------------------- */
bf.setBytes( '123456' );
bf.selName( 'a' ).setValues([ 97, 100 ]);
console.log( bf.valueOf() );
/* a23d56 */
```
