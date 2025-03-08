
// the globally registered symbols
let s = Object.fromEntries([
    // core
    'getattr', 'setattr', 'hasattr', 'delattr', 'is_instance', 'has_instance', 'is_subclass', 'has_subclass', 'extends_', 'does_extend', 'type_of',
    // supplementary
    'name', 'repr', 'to_string', 'to_boolean', 'force_type_checking',
    // classes
    'prototype', 'init', 'constructor',
    // functions
    'call',
    // boolean operators
    'boolean_and', 'boolean_or', 'boolean_xor', 'boolean_not',
    // comparison
    'eq', 'ne', 'gt', 'ge', 'lt', 'le',
    // logical operators
    'and', 'or', 'xor', 'not',
    // arithmetic
    'add', 'sub', 'increment', 'decrement', 'unary_plus', 'unary_minus',
    // math
    'mul', 'div', 'mod', 'exp', 'and', 'or', 'xor',
    // iterators
    'to_iterator', 'length', 'contains', 'get_item', 'set_item', 'get_slice', 'set_slice',
    // ternary conditional
    'ternary_conditional',
].map(key => [key, Symbol.for('unsure.unsure.' + key)]));
function get_internal_symbol(name) {
    return Symbol.for('unsure.unsure.__REFERENCE_IMPLEMENTATION_DETAILS.' + name);
}
let value = get_internal_symbol('value'); // used for strings

// errors
class UnsureError extends Error {
    type;
    constructor(type, message) {
        super(message);
        this.type = type;
    }
}

// simple error factory
function errorFactory(type, message) {
    return function() {
        throw new UnsureError(type, message.replaceAll('{name}', this[s.constructor][s.name]));
    }
}

// base object defining all those symbols
let baseObject = Object.assign(Object.create(null), {
    [s.getattr](name) {
        let key = typeof name === 'string' ? name : name[s.to_string][value];
        // get rid of undefined
        if (!(key in this)) {
            throw new UnsureError('PropertyError', `property ${key} does not exist in ${this}`);
        }
        return this[key];
    },
    [s.setattr](name, value) {
        this[typeof name === 'string' ? name : name[s.to_string][value]] = value;
    },
    [s.hasattr](name) {
        return boolean((typeof name === 'string' ? name : name[s.to_string][value]) in this);  
    },
    [s.is_instance](value) {
        return value[s.has_instance](this);
    },
    [s.has_instance](value) {
        return value instanceof {prototype: this};
    },
    [s.is_subclass](value) {
        return value[s.has_subclass](this);
    },
    [s.has_subclass](value) {
        return value[s.prototype] instanceof {prototype: this};
    },
    [s.extends_](value) {
        return value[s.does_extend](this);
    },
    [s.does_extend](value) {
        return value[s.is_instance](this) || value[s.is_subclass](this);
    },
    [s.type_of]() {
        return this.constructor;
    },
    [s.init]() {
        return;
    },
    [s.repr]() {
        return string('[{name} does not implement symbol.repr]');
    },
    [s.to_string]() {
        return this[s.repr]();
    },
    [s.to_boolean]() {
        return boolean(true);
    },
    [s.call]: errorFactory('TypeError', '{name} is not callable'),
    [s.boolean_and](value) {
        return boolean(this)[s.boolean_and](value);
    },
    [s.boolean_or](value) {
        return boolean(this)[s.boolean_or](value);
    },
    [s.boolean_xor](value) {
        return boolean(this)[s.boolean_xor](value);
    },
    [s.boolean_not]() {
        return boolean(this)[s.boolean_not]();
    },
    [s.eq](value) {
        return boolean(this === value);
    },
    [s.ne](value) {
        return this[s.eq](value)[s.boolean_not]();
    },
    [s.gt]: errorFactory('TypeError', '{name} does not support comparison'),
    [s.ge]: errorFactory('TypeError', '{name} does not support comparison'),
    [s.lt]: errorFactory('TypeError', '{name} does not support comparison'),
    [s.le]: errorFactory('TypeError', '{name} does not support comparison'),
    [s.and]: errorFactory('TypeError', '{name} does not support boolean operations'),
    [s.or]: errorFactory('TypeError', '{name} does not support boolean operations'),
    [s.xor]: errorFactory('TypeError', '{name} does not support boolean operations'),
    [s.not]: errorFactory('TypeError', '{name} does not support boolean operations'),
    [s.add]: errorFactory('TypeError', '{name} does not support arithmetic operations'),
    [s.sub]: errorFactory('TypeError', '{name} does not support arithmetic operations'),
    [s.increment]: errorFactory('TypeError', '{name} does not support arithmetic operations'),
    [s.decrement]: errorFactory('TypeError', '{name} does not support arithmetic operations'),
    [s.unary_plus]: errorFactory('TypeError', '{name} does not support arithmetic operations'),
    [s.unary_minus]: errorFactory('TypeError', '{name} does not support arithmetic operations'),
    [s.mul]: errorFactory('TypeError', '{name} does not support multiplication'),
    [s.div]: errorFactory('TypeError', '{name} does not support division'),
    [s.mod]: errorFactory('TypeError', '{name} does not support modulo'),
    [s.exp]: errorFactory('TypeError', '{name} does not support exponentiation'),
    [s.to_iterator]: errorFactory('TypeError', '{name} is not iterable'),
    [s.contains]: errorFactory('TypeError', '{name} is not iterable'),
    [s.get_item]: errorFactory('TypeError', '{name} is not iterable'),
    [s.set_item]: errorFactory('TypeError', '{name} is not iterable'),
    [s.get_slice]: errorFactory('TypeError', '{name} is not iterable'),
    [s.set_slice]: errorFactory('TypeError', '{name} is not iterable'),
    [s.ternary_conditional](if_true, if_false) {
        return this[s.to_boolean][value] ? if_true : if_false;
    }
});
// make it so that ((falsy Unsure object) == false) is true
Object.defineProperty(baseObject, Symbol.toPrimitive, {value: function() {
    return this[s.to_boolean][value];
}});

