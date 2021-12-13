"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySet = exports.LiteralType = exports.VariableType = exports.LiteralNameFactory = exports.FunctionType = exports.TypedNode = void 0;
class TypedNode {
    constructor(node, children, type, parent) {
        this._variables = new MySet();
        this._functions = new MySet();
        this._literals = new MySet();
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
    get literals() {
        return this._literals;
    }
    set literals(value) {
        this._literals = value;
    }
    equals(node) {
        return node.node.getText() === this.node.getText();
    }
}
exports.TypedNode = TypedNode;
class FunctionType {
    constructor(functionName, returnType, paramsType) {
        this.functionName = functionName;
        this.returnType = returnType;
        this.paramsType = paramsType;
    }
    equals(func) {
        let isParamsequal = true;
        let flag = false;
        for (let p of func.paramsType) {
            for (let q of this.paramsType) {
                if (p.variableType === q.variableType) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                isParamsequal = false;
                break;
            }
            else {
                flag = false;
            }
        }
        return isParamsequal && func.functionName === this.functionName && func.returnType === this.returnType;
    }
}
exports.FunctionType = FunctionType;
class LiteralToken {
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
class LiteralNameFactory {
    constructor() {
        this._count = 0;
    }
    getLiteralName() {
        return "i" + this._count++;
    }
}
exports.LiteralNameFactory = LiteralNameFactory;
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
class LiteralType {
    constructor(literalType, literalValue, literalNameFactory) {
        this._literalName = literalNameFactory.getLiteralName();
        this._literalType = literalType;
        this.literalValue = literalValue;
    }
    get literalType() {
        return this._literalType;
    }
    set literalType(value) {
        this._literalType = value;
    }
    get literalName() {
        return this._literalName;
    }
    set literalName(value) {
        this._literalName = value;
    }
    get literalValue() {
        return this._literalValue;
    }
    set literalValue(value) {
        this._literalValue = value;
    }
    equals(type) {
        return type.literalType === this.literalType && type._literalValue === this._literalValue;
    }
}
exports.LiteralType = LiteralType;
class MySet extends Set {
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
exports.MySet = MySet;
//# sourceMappingURL=typed_node.js.map