"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableSet = exports.Type = exports.VariableType = exports.FirstLiteralTokenFactory = exports.FunctionType = exports.TypedNode = void 0;
class TypedNode {
    constructor(node, children, type, parent) {
        this._variables = new VariableSet();
        this._functions = [];
        this._node = node;
        this._type = type;
        this._children = children;
        this._parent = parent;
    }
    get node() {
        return this._node;
    }
    set node(node) {
        this._node = node;
    }
    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
    }
    get children() {
        return this._children;
    }
    set children(value) {
        this._children = value;
    }
    get parent() {
        return this._parent;
    }
    set parent(parent) {
        this._parent = parent;
    }
    get variables() {
        return this._variables;
    }
    set variables(value) {
        this._variables = value;
    }
    get functions() {
        return this._functions;
    }
    set functions(value) {
        this._functions = value;
    }
    get firstLiteralToken() {
        return this._firstLiteralToken;
    }
    set firstLiteralToken(value) {
        this._firstLiteralToken = value;
    }
}
exports.TypedNode = TypedNode;
class FunctionType {
    constructor(functionName, returnType, paramsType) {
        this.functionName = functionName;
        this.returnType = returnType;
        this.paramsType = paramsType;
    }
}
exports.FunctionType = FunctionType;
class FirstLiteralToken {
    constructor(value, name) {
        this._name = name;
        this._value = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
}
class FirstLiteralTokenFactory {
    constructor() {
        this._count = 0;
    }
    getCommaToken(value) {
        return new FirstLiteralToken(value, "i" + this._count++);
    }
}
exports.FirstLiteralTokenFactory = FirstLiteralTokenFactory;
class VariableType {
    constructor(variableName, variableType) {
        this._variableName = variableName;
        this._variableType = variableType;
    }
    get variableType() {
        return this._variableType;
    }
    set variableType(value) {
        this._variableType = value;
    }
    get variableName() {
        return this._variableName;
    }
    set variableName(value) {
        this._variableName = value;
    }
    equals(type) {
        return type.variableName === this.variableName && type.variableType === this.variableType;
    }
}
exports.VariableType = VariableType;
var Type;
(function (Type) {
    Type[Type["Funtion"] = 0] = "Funtion";
    Type[Type["Number"] = 1] = "Number";
    Type[Type["Boolean"] = 2] = "Boolean";
    Type[Type["String"] = 3] = "String";
    Type[Type["Array"] = 4] = "Array";
    Type[Type["Object"] = 5] = "Object";
    Type[Type["Expression"] = 6] = "Expression";
})(Type = exports.Type || (exports.Type = {}));
class VariableSet extends Set {
    add(value) {
        let found = false;
        this.forEach(item => {
            if (value.equals(item)) {
                found = true;
            }
        });
        if (!found) {
            super.add(value);
        }
        return this;
    }
}
exports.VariableSet = VariableSet;
//# sourceMappingURL=typed_node.js.map