// any, global metaclass
// all unsure variables start with $
let $any = Object.assign(Object.create(null), baseObject, {
    [s.name]: 'any',
    [s.call](...args) {
        let out = Object.create(this[s.prototype]);
        out[s.init](...args);
        out[s.constructor] = this;
        return out;
    },
    [s.prototype]: Object.assign(Object.create(null), baseObject, {
        [s.name]: 'any',
        [s.call]() {
            let out = Object.create(this[s.prototype]);
            out[s.init]();
            out[s.constructor] = this;
            return out;
        },
        [s.prototype]: Object.assign(Object.create(null), baseObject),
    }),
});
let any = $any[s.call].bind($any);

function createSubclass(class_, name, prototype, static = {}) {
    let out = class_[s.call]();
    out[s.name] = name;
    Object.assign(out[s.prototype], prototype);
    Object.assign(out, static);
    return out;
}

// function
let $function = createSubclass($any, 'function', {
    name: '',
    [s.init](...args) {
        if (typeof args[0] === 'function') {
            this[s.call] = args[0];
            this.name = args[1] ?? args[0].name;
        } else {
            this.name = '<anonymous function>';
            this[s.call] = args.length > 0 ? new Function(...args) : () => {};
        }
    },
});
let func = $function[s.call].bind($function);

// any methods
$any.no_proto = func(function(properties) {
    return Object.assign(Object.create(null), properties);
}, 'any.no_proto');

// unknown, any but with type checking
let $unknown = createSubclass($any, 'unknown', {
    [s.name]: 'unknown',
    [s.prototype]: {
        [s.repr]() {
            return string('unknown');
        },
        [s.force_type_checking]: true,
    },
})[s.call]();
let unknown = $unknown[s.call].bind($unknown);

// null
let $null = createSubclass($any, 'null', {
    [s.repr]() {
        return string('null');
    },
    [s.to_boolean]() {
        return boolean(false);
    },
})[s.call]();

