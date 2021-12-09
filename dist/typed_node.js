"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.VariableType = exports.FunctionType = exports.TypedNode = void 0;
class TypedNode {
    constructor(node, children, type, parent) {
        this._variables = [];
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
class VariableType {
    constructor(variableName, variableType) {
        this.variableName = variableName;
        this.variableType = variableType;
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
//# sourceMappingURL=typed_node.js.map