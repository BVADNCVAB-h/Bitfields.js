/*
//--------------------LIBRARY--INTERFACE--NOTATION------------------------//
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
//------------------------------------------------------------------------//
*/

var NspBitFields = new (function() {
	'use strict';
	var MAX_BIT_SEQUENCE = 31;
	var nsp = this;
	//---------------type--control--functions-----------------//
	var toStr = Object.prototype.toString;
	var toStrReturns = {
		objectType: '[object Object]',
		functionType: '[object Function]',
		arrayType: '[object Array]',
		dateType: '[object Date]',
		regExpType: '[object RegExp]',
		stringType: '[object String]',
		numberType: '[object Number]',
		indexedTypes: [
						'[object Array]',
						'[object Uint32Array]',
						'[object Int32Array]',
						'[object Uint16Array]',
						'[object Int16Array]',
						'[object Uint8ClampedArray]',
						'[object Uint8Array]',
						'[object Int8Array]',
						'[object Float32Array]',
						'[object Float64Array]',
		],
	};
	var isBoolean = function( value ) {
		return (value === true || value === false);
	};
	var isNumber = function( value ) {
		return ( toStr.call( value ) === toStrReturns.numberType );
	};
	var isObject = function( value ) {
		return ( value && toStr.call( value ) === toStrReturns.objectType );
	};
	var isArray = function( value ) {
		return ( toStr.call( value ) === toStrReturns.arrayType );
	};
	var isIndexed = function( value ) {
		return ( toStrReturns.indexedTypes.indexOf( toStr.call(value) ) > -1 );
	};
	var isString = function( value ) {
		return ( toStr.call( value ) === toStrReturns.stringType );
	};
	var isInt = function( value ) {
		return ( isNumber(value) && value === Math.floor(value) );
	};
	var isUInt = function( value ) {
		return ( isNumber(value) && value === Math.floor(value) && value >= 0 );
	};
	var isVariant = function( value ) {
		return true;
	};
	var isPrimitive = function( value ) {
		return isBoolean( value ) || isNumber( value ) || isString( value );
	};
	var NOT_SET = null;
	var NOT_SET_EQUAL = [ NOT_SET, undefined ];
	var isSet = function( value ) {
		return (NOT_SET_EQUAL.indexOf( value ) < 0);
	};
	var typeCheckers = {
		tBoolean: isBoolean,
		tUInt: isUInt,
		tInt: isInt,
		tNumber: isNumber,
		tString: isString,
		tArray: isArray,
		tIndexed: isIndexed,
		tObject: isObject,
		tVariant: isVariant,
	};
	var typeNames = {
		tBoolean: 'Boolean',
		tUInt: 'UInt',
		tInt: 'Int',
		tNumber: 'Number',
		tString: 'String',
		tArray: 'Array',
		tIndexed: 'Indexed',
		tObject: 'Object',
		tVariant: 'Variant',
	};
	var numericTypes = [
		'tUInt', 'tInt', 'tNumber' 
	];
	var nspId = 'NSP'+('00000'+Math.floor(Math.random()*1000000)).slice(-6);
	//---------------------------------------------------------//
	var BitFieldsConstPresets = {
		errs: function() {
			return {
				ERR_PRESET: 'wrong presets parameter',
				ERR_FORMAT: 'wrong format parameter',
				ERR_BYTESIZE_VALUE: 'byte size a value > 0 and  <= ' + MAX_BIT_SEQUENCE/8,
				ERR_BYTESIZE_DIV: 'byte size must be divisible by 1/8',
				ERR_PROPERTY_NAME: 'no such property',
				ERR_PROPERTY_READONLY: 'attempt to set read-only property',
				ERR_PROPERTY_VALUE: 'wrong property value passed',
				ERR_FIELDS_SET: 'no field set',
				ERR_FIELD_SIZE: 'field size a value >= 1 and <= ' + MAX_BIT_SEQUENCE,
				ERR_FIELD_TYPE: 'field size value not integer',
				ERR_FIELDS_BYTES_MATCH: 'fields size does not match bytes size',
				ERR_LEN_DEFINED: 'strict len set while len is set to be defined dynamically',
				ERR_LEN_UNDEFINED: 'neither parameter defining overall size set while size is not set to be defined dynamically', 
				ERR_LEN_ALIGNED: 'fields do not fully occupy bytes space while fields len is set to be aligned',
				ERR_EXCESSIVE_LEN: 'excessive length set',
				ERR_INSUFF_LEN: 'insufficient length set',
				ERR_NAME_ASSIGNED: 'name has already been assigned',
				ERR_NAME_NOT_ASSIGNED: 'name hasn\'t been previously assigned',
				ERR_OVERFLOW: 'parameter out of range',
				ERR_PARAMETER: 'function called with wrong parameter value or type',
				ERR_PARAMETER_NUM: 'function called with wrong parameter number',
				ERR_PARAMETER_TYPE: 'function called with wrong parameter type',
				ERR_PARAMETER_VALUE: 'function called with wrong parameter value',
				ERR_FIELD_VAL_SET: 'field value not set while its value is set to be defined', 
				ERR_CHAR_SIZE: 'when working with strings char size of 8 bits only supported',
				ERR_BYTE_VAL_RANGE: 'byte value out of range',
				ERR_BYTE_ARR_LEN: 'wrong length of byte array passed',
				ERR_BYTES_NOT_SET: 'bytes have not been initialized',
				ERR_ARRAY_LEN: 'array with wrong length passed',
				ERR_START_END_INDICES: 'start and/or end indices either exceed boundaries or do not define any part of array',
				ERR_BYTES_NUM_UDF: 'retrieving bytes number when length is dynamic',
			};
		},
		warns: function() {
			return {
				WRN_METHODS_CONJUNCTION: 'related methods meant to be used in conjunction',
				WRN_TOSTR_CONVERSION: 'attempt to get string when byte size set differs from 1 or 2',
			};
		},
		errorHandler: function() {
			return function( msg ) {
				throw new Error( msg );
			};
		},
		warningHandler: function() {
			return function ( msg ) {
				//console.log( 'Warning: ' + msg );
				return null;
			};
		},
		byteArray: function() {
			return Array.prototype.constructor;
		},
		fieldArray: function() {
			return Array.prototype.constructor;
		},
	};
	//-------------------------------------------------------//
	//-----------------ACCESSORY--CLASSES--------------------//
	//-------------------------------------------------------//
	this.BitFieldsPresets = function() {
		var PSC = BitFieldsConstPresets;
		for ( var i in PSC ) this[i] = PSC[i]();
	};
	this.BitFieldsFormat = function( /*opt*/ byteLen /*Bytes*/, /*opt*/ bfPresets ) {
		//----------------------PRIVATE--FIELDS-------------------------------//
		var byteLenBits;
		var fields = [];
		var fieldsIndex = {};
		var pointer = 0;
		var fieldsSize = 0;
		var properties = {
			lenDefined: 	{ value: true },
			lenAligned: 	{ value: true },
			valsDefined:	{ value: true },
			firstIndexOne:	{ value: false },
			fieldsSize: 	{ value: 0, blocked: true },
			byteLenBits: 	{ value: NOT_SET, blocked: true },
			fieldRepeats: 	{ value: NOT_SET },
			bytesNumber: 	{ value: NOT_SET },
		};
		var log = {
			Counter: 0,
			addField: 0,
			modField: 0,
			addFields: 0,
			setProperty: 0,
			getProperty: 0,
		};
		var caller = {};
		var temp = {};
		//----------------------CONSTRUCTOR-------------------------------//
		if ( byteLen !== undefined && bfPresets === undefined ) {
			if ( byteLen instanceof nsp.BitFieldsPresets ) {
				bfPresets = byteLen;
				byteLen = undefined;
			}
		}
		if ( bfPresets === undefined ) {
			bfPresets = new nsp.BitFieldsPresets();
		} else if ( !(bfPresets instanceof nsp.BitFieldsPresets) ) {
			bfPresets = new nsp.BitFieldsPresets();
			var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
			errMsg += ' (BitFieldsFormat([float byteLen, ]BitFieldsPresets bfPresets))';
			return bfPresets.errorHandler( errMsg );
		}
		if ( byteLen === undefined ) {
			byteLen = 1;
		} else if ( !(isNumber(byteLen)) ) {
			var errMsg =  bfPresets.errs.ERR_PARAMETER_TYPE;
			errMsg += ' (BitFieldsFormat(float byteLen[, BitFieldsPresets bfPresets]))';
			return bfPresets.errorHandler( errMsg );
		} else if ( !(byteLen > 0 && byteLen * 8 <= MAX_BIT_SEQUENCE) ) {
			var errMsg =  bfPresets.errs.ERR_BYTESIZE_VALUE;
			errMsg += ' (BitFieldsFormat(), byteLen=' + byteLen + ')';
			return bfPresets.errorHandler( errMsg );
		}
		temp.byteLenBits = byteLen * 8;
		properties.byteLenBits.value = Math.round( temp.byteLenBits );
		temp.inaccuracy = Math.abs( properties.byteLenBits.value - temp.byteLenBits );
		if ( temp.inaccuracy >= 0.0001 ) {
			var errMsg = bfPresets.errs.ERR_BYTESIZE_DIV;
			errMsg += ' (BitFieldsFormat(), byteLen=' + temp.byteLenBits + 'bits)';
			return bfPresets.errorHandler( errMsg );
		}
		temp = {};
		//-------------------PRIVATE--METHODS---------------------------//
		var findField = function( name ) {
			for ( var i=0; i < fields.length; i++ ) if ( fields[i].name == name )
				return i;
			return -1;
		};
		var checkField = function( name, size, callerName ) {
			if ( !isString(name) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' ('+callerName+'(), typeof name !== [String])'
				return bfPresets.errorHandler( errMsg );
			}
			if ( !isInt(size) ) {
				var errMsg = bfPresets.errs.ERR_FIELD_TYPE;
				errMsg += ' ('+callerName+'(), size='+size+')';
				return bfPresets.errorHandler( errMsg );
			}
			if ( size > MAX_BIT_SEQUENCE || size < 1 ) {
				var errMsg = bfPresets.errs.ERR_FIELD_SIZE;
				errMsg += ' ('+callerName+'(), size='+size+')';
				return bfPresets.errorHandler( errMsg );
			}
			return true;
		};
		//----------------"PACKAGE-LEVEL"--METHODS----------------------//
		this[ nspId ] = {
			rewind: function() {
				pointer = 0;
			},
			nextField: function() {
				if ( pointer >= fields.length ) {
					pointer = 0;
					return null;
				}
				return { name: fields[pointer].name, size: fields[pointer++].size  };
			},
			nextLogEntry: (function() {
				var entryNames;
				var pointer;
				var logCounter = -1;
				return function() {
					if ( logCounter != log.Counter ) {
						entryNames = [];
						for ( var i in log ) entryNames.push( i );
						logCounter = log.Counter;
						pointer = 0;
					}
					if ( pointer < entryNames.length ) {
						var name = entryNames[pointer++];
						return { name: name, value: log[name] };
					} else {
						pointer = 0;
						return null;
					}
				};
			})(),
		};
		//--------------------PUBLIC--METHODS---------------------------//
		this.addField = function( name, size /*Bits*/ ) {
			//----------------invokes--errorHandler-----------------------//
				var fieldChecked = checkField( name, size, 'addField' );
				if ( !fieldChecked ) return fieldChecked;
			//------------------------------------------------------------//
			if ( name in fieldsIndex ) {
				var errMsg = bfPresets.errs.ERR_NAME_ASSIGNED;
				errMsg += ' (addField(), name=' + name + ')'; 
				return bfPresets.errorHandler( errMsg );
			}
			fieldsIndex[ name ] = fields[
				fields.push( { name: name, size: size } ) - 1
			];
			properties.fieldsSize.value += size;
			log.addField = ++log.Counter;
			return this;
		};
		this.modField = function( name, size /*Bits*/ ) {
			//----------------invokes--errorHandler-----------------------//
				var fieldChecked = checkField( name, size, 'modField' );
				if ( !fieldChecked ) return fieldChecked;
			//------------------------------------------------------------//
			if ( !(name in fieldsIndex) ) {
				var errMsg = bfPresets.errs.ERR_NAME_NOT_ASSIGNED;
				errMsg += ' (modField(), name=' + name + ')'; 
				return bfPresets.errorHandler( errMsg );
			}
			properties.fieldsSize.value += size - fieldsIndex[ name ].size;
			fieldsIndex[ name ].size = size;
			log.modField = ++log.Counter;
			return this;
		};
		this.addFields = function( fieldsPassed ) {
			if ( !isObject( fieldsPassed )) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (addFields(), typeof fieldsPassed !== object)';
				return bfPresets.errorHandler( errMsg );
			}
			for ( var name in fieldsPassed ) {
				//----------invokes--errorHandler--------------//
					var fieldChecked = checkField( 
						name, fieldsPassed[name], 'addFields' 
					);
					if ( !fieldChecked ) return fieldChecked;
				//---------------------------------------------//
				if ( name in fieldsIndex ) {
					var errMsg = bfPresets.errs.ERR_NAME_ASSIGNED;
					errMsg += ' (addField(), name=' + name + ')'; 
					return bfPresets.errorHandler( errMsg );
				}
				fieldsIndex[ name ] = fields[
					fields.push({ 
						name: name,
						size: fieldsPassed[ name ] 
					}) - 1
				];
				properties.fieldsSize.value += fieldsPassed[ name ];
			}
			log.addFields = ++log.Counter;
			return this;
		};
		this.modFields = function( fieldsPassed ) {
			if ( !isObject( fieldsPassed )) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (modFields(), typeof fieldsPassed !== object)';
				return bfPresets.errorHandler( errMsg );
			}
			for ( var name in fieldsPassed ) {
				//----------invokes--errorHandler--------------//
					var fieldChecked = checkField( 
						name, fieldsPassed[name], 'modFields' 
					);
					if ( !fieldChecked ) return fieldChecked;
				//---------------------------------------------//
				if ( !(name in fieldsIndex) ) {
					var errMsg = bfPresets.errs.ERR_NAME_NOT_ASSIGNED;
					errMsg += ' (modFields(), name=' + name + ')'; 
					return bfPresets.errorHandler( errMsg );
				}
				var sizeDiff = fieldsPassed[ name ] - fieldsIndex[ name ].size;
				properties.fieldsSize.value += sizeDiff;
				fieldsIndex[ name ].size = fieldsPassed[ name ];
			}
			log.modFields = ++log.Counter;
			return this;
		};
		this.skipFields = function() {
			properties.fieldsSize.value = 0;
			fieldsIndex = {};
			fields = [];
			log.skipFields = ++log.Counter;
			return this;
		};
		this.setProperty = function( property, value ) {
			var crCaller = 'setProperty';
			if ( 'setProperty' in caller && isSet(caller.setProperty) ) {
				crCaller = caller.setProperty;
				caller.setProperty = NOT_SET;
			}
			if ( !(property in properties) ) {
				var errMsg = bfPresets.errs.ERR_PROPERTY_NAME;
				errMsg += ' ('+property+')';
				return bfPresets.errorHandler( errMsg );
			}
			if ( properties[ property ].blocked ) {
				var errMsg = bfPresets.errs.ERR_PROPERTY_READONLY;
				errMsg += ' ('+property+')';
				return bfPresets.errorHandler( errMsg );
			}
			properties[ property ].value = value;
			log.setProperty = ++log.Counter;
			return this;
		};
		this.setProperties = function( propertiesPassed ) {
			if ( !isObject(propertiesPassed) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (setProperties(arg), ';
				errMsg += 'typeof arg !== object)';
				return bfPresets.errorHandler( errMsg );
			}
			caller.setPropery = 'setProperties';
			for ( var i in propertiesPassed ) {
				var r = this.setProperty( i, propertiesPassed[i] );
				if ( r === false || r === null ) return r;
			}
			return this;
		};
		this.getProperty = function( property ) {
			if ( !(isString(property) && property in properties) ) {
				var errMsg = bfPresets.errs.ERR_PROPERTY_NAME;
				errMsg += ' ('+property+')';
				return bfPresets.errorHandler( errMsg );
			}
			log.getProperty = ++log.Counter;
			return properties[ property ].value;
		};
	};
	//-----------------------------------------------------//
	//-----------------------MAIN--CLASS-------------------//
	//-----------------------------------------------------//
	this.BitFields = function( bfFormat, /*optional*/ bfPresets ) {
		//-----------------PRIVATE--FIELDS-----------------//
		var lenDefined;
		var lenAligned;
		var valsDefined;
		var fieldsSize;
		var byteLenBits;
		var fieldRepeats;
		var bytesNumber;
		var currFieldRepeats;
		var iFirst;
		var fields = [];
		var fieldsSet = {};
		var fieldsIndex = {};
		var formatProperties = {
			lenDefined: 	{ value: NOT_SET, type: 'tBoolean' },
			lenAligned: 	{ value: NOT_SET, type: 'tBoolean' },
			valsDefined: 	{ value: NOT_SET, type: 'tBoolean' },
			firstIndexOne: 	{ value: NOT_SET, type: 'tBoolean' },
			fieldsSize: 	{ value: NOT_SET, type: 'tInt', min: 1 },
			byteLenBits: 	{ value: NOT_SET, type: 'tInt', min: 1 },
			fieldRepeats: 	{ value: NOT_SET, type: 'tInt', min: 1 },
			bytesNumber: 	{ value: NOT_SET, type: 'tInt', min: 1 },
		};
		var log = {
			Counter: 0,
			setValue: 0,
			setValues: 0,
			getValue: 0,
			getValues: 0,
			skipValues: 0,
			setBytes: 0,
			getBytes: 0,
			selName: 0,
			selName__setValues: 0,
			selName__getValues: 0,
			valueOfOR: 0,
		};
		var caller = {};
		var temp = { temp: {} };
		//--------------PRIVATE--METHODS-----------------//
		var allocFields = function( fieldRepeats ) {
			for ( var i=0; i < fields.length; i++ ) {
				fields[i].value = [];
				fieldsSet[ fields[i].name ] = [];
				for ( var j=0; j < fieldRepeats; j++ ) {
					fields[i].value[j] = 0;
					fieldsSet[ fields[i].name ][j] = true;
				}
			}
		};
		var acceptBytesNumber = function( bytesNumber, /*optional*/ fieldRepeats, output ) {
			if ( output === undefined ) {
				output = fieldRepeats;
				fieldRepeats = undefined;
			}
			var fp = formatProperties;
			var temp = {};
			output.bytesOverall = fp.byteLenBits.value * bytesNumber;
			output.fieldRepeats = Math.floor( output.bytesOverall / fp.fieldsSize.value );
			if ( isSet(fieldRepeats) ) temp.fieldRepeats = fieldRepeats;
			else temp.fieldRepeats = output.fieldRepeats;
			if ( temp.fieldRepeats < fp.fieldRepeats.min ) {
				temp.fieldRepeats = fp.fieldRepeats.min;
			}
			temp.fieldsOverall = fp.fieldsSize.value * temp.fieldRepeats;
			temp.bytesNumber = Math.ceil( temp.fieldsOverall / fp.byteLenBits.value );
			temp.bytesFieldsDiff = output.bytesOverall - temp.fieldsOverall;
			if ( temp.bytesFieldsDiff >= fp.byteLenBits.value ) {
				var errMsg = bfPresets.errs.ERR_EXCESSIVE_LEN;
				errMsg += ' (len_set='+bytesNumber+'bytes,';
				errMsg += ' len_sufficient='+temp.bytesNumber+'bytes)';
				return bfPresets.errorHandler( errMsg );
			}
			if ( temp.bytesFieldsDiff < 0 ) {
				var errMsg = bfPresets.errs.ERR_INSUFF_LEN;
				errMsg += ' (len_set='+bytesNumber+'bytes,';
				errMsg += ' len_sufficient='+temp.bytesNumber+'bytes)';
				return bfPresets.errorHandler( errMsg );
			}
			if ( fp.lenAligned.value ) {
				if ( temp.bytesFieldsDiff != 0 ) {
					var errMsg = bfPresets.errs.ERR_LEN_ALIGNED;
					errMsg += ' (bytes='+output.bytesOverall+'bits,';
					errMsg += ' field='+fp.fieldsSize.value+'bits)';
					return bfPresets.errorHandler( errMsg );
				}
			}
			return 'success';
		};
		//------------------CONSTRUCTOR--------------------//
		if ( bfPresets === undefined ) {
			bfPresets = new nsp.BitFieldsPresets();
		} else if ( !(bfPresets instanceof nsp.BitFieldsPresets) ) {
			bfPresets = new nsp.BitFieldsPresets();
			var errMsg = bfPresets.errs.ERR_PRESET;
			errMsg += ' (BitFields(), !(bfPresets instanceof BitFieldsPresets))';
			return bfPresets.errorHandler( errMsg );
		}
		if ( !(bfFormat instanceof nsp.BitFieldsFormat) ) {
			var errMsg = bfPresets.errs.ERR_FORMAT;
			errMsg += ' (BitFields(), !(bfFormat instanceof BitFieldsFormat))';
			return bfPresets.errorHandler( errMsg );
		}
		while ( (temp.logEntry = bfFormat[ nspId ].nextLogEntry()) ) {
			log[ temp.logEntry.name ] = temp.logEntry.value;
		}
		while ( (temp.field = bfFormat[ nspId ].nextField()) ) {
			fieldsIndex[ temp.field.name ] = fields[
				fields.push( { name: temp.field.name, size: temp.field.size, value: [] } ) - 1
			];
			fieldsSet[ temp.field.name ] = [];
		}
		var fp = formatProperties;
		for ( var i in fp ) {
			//-------------------------------------------//
				fp[i].value = bfFormat.getProperty(i);
			//-------------------------------------------//
			if ( !isSet( fp[i].value )) continue;
			if ( 'type' in fp[i] ) {
				if ( !typeCheckers[ fp[i].type ]( fp[i].value ) ) {
					var errMsg = bfPresets.errs.ERR_PROPERTY_VALUE;
					errMsg += ' (type, '+i+', '+fp[i].value+')'
					return bfPresets.errorHandler( errMsg );
				}
			}
			if ( 'min' in fp[i] ) {
				if ( fp[i].value < fp[i].min ) {
					var errMsg = bfPresets.errs.ERR_PROPERTY_VALUE;
					errMsg += ' (min_val, '+i+', '+fp[i].value+')'
					return bfPresets.errorHandler( errMsg );
				}
			}
			if ( 'max' in fp[i] ) {
				if ( fp[i].value > fp[i].max ) {
					var errMsg = bfPresets.errs.ERR_PROPERTY_VALUE;
					errMsg += ' (max_val, '+i+', '+fp[i].value+')'
					return bfPresets.errorHandler( errMsg );
				}
			}
		}
		temp.fieldRepeatsSet = isSet( fp.fieldRepeats.value );
		temp.bytesNumberSet = isSet( fp.bytesNumber.value );
		if ( fp.lenDefined.value ) {
			if ( !temp.fieldRepeatsSet && !temp.bytesNumberSet ) {
				var errMsg = bfPresets.errs.ERR_LEN_UNDEFINED;
				errMsg += ' (BitFieldsFormat() <- BitFields())';
				return bfPresets.errorHandler( errMsg );
			}
			if ( temp.fieldRepeatsSet ) {
				temp.fieldsOverall = fp.fieldsSize.value * fp.fieldRepeats.value;
				temp.bytesNumber = Math.ceil( temp.fieldsOverall / fp.byteLenBits.value );
				temp.temp.bytesOverall = fp.byteLenBits.value * temp.bytesNumber;
				temp.bytesFieldsDiff = temp.temp.bytesOverall - temp.fieldsOverall;
				if ( temp.bytesNumber < fp.bytesNumber.min ) {
					var errMsg = bfPresets.errs.ERR_PROPERTY_VALUE;
					errMsg += ' (fieldRepeats='+fp.fieldRepeats.value;
					errMsg += ' -> bytesNumber='+temp.bytesNumber+')';
					return bfPresets.errorHandler( errMsg );
				}
				if ( fp.lenAligned.value ) {
					if ( temp.bytesFieldsDiff != 0 ) {
						var errMsg = bfPresets.errs.ERR_LEN_ALIGNED;
						errMsg += ' (fields='+temp.fieldsOverall+'bits,';
						errMsg += ' byte='+fp.byteLenBits.value+'bits)';
						return bfPresets.errorHandler( errMsg );
					}
				}
			}
			if ( temp.bytesNumberSet ) {
			//-----invokes--errorHandler--------//
				var result = acceptBytesNumber(
					fp.bytesNumber.value,
					fp.fieldRepeats.value,
					/*ref*/ temp
				);
				if ( result !== 'success' ) 
					return result;
			//----------------------------------//
			}
			if ( temp.fieldRepeatsSet && temp.bytesNumberSet ) {
				if ( fp.lenAligned.value ) {
					if ( temp.fieldsOverall != temp.bytesOverall ) {
						var errMsg = bfPresets.errs.ERR_FIELDS_BYTES_MATCH;
						errMsg += ' (fields='+temp.fieldsOverall+'bits,';
						errMsg += ' bytes='+temp.bytesOverall+'bits)';
						return bfPresets.errorHandler( errMsg );
					}
				} else {
					if ( temp.bytesNumber != fp.bytesNumber.value ) {
						var errMsg = bfPresets.errs.ERR_FIELDS_BYTES_MATCH;
						errMsg += ' (fields='+temp.bytesNumber+'bytes,';
						errMsg += ' bytes='+fp.bytesNumber.value+'bytes)';
						return bfPresets.errorHandler( errMsg );
					}
				}
			} else {
			//------------------------------------------------//
				if ( temp.fieldRepeatsSet ) {
					fp.bytesNumber.value = temp.bytesNumber;
				}
				if ( temp.bytesNumberSet ) {
					fp.fieldRepeats.value = temp.fieldRepeats;
				}
			//------------------------------------------------//
			}
		} else {
			if ( temp.fieldRepeatsSet || temp.bytesNumberSet ) {
				var errMsg = bfPresets.errs.ERR_LEN_DEFINED;
				errMsg += ' (BitFieldsFormat() <- BitFields())';
				return bfPresets.errorHandler( errMsg );
			}
		}
		lenDefined = fp.lenDefined.value;
		lenAligned = fp.lenAligned.value;
		valsDefined = fp.valsDefined.value;
		fieldsSize = fp.fieldsSize.value;
		byteLenBits = fp.byteLenBits.value;
		fieldRepeats = fp.fieldRepeats.value;
		bytesNumber = fp.bytesNumber.value;
		currFieldRepeats = ( lenDefined ) ? fieldRepeats : 0; 
		iFirst = ( fp.firstIndexOne.value ) ? 1 : 0; 
		temp = { temp: {} };
		//--------------CONSTRUCTOR--END-----------------//
		//---------------PUBLIC--METHODS-----------------//
		this.getRowSize = function() {
			return fieldsSize;
		};
		this.getRowNum = function() {
			return currFieldRepeats;
		};
		this.getTotalSize = function() {
			return fieldsSize * currFieldRepeats;
		};
		this.getBytesNum = function() {
			if ( !lenDefined ) {
				var errMsg = bfPresets.errs.ERR_BYTES_NUM_UDF + ' (getBytesNum())';
				return bfPresets.errorHandler( errMsg );
			}
			return bytesNumber;
		};
		//-----------functionality--of--public--method(s)-----------//
		var setValue = function( index, name, value ) {
			var crCaller = 'setValue';
			if ( 'setValue' in caller && isSet(caller.setValue) ) {
				crCaller = caller.setValue;
			}
			if ( !(isString(name) && name in fieldsIndex) ) {
				var errMsg = bfPresets.errs.ERR_NAME_NOT_ASSIGNED;
				errMsg += ' (setValue(), name == ' + name + ')';
				return bfPresets.errorHandler( errMsg );
			}
			var maxValue = Math.pow(2, fieldsIndex[ name ].size)-1;
			if ( !isUInt(value) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (setValue(), typeof value('+value+') !== [UInt])';
				return bfPresets.errorHandler( errMsg );
			}
			if ( value < 0 || value > maxValue ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_VALUE;
				errMsg += ' (' + crCaller + '(), value=' + value;
				errMsg += ', min=0, max=' + maxValue + ')';
				return bfPresets.errorHandler( errMsg );
			}
			//--------------------------------------------------------------//
				fieldsIndex[ name ].value[ index ] = value;
				fieldsSet[ name ][ index ] = true;
				if ( !lenDefined && index+1 > currFieldRepeats )
					currFieldRepeats = index+1;
				return true;
			//-------------------------------------------------------------//
		};
		//---------------------------------------------------------//
		this.setValue = function( /*optional*/ index, name, value ) {
			var crCaller = 'setValue';
			if ( 'setValue' in caller && isSet(caller.setValue) ) {
				crCaller = caller.setValue;
			}
			if ( name === undefined ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_NUM;
				errMsg += ' (setValue([index, ]name, value))'; 
				return bfPresets.errorHandler( errMsg );
			}
			if ( value === undefined ) {
				value = name;
				name = index;
				index = iFirst;
			}
			if ( !isUInt(index) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (setValue(), typeof index('+index+') !== [UInt])';
				return bfPresets.errorHandler( errMsg );
			}
			index -= iFirst;
			if ( lenDefined && (index < 0 || index >= fieldRepeats) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_VALUE;
				errMsg += ' (setValue(), index=' + (index + iFirst);
				if ( index < 0 ) errMsg += ', min=' + iFirst + ')';
				else errMsg += ', max=' + (fieldRepeats - 1 + iFirst) + ')';
				return bfPresets.errorHandler( errMsg );
			}
			//--------------------------------------------------//
				caller.setValue = 'setValue';
				var r = setValue( index, name, value );
				if ( r === false || r === null ) return r;
				caller.setValue = NOT_SET;
				log.setValue = ++log.Counter;
				return this;
			//-------------------------------------------------//
		};
		this.setValues = function( /*optional*/ index, valuesObj ) {
			if ( valuesObj === undefined ) {
				valuesObj = index;
				index = iFirst;
			}
			if ( !isObject(valuesObj) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (setValues([int index, ]Object values), ';
				errMsg += 'typeof values !== [Object])';
				return bfPresets.errorHandler( errMsg );
			}
			if ( !isUInt(index) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (setValues(), typeof index('+index+') !== [UInt])';
				return bfPresets.errorHandler( errMsg );
			}
			index -= iFirst;
			if ( lenDefined && (index < 0 || index >= fieldRepeats) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_VALUE;
				errMsg += ' (setValues(), index=' + (index + iFirst);
				if ( index < 0 ) errMsg += ', min=' + iFirst + ')';
				else errMsg += ', max=' + (fieldRepeats - 1 + iFirst) + ')';
				return bfPresets.errorHandler( errMsg );
			}
			caller.setValue = 'setValues';
			for ( var i in valuesObj ) {
				if ( !isSet(valuesObj[i]) ) continue;
				var r = setValue( index, i, valuesObj[i] );
				if ( r === false || r === null ) return r;
			}
			caller.setValue = NOT_SET;
			log.setValues = ++log.Counter;
			return this;
		};
		this.getValue = function( /*optional*/ index, name ) {
			if ( name === undefined ) {
				name = index;
				index = iFirst;
			}
			if ( !(isString(name) && name in fieldsIndex) ) {
				var errMsg = bfPresets.errs.ERR_NAME_NOT_ASSIGNED;
				errMsg += ' (getValue(), name == ' + name + ')';
				return bfPresets.errorHandler( errMsg );
			}
			if ( !isUInt(index) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (getValue(), typeof index !== [UInt])';
				return bfPresets.errorHandler( errMsg );
			}
			index -= iFirst;
			if ( index >= currFieldRepeats || index < 0 ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_VALUE;
				errMsg += ' (getValue(), index=' + (index + iFirst);
				if ( index < 0 ) errMsg += ', min=' + iFirst + ')';
				else errMsg += ', max=' + (currFieldRepeats - 1 + iFirst) + ')';
				return bfPresets.errorHandler( errMsg );
			}
			if ( valsDefined && fieldsSet[ name ][ index ] !== true ) {
				var errMsg = bfPresets.errs.ERR_FIELD_VAL_SET;
				errMsg += ' (getValues(), field='+name+', index='+(index + iFirst)+')';
				return bfPresets.errorHandler( errMsg );
			}
			//-----------------------------------------------//
				var value = fieldsIndex[ name ].value[ index ];
				if ( fieldsSet[ name ][ index ] !== true ) value = 0;
				log.getValue = ++log.Counter;
				return value;
			//-----------------------------------------------//
		};
		this.getValues = function( /*opt*/ index, /*opt*/ outputObj ) {
			var maxIndex = currFieldRepeats + iFirst - 1;
			var argOutput = true;
			if ( !isSet(outputObj) ) {
				if ( isSet(index) && !isPrimitive(index) ) {
					outputObj = index;
					index = undefined;
				} else {
					outputObj = {};
					argOutput = false;
				}
			}
			if ( !isSet(index) ) index = iFirst;
			if ( !isUInt(index) || index < iFirst || index > maxIndex ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER;
				errMsg += ' (getValues(), index==' + index + ', min==' + iFirst;
				errMsg += ', max==' + maxIndex + ', type [UInt])';
				return bfPresets.errorHandler( errMsg );
			}
			if ( !isObject(outputObj) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (getValues(), typeof outputObj !== [Object])';
				return bfPresets.errorHandler( errMsg );
			}
			index -= iFirst;
			for ( var i in fieldsIndex ) {
				if ( valsDefined && fieldsSet[ i ][ index ] !== true ) {
					var errMsg = bfPresets.errs.ERR_FIELD_VAL_SET;
					errMsg += ' (getValues(), field='+i+', index='+(index + iFirst)+')';
					return bfPresets.errorHandler( errMsg );
				}
				//------------------------------------------------------//
					var value = fieldsIndex[ i ].value[ index ];
					if ( fieldsSet[ i ][ index ] !== true ) value = 0;
					outputObj[i] = value;
				//-----------------------------------------------------//
			}
			if ( argOutput ) return this;
			else return outputObj;
		};
		this.skipValues = function() {
			for ( var i=0; i < fields.length; i++ ) {
				fields[i].value = [];
				fieldsSet[ fields[i].name ] = [];
			}
			if ( !lenDefined ) currFieldRepeats = 0;
			return this;
		};
		this.selName = function( name ) {
			var that = this;
			if ( !(isString(name) && name in fieldsIndex) ) {
				var errMsg = bfPresets.errs.ERR_NAME_NOT_ASSIGNED;
				errMsg += ' (selName(), name == ' + name + ')';
				return bfPresets.errorHandler( errMsg );
			}
			log.selName = ++log.Counter;
			return new(function(name) {
				this.setValues = function( valuesArr ) {
					if ( !(isIndexed(valuesArr)) ) {
						var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
						errMsg += ' (selName() -> setValues(), typeof arg !== [Indexed])';
						return bfPresets.errorHandler( errMsg );
					}
					var lastIndex = valuesArr.length - 1;
					if ( lastIndex < 0 ) return that;
					if ( lenDefined && lastIndex >= fieldRepeats ) {
						var errMsg = bfPresets.errs.ERR_ARRAY_LEN;
						errMsg += ' (selName() -> setValues(), len=' + (lastIndex + 1);
						errMsg += ', max=' + fieldRepeats + ')';
						return bfPresets.errorHandler( errMsg );
					}
					var maxValue =  Math.pow(2, fieldsIndex[ name ].size)-1;
					for ( var i=0; i <= lastIndex; i++ ) {
						if ( !isSet(valuesArr[i]) ) continue;
						if ( !isInt(valuesArr[i]) ) {
							var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
							errMsg += ' (selName() -> setValues(), not integer,';
							errMsg += ' at index ' + i + ' value ' + valuesArr[i] + ')';
							return bfPresets.errorHandler( errMsg );
						}
						if ( valuesArr[i] < 0 || valuesArr[i] > maxValue ) {
							var errMsg = bfPresets.errs.ERR_PARAMETER_VALUE;
							errMsg += ' (selName() -> setValues(), at index ' + i;
							errMsg += ' value ' + valuesArr[i];
							errMsg += ', min=0, max=' + maxValue;
							return bfPresets.errorHandler( errMsg );
						}
						fieldsIndex[ name ].value[ i ] = valuesArr[i];
						fieldsSet[ name ][ i ] = true;
					}
					log.selName__setValues = ++log.Counter;
					if ( !lenDefined && lastIndex+1 > currFieldRepeats ) {
						currFieldRepeats = lastIndex+1;
					}
					return that;
				};
				this.getValues = function() {
					var valuesArr = new bfPresets.fieldArray( currFieldRepeats );
					for ( var i=0; i < currFieldRepeats; i++ ) {
						if ( valsDefined && fieldsSet[ name ][ i ] !== true ) {
							var errMsg = bfPresets.errs.ERR_FIELD_VAL_SET;
							errMsg += ' (field='+name+', index='+(i + iFirst)+')';
							return bfPresets.errorHandler( errMsg );
						}
						var value = fieldsIndex[ name ].value[ i ];
						if ( fieldsSet[ name ][ i ] !== true ) value = 0;
						valuesArr[i] = value;
					}
					log.selName__getValues = ++log.Counter;
					return valuesArr;
				};
			})(name);
		};
		this.setBytes = function( valuesArr, /*opt*/ fromIndex, /*opt*/ toIndex ) {
			var argIsString = isString(valuesArr);
			if ( !argIsString && !(isIndexed(valuesArr)) ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (setBytes(), typeof arg !== [Indexed])';
				return bfPresets.errorHandler( errMsg );
			}
			if ( argIsString && byteLenBits != 8 ) {
				var errMsg = bfPresets.errs.ERR_CHAR_SIZE;
				errMsg += ' (setBytes(), char size = ' + byteLenBits +')';
				return bfPresets.errorHandler( errMsg );
			}
		//--------------acceptBytes()--------------------//
			var typeError = isSet(fromIndex) && !isInt(fromIndex);
			typeError = typeError || isSet(toIndex) && !isInt(toIndex);
			if ( typeError ) {
				var errMsg = bfPresets.errs.ERR_PARAMETER_TYPE;
				errMsg += ' (setBytes(), typeof index !== int)';
				return bfPresets.errorHandler( errMsg );
			}
			var arrlen = valuesArr.length;
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
			if ( toIndex > arrlen + iFirst || fromIndex >= toIndex ) {
				var errMsg = bfPresets.errs.ERR_START_END_INDICES;
				errMsg += ' (setBytes(), start==' + fromIndex;
				errMsg += ', end==' + toIndex + ', minStart==' + iFirst;
				errMsg += ', maxEnd==' + (arrlen + iFirst) + ')';
				return bfPresets.errorHandler( errMsg );
			}
			fromIndex -= iFirst;
			toIndex -= iFirst;
			var output = {};
			var current = {};
			current.bytesNumber = toIndex - fromIndex;
			if ( lenDefined ) {
				if ( current.bytesNumber != bytesNumber ) {
					var errMsg = bfPresets.errs.ERR_BYTE_ARR_LEN;
					errMsg += ' (setBytes(), array_len='+current.bytesNumber;
					errMsg += 'bytes, len_expected='+bytesNumber+'bytes)';
					return bfPresets.errorHandler( errMsg );
				}
				current.fieldRepeats = fieldRepeats;
			} else {
			//-------------invokes--errorHandler--------------//
				var result = acceptBytesNumber( 
					current.bytesNumber, 
					/*ref*/ output
				);
				if ( result !== 'success' )
					return result;
				current.fieldRepeats = output.fieldRepeats;
			//----------------------------------------------//
			}
			var bytes;
			if ( argIsString ) bytes = new Array( current.bytesNumber );
			else bytes = new valuesArr.constructor( current.bytesNumber );
			var byteMaxVal = Math.pow(2, byteLenBits)-1;
			for ( var i=fromIndex; i < toIndex; i++ ) {
				var j = i - fromIndex;
				var cByte = ( !argIsString ) ? valuesArr[i] : valuesArr.charCodeAt( i );
				if ( !isUInt(cByte) || cByte < 0 || cByte > byteMaxVal ) {
					var errMsg = bfPresets.errs.ERR_PARAMETER;
					errMsg += ' (setBytes(), at index ' + i + ' value ' + cByte;
					errMsg += ', min=0, max=' + byteMaxVal + ', type [UInt])';
					return bfPresets.errorHandler( errMsg );
				}
				bytes[j] = cByte;
			}
		//-------------formFields()----------------//
			currFieldRepeats = current.fieldRepeats;
			allocFields( current.fieldRepeats );
			var fLen = fields.length;
			var fCounter = 0;
			var rCounter = 0;
			var fSize = fields[ fCounter ].size;
			var fBitsLeft = fSize;
			for ( var i=0; i < current.bytesNumber; i++ ) {
				var bValue = bytes[i];
				var	bSpaceLeft = byteLenBits;
				while ( bSpaceLeft ) {
					var bPartSize = fBitsLeft;
					if ( bSpaceLeft < fBitsLeft ) {
						bPartSize = bSpaceLeft;
					}
					var fValuePart = bValue >>> (bSpaceLeft - bPartSize);
					fValuePart &= Math.pow(2, bPartSize)-1; 
					fValuePart <<= fBitsLeft - bPartSize;
					fields[ fCounter ].value[ rCounter ] += fValuePart;
					bSpaceLeft -= bPartSize;
					fBitsLeft -= bPartSize;
					if ( fBitsLeft == 0 ) {
						if ( ++fCounter >= fLen ) {
							if ( ++rCounter >= current.fieldRepeats ) {
								log.setBytes = ++log.Counter;
								return this;
							}
							fCounter = 0;
						}
						fSize = fields[ fCounter ].size;
						fBitsLeft = fSize;
					}
				}
			}
			log.setBytes = ++log.Counter;
			return this;
		};
		this.getBytes = function() {
			var	bSpaceLeft = byteLenBits;
			var bCounter = 0;
			var cFieldsOverall = currFieldRepeats * fieldsSize;
			var cBytesNumber = cFieldsOverall / byteLenBits;
			if ( !lenDefined && lenAligned ) {
				if ( !isInt(cBytesNumber) ) {
					var errMsg = bfPresets.errs.ERR_LEN_ALIGNED;
					errMsg += ' (getBytes(), fields='+cFieldsOverall+'bits,';
					errMsg += ' byte='+byteLenBits+'bits)';
					return bfPresets.errorHandler( errMsg );
				}
			}
			cBytesNumber = Math.ceil( cBytesNumber );
			var bytes = new bfPresets.byteArray( cBytesNumber );
			for ( var i=0; i < cBytesNumber; i++ ) bytes[i] = 0;
			for ( var r=0; r < currFieldRepeats; r++ ) {
				for ( var i in fieldsIndex ) {
					var fValue = fieldsIndex[i].value[r];
					if ( valsDefined && fieldsSet[i][r] !== true ) {
						var errMsg = bfPresets.errs.ERR_FIELD_VAL_SET;
						errMsg += ' (field='+i+', index='+r+')';
						return bfPresets.errorHandler( errMsg );
					}
					var fSize = fieldsIndex[i].size;
					var fBitsLeft = fSize;
					while ( fBitsLeft ) {
						var fPartSize = bSpaceLeft;
						if ( fBitsLeft < bSpaceLeft ) {
							fPartSize = fBitsLeft;
						}
						var bValuePart = fValue >>> (fBitsLeft - fPartSize);
						bValuePart &= Math.pow(2, fPartSize)-1;
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
			log.getBytes = ++log.Counter;
			return bytes;
		};
		this.valueOf = function() {
			if ( byteLenBits == 8 || byteLenBits == 16 ) {
				var bytes = this.getBytes();
				var str = "";
				for ( var i=0; i < bytes.length; i++ ) {
					str += String.fromCharCode( bytes[i] );
				}
				return str;
			} else {
				var warnMsg = bfPresets.warns.WRN_TOSTR_CONVERSION;
				warnMsg += ' (byte_size=' + byteLenBits + 'bits)';
				bfPresets.warningHandler( warnMsg );
				return Object.prototype.toString.call(this);
			}
		};
	};
})();
if ( typeof exports === 'object' && typeof module !== 'undefined' ) {
	module.exports = NspBitFields;
}
	
	
	
	
	
	
	
	
	
	
	