// number (abstract class)
// these symbols are for ease of implementation, the number subclasses override them
let number_value = get_internal_symbol('number_value'); // the actual place where the value is stored
let get_number = get_internal_symbol('get_number'); // should be a function returning a JavaScript number
let set_number = get_internal_symbol('set_number'); // should be a function taking in a JavaScript number
let $number = createSubclass($any, 'number', {
    [s.init](value) {
        if (typeof value === 'number' || typeof value === 'bigint') {
            this[set_number](value);
        } else if (get_number in value) {
            this[set_number](value[get_number]);
        } else {
            throw new UnsureError('TypeError', `invalid type for casting to number: ${value[s.constructor][s.name]}`);
        }
    },
    // default values (for typed arrays)
    [s.get_number]() {
        return this[s.number_value][0];
    },
    [s.set_number](value) {
        this[s.number_value][0] = value;  
    },
    [s.to_boolean]() {
        return boolean(this[get_number]() !== 0);
    },
    [s.gt](other) {
        return boolean(this[get_number]() > other[get_number]());
    },
    [s.ge]() {
        return boolean(this[get_number]() >= other[get_number]());
    },
    [s.lt](other) {
        return boolean(this[get_number]() < other[get_number]());
    },
    [s.le](other) {
        return boolean(this[get_number]() <= other[get_number]());
    },
    [s.and](other) {
        return this[s.type_of](this[get_number]() & other[get_number]());
    },
    [s.or](other) {
        return this[s.type_of](this[get_number]() | other[get_number]());
    },
    [s.xor](other) {
        return this[s.type_of](this[get_number]() ^ other[get_number]());
    },
    [s.not]() {
        return this[s.type_of](~this[get_number]());
    },
    [s.add](other) {
        return this[s.type_of](this[get_number]() + other[get_number]());
    },
    [s.sub](other) {
        return this[s.type_of](this[get_number]() - other[get_number]());
    },
    [s.increment]() {
        return this[s.type_of](this[get_number]()++);
    },
    [s.decrement]() {
        return this[s.type_of](this[get_number]()--);
    },
    [s.unary_plus]() {
        return this[s.type_of](+this[get_number]());
    },
    [s.unary_minus]() {
        return this[s.type_of](-this[get_number]());
    },
    [s.mul](other) {
        return this[s.type_of](this[get_number]() * other[get_number]());
    },
    [s.div](other) {
        return this[s.type_of](this[get_number]() / other[get_number]());
    },
    [s.mod](other) {
        return this[s.type_of](this[get_number]() % other[get_number]());
    },
    [s.exp](other) {
        return this[s.type_of](this[get_number]() ** other[get_number]());
    },
});

// flag to set int to either bigint or int32
let INT_IS_INT32 = false;

// flag to set float to either double or float32
let FLOAT_IS_FLOAT32 = false;

// byte
let $byte = Object.assign(Object.create($number), {
    [s.name]: 'byte',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Int8Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + 'b');
        },
    },
});
let byte = $byte[s.call].bind($byte);

// unsigned_byte
let $unsigned_byte = Object.assign(Object.create($number), {
    [s.name]: 'byte',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Uint8Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + 'ub');
        },
    },
});
let unsigned_byte = $unsigned_byte[s.call].bind($unsigned_byte);

// short
let $short = Object.assign(Object.create($number), {
    [s.name]: 'short',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Int16Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + 's');
        },
    },
});
let short = $short[s.call];

// unsigned_short
let $unsigned_short = Object.assign(Object.create($number), {
    [s.name]: 'unsigned_short',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Uint16Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + 'us');
        },
    },
});
let unsigned_short = $unsigned_short[s.call].bind($unsigned_short);

// int32
let $int32 = Object.assign(Object.create($number), {
    [s.name]: 'int32',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Int32Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + (INT_IS_INT32 ? '' : 'i'));
        },
    },
});
let int32 = $int32[s.call].bind($int32);

// unsigned_int32
let $unsigned_int32 = Object.assign(Object.create($number), {
    [s.name]: 'int32',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Uint32Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + 'u' + (INT_IS_INT32 ? '' : 'i'));
        },
    },
});
let unsigned_int32 = $unsigned_int32[s.call].bind($unsigned_int32);

// long
let $long = Object.assign(Object.create($number), {
    [s.name]: 'long',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new BigInt64Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + 'l');
        },
    },
});
let long = $long[s.call].bind($long);

// unsigned_long
let $unsigned_long = Object.assign(Object.create($number), {
    [s.name]: 'unsigned_long',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new BigUint64Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + 'ul');
        },
    },
});
let unsigned_long = $unsigned_long[s.call].bind($unsigned_long);

// bigint
let $bigint = createSubclass($number, 'bigint', {
    [s.init](value) {
        this[s.number_value] = BigInt(value);
    },
    [s.repr]() {
        return string(this[s.number_value] + (INT_IS_INT32 ? 'n' : ''));
    },
    [s.get_number]() {
        return this[s.number_value];
    },
    [s.set_number](value) {
        this[s.number_value] = value;
    },
});
let bigint = $bigint[s.call].bind($bigint);

// float32
let $float32 = Object.assign(Object.create($number), {
    [s.name]: 'float32',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Float32Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + (FLOAT_IS_FLOAT32 ? '' : 'f'));
        },
    },
});
let float32 = $float32[s.call].bind($float32);

// double
let $double = Object.assign(Object.create($number), {
    [s.name]: 'double',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = new Float64Array([value]);
        },
        [s.repr]() {
            return string(this[s.number_value] + (FLOAT_IS_FLOAT32 ? 'd' : ''));
        },
    },
});
let double = $double[s.call].bind($double);

let $int = INT_IS_INT32 ? $int32 : $bigint;
let $float = FLOAT_IS_FLOAT32 ? $float32 : $double;

