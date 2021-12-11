import exp from 'constants';
import { Project, SourceFile, Node } from 'ts-morph'
import * as ts from "typescript"

export class TypedNode {
    private _node: Node;
    private _type: string | undefined;
    private _children: TypedNode[];
    private _parent: TypedNode | undefined;
    private _variables: VariableSet<VariableType> = new VariableSet();
    private _functions: FunctionType[] = [];
    private _literals: LiteralSet<LiteralType> = new LiteralSet();

    constructor(node: Node, children: TypedNode[], type?: string, parent?: TypedNode) {
        this._node = node;
        this._type = type;
        this._children = children;
        this._parent = parent;
    }

    public get node(): Node {
        return this._node;
    }
    public set node(node: Node) {
        this._node = node;
    }

    public get type(): string | undefined {
        return this._type;
    }
    public set type(type: string | undefined) {
        this._type = type;
    }

    public get children(): TypedNode[] {
        return this._children;
    }
    public set children(value: TypedNode[]) {
        this._children = value;
    }

    public get parent(): TypedNode | undefined {
        return this._parent;
    }
    public set parent(parent: TypedNode | undefined) {
        this._parent = parent;
    }

    public get variables(): VariableSet<VariableType> {
        return this._variables;
    }
    public set variables(value: VariableSet<VariableType>) {
        this._variables = value;
    }

    public get functions(): FunctionType[] {
        return this._functions;
    }
    public set functions(value: FunctionType[]) {
        this._functions = value;
    }

    public get literals(): LiteralSet<LiteralType> {
        return this._literals;
    }
    public set literals(value: LiteralSet<LiteralType>) {
        this._literals = value;
    }
}

export class FunctionType {
    functionName: string;
    returnType: ts.SyntaxKind;
    paramsType: VariableType[];

    constructor(functionName: string, returnType: ts.SyntaxKind, paramsType: VariableType[]) {
        this.functionName = functionName;
        this.returnType = returnType;
        this.paramsType = paramsType;
    }
}

class LiteralToken {
    private _value: number;
    private _name: string;

    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        this._value = value;
    }

    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    constructor(value: number, name: string) {
        this._name = name;
        this._value = value;
    }
}

export class LiteralNameFactory {
    private _count: number = 0;

    public getLiteralName(): string {
        return "i" + this._count++
    }
}


export class VariableType {
    private _variableName: string;
    private _variableType: Type;

    public get variableType(): Type {
        return this._variableType;
    }
    public set variableType(value: Type) {
        this._variableType = value;
    }
    public get variableName(): string {
        return this._variableName;
    }
    public set variableName(value: string) {
        this._variableName = value;
    }

    constructor(variableName: string, variableType: Type) {
        this._variableName = variableName;
        this._variableType = variableType;
    }

    equals(type: VariableType): boolean {
        return type.variableName === this.variableName && type.variableType === this.variableType;
    }
}

export class LiteralType {
    private _literalName: string;
    private _literalType: Type;
    private _literalValue: any;

    public get literalType(): Type {
        return this._literalType;
    }
    public set literalType(value: Type) {
        this._literalType = value;
    }
    public get literalName(): string {
        return this._literalName;
    }
    public set literalName(value: string) {
        this._literalName = value;
    }

    constructor(literalType: Type, literalValue: any, literalNameFactory: LiteralNameFactory) {
        this._literalName = literalNameFactory.getLiteralName()
        this._literalType = literalType;
        this.literalValue = literalValue;
    }

    public get literalValue(): any {
        return this._literalValue;
    }
    public set literalValue(value: any) {
        this._literalValue = value;
    }

    equals(type: LiteralType): boolean {
        return type.literalName === this.literalName && type.literalType === this.literalType && type._literalValue === this._literalValue;
    }
}

export enum Type {
    Number,
    Boolean,
    String,
    Array,
    Any,
    Function,
    Object,
    Union,
    Interface,
    Undefined,
    Enum
}

export function strToType(stype: string): Type {
    for (let type in Type) {
        if (typeof Type[type] === "string") {
            if (Type[type].toLowerCase() === stype) {
                return (<any>Type)[Type[type]];
            }
        }
    }

    return Type.Undefined;
}

interface Compareable {
    equals(other: Compareable): boolean;
}

export class VariableSet<T extends Compareable> extends Set<T> {
    add(value: T): this {
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

export class LiteralSet<T extends Compareable> extends Set<T> {
    add(value: T): this {
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