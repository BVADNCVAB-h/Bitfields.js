var NspBitFields = new (function() {
	'use strict';
	var MAX_BIT_SEQUENCE = 30;
	var nsp = this;
	//--------------------------------------------------------//
	var VALUE = 'value';
	var BIT_FIELDS_PRESETS = 'BitFieldsPresets';
	var CONSTRUCTOR = 'constructor';
	var LENGTH = 'length';
	var PROTOTYPE = 'prototype';
	var SIZE = 'size';
	var NAME = 'name';
	var FIELDS_INDEX = 'fieldsIndex';
	var FIELDS = 'fields';
	var FIELDS_SIZE = 'fieldsSize';
	var PUSH = 'push';
	//--------------------------------------------------------//
	var FALSE = FALSE;
	var TRUE = TRUE;
	var UDF_VAL = undefined;
	//--------------------------------------------------------//
	var floor = Math.floor;
	var ceil = Math.ceil;
	var toStr = Object[ PROTOTYPE ].toString;
	//---------------type--control--functions-----------------//
	var toStrReturns = {
		stringType: '[object String]',
		numberType: '[object Number]',
	};
	var isBoolean = function( value ) {
		return (value === TRUE || value === FALSE);
	};
	var isNumber = function( value ) {
		return ( toStr.call( value ) === toStrReturns.numberType );
	};
	var isString = function( value ) {
		return ( toStr.call( value ) === toStrReturns.stringType );
	};
	var isPrimitive = function( value ) {
		return isBoolean( value ) || isNumber( value ) || isString( value );
	};
	var NOT_SET = null;
	var NOT_SET_EQUAL = [ NOT_SET, UDF_VAL ];
	var isSet = function( value ) {
		return (NOT_SET_EQUAL.indexOf( value ) < 0);
	};
	var nspId = 'NSP'+('00000'+floor(Math.random()*1000000)).slice(-6);
	//---------------------------------------------------------//
	var BitFieldsConstPresets = {
		errs: function() {
			return {};
		},
		warns: function() {
			return {};
		},
		errorHandler: function() {
			return function( msg ) {
				return FALSE;
			};
		},
		warningHandler: function() {
			return function ( msg ) {
				return null;
			};
		},
		byteArray: function() {
			return Array[ PROTOTYPE ][ CONSTRUCTOR ];
		},
		fieldArray: function() {
			return Array[ PROTOTYPE ][ CONSTRUCTOR ];
		},
	};
	//-------------------------------------------------------//
	//-----------------ACCESSORY--CLASSES--------------------//
	//-------------------------------------------------------//
	this[ BIT_FIELDS_PRESETS ] = function() {
		var PSC = BitFieldsConstPresets;
		for ( var i in PSC ) this[i] = PSC[i]();
	};
	this.BitFieldsFormat = function( /*opt*/ byteLen /*Bytes*/, /*opt*/ bfPresets ) {
		var self = this;
		//----------------------PRIVATE--FIELDS-------------------------------//
		var byteLenBits;
		var pointer = 0;
		var fieldsSize = 0;
		var properties = {
			lenDefined: 	{ value: TRUE },
			lenAligned: 	{ value: TRUE },
			valsDefined:	{ value: TRUE },
			firstIndexOne:	{ value: FALSE },
			fieldsSize: 	{ value: 0 },
			byteLenBits: 	{ value: NOT_SET },
			fieldRepeats: 	{ value: NOT_SET },
			bytesNumber: 	{ value: NOT_SET },
		};
		//-----------------"PACKAGE--LEVEL"--FIELDS-----------------------//
		self[ nspId ] = {
			fields: [],
			fieldsIndex: {},
		}
		//----------------------CONSTRUCTOR-------------------------------//
		if ( byteLen !== UDF_VAL && bfPresets === UDF_VAL ) {
			if ( byteLen instanceof nsp[ BIT_FIELDS_PRESETS ] ) {
				bfPresets = byteLen;
				byteLen = UDF_VAL;
			}
		}
		if ( bfPresets === UDF_VAL ) {
			bfPresets = new nsp[ BIT_FIELDS_PRESETS ]();
		}
		if ( byteLen === UDF_VAL ) {
			byteLen = 1;
		}
		var tByteLenBits = byteLen * 8;
		properties.byteLenBits[ VALUE ] = Math.round( tByteLenBits );
		//--------------------PUBLIC--METHODS---------------------------//
		self.addField = function( name, size /*Bits*/ ) {
			self[ nspId ][ FIELDS_INDEX ][ name ] = self[ nspId ][ FIELDS ][
				self[ nspId ][ FIELDS ][ PUSH ]( { name: name, size: size } ) - 1
			];
			properties[ FIELDS_SIZE ][ VALUE ] += size;
			return self;
		};
		self.modField = function( name, size /*Bits*/ ) {
			properties[ FIELDS_SIZE ][ VALUE ] += size - self[ nspId ][ FIELDS_INDEX ][ name ][ SIZE ];
			self[ nspId ][ FIELDS_INDEX ][ name ][ SIZE ] = size;
			return self;
		};
		self.addFields = function( fieldsPassed ) {
			for ( var name in fieldsPassed ) {
				self.addField( name, fieldsPassed[ name ] );
			}
			return self;
		};
		self.modFields = function( fieldsPassed ) {
			for ( var name in fieldsPassed ) {
				self.modField( name, fieldsPassed[ name ] );
			}
			return self;
		};
		self.skipFields = function() {
			properties[ FIELDS_SIZE ][ VALUE ] = 0;
			self[ nspId ][ FIELDS_INDEX ] = {};
			self[ nspId ][ FIELDS ] = [];
			return self;
		};
		self.setProperty = function( property, value ) {
			properties[ property ][ VALUE ] = value;
			return self;
		};
		self.setProperties = function( propertiesPassed ) {
			for ( var i in propertiesPassed ) {
				properties[ i ][ VALUE ] = propertiesPassed[i];
			}
			return self;
		};
		self.getProperty = function( property ) {
			return properties[ property ][ VALUE ];
		};
	};
	//-----------------------------------------------------//
	//-----------------------MAIN--CLASS-------------------//
	//-----------------------------------------------------//
	this.BitFields = function( bfFormat, /*optional*/ bfPresets ) {
		var self = this;
		//-----------------PRIVATE--FIELDS-----------------//
		var lenDefined;
		var lenAligned;
		var valsDefined;
		var fieldsSize;
		var byteLenBits;
		var fieldRepeats;
		var bytesNumber;
		var currFieldRepeats;
		var firstIndexOne;
		var iFirst;
		var fields = [];
		var fieldsSet = {};
		var fieldsIndex = {};
		//--------------PRIVATE--METHODS-----------------//
		var allocFields = function( fieldRepeats ) {
			for ( var i=0; i < fields[ LENGTH ]; i++ ) {
				fields[i][ VALUE ] = [];
				fieldsSet[ fields[i][ NAME ] ] = [];
				for ( var j=0; j < fieldRepeats; j++ ) {
					fields[i][ VALUE ][j] = 0;
					fieldsSet[ fields[i][ NAME ] ][j] = TRUE;
				}
			}
		};
		//------------------CONSTRUCTOR--------------------//
		if ( bfPresets === UDF_VAL ) {
			bfPresets = new nsp[ BIT_FIELDS_PRESETS ]();
		}
		for ( var name in bfFormat[ nspId ][ FIELDS_INDEX ] ) {
			var size = bfFormat[ nspId ][ FIELDS_INDEX ][ name ][ SIZE ];
			fieldsIndex[ name ] = fields[
				fields[ PUSH ]( { name: name, size: size, value: [] } ) - 1
			];
			fieldsSet[ name ] = [];
		}
		var getFP = bfFormat.getProperty;
		lenDefined = getFP('lenDefined');
		lenAligned = getFP('lenAligned');
		valsDefined = getFP('valsDefined');
		fieldsSize = getFP('fieldsSize');
		byteLenBits = getFP('byteLenBits');
		fieldRepeats = getFP('fieldRepeats');
		bytesNumber = getFP('bytesNumber');
		firstIndexOne = getFP('firstIndexOne');
		var fieldRepeatsSet = isSet( fieldRepeats );
		var bytesNumberSet = isSet( bytesNumber );
		var tBytesNumber, tFieldRepeats;
		if ( lenDefined ) {
			if ( fieldRepeatsSet ) {
				var tFieldsOverall = fieldsSize * fieldRepeats;
				tBytesNumber = ceil( tFieldsOverall / byteLenBits );
			}
			if ( bytesNumberSet ) {
				var tBytesOverall = byteLenBits * bytesNumber;
				tFieldRepeats = floor( tBytesOverall / fieldsSize );
			}
			if ( !(fieldRepeatsSet && bytesNumberSet) ) {
				if ( fieldRepeatsSet ) {
					bytesNumber = tBytesNumber;
				}
				if ( bytesNumberSet ) {
					fieldRepeats = tFieldRepeats;
				}
			}
		}
		currFieldRepeats = ( lenDefined ) ? fieldRepeats : 0; 
		iFirst = ( firstIndexOne ) ? 1 : 0;
		//--------------CONSTRUCTOR--END-----------------//
		//---------------PUBLIC--METHODS-----------------//
		self.getRowNum = function() {
			return currFieldRepeats;
		};
		self.getRowSize = function() {
			return fieldsSize;
		};
		self.getTotalSize = function() {
			return fieldsSize * currFieldRepeats;
		};
		self.getBytesNum = function() {
			return bytesNumber;
		};
		self.setValue = function( /*optional*/ index, name, value ) {
			if ( value === UDF_VAL ) {
				value = name;
				name = index;
				index = iFirst;
			}
			index -= iFirst;
			fieldsIndex[ name ][ VALUE ][ index ] = value;
			fieldsSet[ name ][ index ] = TRUE;
			if ( !lenDefined && index+1 > currFieldRepeats )
				currFieldRepeats = index+1;
			return self;
		};
		self.setValues = function( /*optional*/ index, valuesObj ) {
			if ( valuesObj === UDF_VAL ) {
				valuesObj = index;
				index = iFirst;
			}
			index -= iFirst;
			for ( var name in valuesObj ) {
				if ( !isSet(valuesObj[ name ]) ) continue;
				fieldsIndex[ name ][ VALUE ][ index ] = valuesObj[ name ];
				fieldsSet[ name ][ index ] = TRUE;
			}
			if ( !lenDefined && index+1 > currFieldRepeats )
				currFieldRepeats = index+1;
			return self;
		};
		self.getValue = function( /*optional*/ index, name ) {
			if ( name === UDF_VAL ) {
				name = index;
				index = iFirst;
			}
			index -= iFirst;
			var value = fieldsIndex[ name ][ VALUE ][ index ];
			if ( fieldsSet[ name ][ index ] !== TRUE ) value = 0;
			return value;
		};
		self.getValues = function( /*opt*/ index, /*opt*/ outputObj ) {
			var maxIndex = currFieldRepeats + iFirst - 1;
			var argOutput = TRUE;
			if ( !isSet(outputObj) ) {
				if ( isSet(index) && !isPrimitive(index) ) {
					outputObj = index;
					index = UDF_VAL;
				} else {
					outputObj = {};
					argOutput = FALSE;
				}
			}
			if ( !isSet(index) ) index = iFirst;
			index -= iFirst;
			for ( var i in fieldsIndex ) {
				var value = fieldsIndex[ i ][ VALUE ][ index ];
				if ( fieldsSet[ i ][ index ] !== TRUE ) value = 0;
				outputObj[i] = value;
			}
			if ( argOutput ) return self;
			else return outputObj;
		};
		self.skipValues = function() {
			for ( var i=0; i < fields[ LENGTH ]; i++ ) {
				fields[i][ VALUE ] = [];
				fieldsSet[ fields[i][ NAME ] ] = [];
			}
			if ( !lenDefined ) currFieldRepeats = 0;
			return self;
		};
		self.selName = function( name ) {
			return new(function(name) {
				this.setValues = function( valuesArr ) {
					var lastIndex = valuesArr[ LENGTH ] - 1;
					if ( lastIndex < 0 ) return self;
					for ( var i=0; i <= lastIndex; i++ ) {
						if ( !isSet(valuesArr[i]) ) continue;
						fieldsIndex[ name ][ VALUE ][ i ] = valuesArr[i];
						fieldsSet[ name ][ i ] = TRUE;
					}
					if ( !lenDefined && lastIndex+1 > currFieldRepeats ) {
						currFieldRepeats = lastIndex+1;
					}
					return self;
				};
				this.getValues = function() {
					var valuesArr = new bfPresets.fieldArray( currFieldRepeats );
					for ( var i=0; i < currFieldRepeats; i++ ) {
						var value = fieldsIndex[ name ][ VALUE ][ i ];
						if ( fieldsSet[ name ][ i ] !== TRUE ) value = 0;
						valuesArr[i] = value;
					}
					return valuesArr;
				};
			})(name);
		};
		self.setBytes = function( valuesArr, /*opt*/ fromIndex, /*opt*/ toIndex ) {
		//--------------acceptBytes()--------------------//
			var argIsString = isString(valuesArr);
			var arrlen = valuesArr[ LENGTH ];
			if ( !isSet(fromIndex) ) {
				fromIndex = iFirst;
			} else if ( fromIndex < 0 ) {
				fromIndex = arrlen + fromIndex + iFirst;
			}
			if ( !isSet(toIndex) ) {
				if ( !lenDefined || !isSet(fromIndex) ) {
					toIndex = arrlen + iFirst;
				} else {
					toIndex = fromIndex + bytesNumber;
				}
			} else if ( toIndex < 0 ) {
				toIndex = arrlen + toIndex + iFirst;
			}
			fromIndex -= iFirst;
			toIndex -= iFirst;
			var cBytesNumber, cFieldRepeats;
			cBytesNumber = toIndex - fromIndex;
			if ( lenDefined ) {
				cFieldRepeats = fieldRepeats;
			} else {
				var cBytesOverall = byteLenBits * cBytesNumber;
				cFieldRepeats = floor( cBytesOverall / fieldsSize );
			}
			var bytes;
			if ( argIsString ) bytes = new Array( cBytesNumber );
			else bytes = new valuesArr[ CONSTRUCTOR ]( cBytesNumber );
			for ( var i=fromIndex; i < toIndex; i++ ) {
				var j = i - fromIndex;
				var cByte = ( !argIsString ) ? valuesArr[i] : valuesArr.charCodeAt( i );
				if ( !argIsString ) bytes[j] = valuesArr[i];
				else bytes[j] = valuesArr.charCodeAt( i );
			}
		//-------------formFields()----------------//
			currFieldRepeats = cFieldRepeats;
			allocFields( cFieldRepeats );
			var fLen = fields[ LENGTH ];
			var fCounter = 0;
			var rCounter = 0;
			var fSize = fields[ fCounter ][ SIZE ];
			var fBitsLeft = fSize;
			for ( var i=0; i < cBytesNumber; i++ ) {
				var bValue = bytes[i];
				var	bSpaceLeft = byteLenBits;
				while ( bSpaceLeft ) {
					var bPartSize = fBitsLeft;
					if ( bSpaceLeft < fBitsLeft ) {
						bPartSize = bSpaceLeft;
					}
					var fValuePart = bValue >> (bSpaceLeft - bPartSize);
					fValuePart &= (1 << bPartSize)-1;
					fValuePart <<= fBitsLeft - bPartSize;
					fields[ fCounter ][ VALUE ][ rCounter ] += fValuePart;
					bSpaceLeft -= bPartSize;
					fBitsLeft -= bPartSize;
					
					if ( fBitsLeft == 0 ) {
						if ( ++fCounter >= fLen ) {
							if ( ++rCounter >= cFieldRepeats ) {
								return self;
							}
							fCounter = 0;
						}
						fSize = fields[ fCounter ][ SIZE ];
						fBitsLeft = fSize;
					}
				}
			}
			return self;
		};
		self.getBytes = function() {
			var	bSpaceLeft = byteLenBits;
			var bCounter = 0;
			var cFieldsOverall = currFieldRepeats * fieldsSize;
			var cBytesNumber = cFieldsOverall / byteLenBits;
			cBytesNumber = ceil( cBytesNumber );
			var bytes = new bfPresets.byteArray( cBytesNumber );
			for ( var i=0; i < cBytesNumber; i++ ) bytes[i] = 0;
			for ( var r=0; r < currFieldRepeats; r++ ) {
				for ( var i in fieldsIndex ) {
					var fValue = fieldsIndex[i][ VALUE ][r];
					var fSize = fieldsIndex[i][ SIZE ];
					var fBitsLeft = fSize;
					while ( fBitsLeft ) {
						var fPartSize = bSpaceLeft;
						if ( fBitsLeft < bSpaceLeft ) {
							fPartSize = fBitsLeft;
						}
						var bValuePart = fValue >> (fBitsLeft - fPartSize);
						bValuePart &= (1 << fPartSize)-1;
						bValuePart <<= bSpaceLeft - fPartSize;
						bytes[ bCounter ] += bValuePart;
						bSpaceLeft -= fPartSize;
						fBitsLeft -= fPartSize;
						if ( bSpaceLeft == 0 ) {
							bCounter++;
							bSpaceLeft = byteLenBits;
						}
					}
				}
			}
			return bytes;
		};
		self.valueOf = function() {
			if ( byteLenBits == 8 || byteLenBits == 16 ) {
				var bytes = self.getBytes();
				var str = "";
				for ( var i=0; i < bytes[ LENGTH ]; i++ ) {
					str += String.fromCharCode( bytes[i] );
				}
				return str;
			} else {
				return toStr.call(self);
			}
		};
	};
})();
if ( typeof exports === 'object' && typeof module !== 'undefined' ) {
	module.exports = NspBitFields;
}
	
	
	
	
	
	
	
	