// boolean
let $boolean = Object.assign(Object.create($number), {
    [s.name]: 'boolean',
    [s.prototype]: {
        [s.init](value) {
            this[s.number_value] = (typeof value === 'object' && value !== null) ? value[s.to_boolean]()[s.number_value] : Boolean(value);
        },
        [s.to_string]() {
            return string(this[s.number_value] ? 'true' : 'false');
        },
        [s.get_number]() {
            return this[s.number_value];
        },
        [s.set_number](value) {
            this[s.number_value] = value;
        },
    },
});
let boolean = $boolean[s.call].bind($boolean);

// symbol
let is_for = get_internal_symbol('is_for'); // used to determine whether it was made with symbol.for
let $symbol = createSubclass($any, '', {
    [s.name]: 'symbol',
    [s.prototype]: {
        [s.init](value = '') {
            if (typeof value === 'symbol') {
                this[value] = value;
                this.name = value.description;
                this[is_for] = value === Symbol.for(value.description);
            }
            this.name = value;
            this[value] = Symbol(value);
            this[is_for] = false;
        },
        [s.repr]() {
            return string(this[is_for] ? `symbol(${this.name})` : `symbol.for(${this.name})`);
        },
        [s.eq](other) {
            return this[value] === other[value];
        },
    },
    for: func(function(name) {
        let out = this[s.call](name);
        out[value] = Symbol.for('unsure.' + name);
        out[is_for] = true;
        return out;
    }, 'symbol.for'),
    ...s.map(symbol),
});
let symbol = $symbol[s.call].bind($symbol);

// string
let $string = createSubclass($any, '', {
    [s.name]: 'string',
    [s.prototype]: {
        [s.init](value) {
            if (typeof value === 'object' && value !== null) {
                this[value] = value[s.to_string];
            } else {
                this[value] = value;
            }
        },
        [s.to_iterator]() {
            let i = 0;
            let data = this[value];
            return {
                next() {
                    let out = data[i];
                    i++;
                    if (i === data.length) {
                        this.done = true;
                    }
                    return out;
                },
                done: false,
            };
        },
        [s.to_string]() {
            return string(this[value]);
        },
        [s.length]() {
            return int32(this[value].length);
        },
        [s.contains](other) {
            return boolean(this[value].includes(other));
        },
        [s.get_item](index) {
            return string(this[value][index[value]]);
        },
        [s.set_item]() {
            throw new UnsureError('TypeError', 'strings are not mutable');
        },
        [s.get_slice](start, stop) {
            return string(this[value].slice(start[value], stop[value]));
        },
        [s.set_slice]() {
            throw new UnsureError('TypeError', 'strings are not mutable');
        },
        upper: func(function() {
            return string(this[value].toUpperCase());
        }, '[string].upper'),
        lower: func(function() {
            return string(this[value].toLowerCase());
        }, '[string].lower'),
    },
});
let string = $string[s.call].bind($string);

// object
let $object = createSubclass($any, '', {
    [s.name]: 'object',
    [s.prototype]: {
        [s.init](...args) {
            if (!([s.to_string] in args[0])) { // checks if unsure object
                Object.assign(this, args[0]);
            } else {
                for (let item of args[s.to_iterator]) {
                    this[item[s.get_item](0)] = item[s.get_item](1);
                }
            }
        },
    },
    assign: func(Object.assign, 'object.assign'),
});
let object = $object[s.call].bind($object);

// array
let $array = createSubclass($any, '', {
    [s.name]: 'array',
    [s.prototype]: {
        [s.init](...args) {
            this[value] = args;
        },
        [s.to_iterator]() {
            let i = 0;
            let data = this[value];
            return {
                next() {
                    let out = data[i];
                    i++;
                    if (i === data.length) {
                        this.done = true;
                    }
                    return out;
                },
                done: false,
            };
        },
        [s.length]() {
            return int32(this[value].length);
        },
        [s.contains](other) {
            return this[value].includes(other);
        },
        [s.get_item](index) {
            let out = this[value][index[value]];
            if (out === undefined) {
                throw new UnsureError('IndexError', `array index out of range: ${index}`);
            } else {
                return out;
            }
        },
        [s.set_item](index, other) {
            index = index[value];
            if (index < 0) {
                index = this[value].length - index;
            }
            this[value][index] = other;
        },
        [s.get_slice](start, stop) {
            return array(...this[value].slice(start, stop));
        },
        [s.set_slice](start, stop, other) {
            for (let i = 0; i < (stop - start); i++) {
                this[value][i + start] = other[i];
            }
        },
    },
});
let array = $array[s.call].bind($array);

// constants
let $true = boolean(true);
let $false = boolean(false);
let $NaN = double(NaN);
let $Infinity = double(Infinity);
