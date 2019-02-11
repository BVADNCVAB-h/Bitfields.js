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
			Function errorHandler; 		//Function(String)//
			Function warningHandler; 	//Function(String)//
			Constructor byteArray;  	//default=Array.prototype.constructor//
			Constructor fieldArray;  	//default=Array.prototype.constructor//
	}
	class BitFieldsFormat {
		public:
			Constructor( Optional float byteLen_bytes = 1.0, Optional BitFieldsPresets bfPresets ) {}
			String[] propertiesNames = {
				"lenDefined", 		//boolean, default=true//
				"lenAligned", 		//boolean, default=true//
				"valsDefined", 		//boolean, default=true//
				"fieldRepeats", 	//integer//
				"bytesNumber" 		//integer//
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

## Usage
### Creating instances
```javascript
var bfPresets = new NspBitFields.BitFieldsPresets();
/*defining presets here*/
var bfFormat = new NspBitFields.BitFieldsFormat(7/8); //byte size of 7//
/*defining format here*/
/*defining presets here*/
var bf = new NspBitFields.BitFields( bfFormat, bfPresets ); //preset optional//
```
### Defining sizes of bit fields
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
```javascript
var inputData = [
  { testNum: 1, rightAnsw: 5, allAnsw: 7 },
  { testNum: 2, rightAnsw: 6, allAnsw: 9 },
];
for ( var i=0; i < inputData.length; i++ ) {
  bf.setValues(i, inputData[i]);
}
var outputData = bf.getBytes();
console.log( outputData );
/* Array [ 0, 4, 10, 7, 0, 8, 12, 9 ] */
```
### Setting/Retrieving values of specific field
```javascript
bf.setBytes( new Uint8Array([ 0, 4, 10, 7, 0, 8, 12, 9 ]) );
var outputData = bf.selName( 'rightAnsw' ).getValues();
console.log( outputData );
/* Array [ 5, 6 ] */
outputData = bf.selName( 'rightAnsw' ).setValues([4, 5]).getBytes();
console.log( outputData );
/* Array [ 0, 4, 8, 7, 0, 8, 10, 9 ] */
```
