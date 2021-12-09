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
    private _firstLiteralToken: FirstLiteralToken | undefined;

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

    public get firstLiteralToken(): FirstLiteralToken | undefined {
        return this._firstLiteralToken;
    }
    public set firstLiteralToken(value: FirstLiteralToken | undefined) {
        this._firstLiteralToken = value;
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

class FirstLiteralToken {
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

export class FirstLiteralTokenFactory{
    private _count: number = 0;

    public getCommaToken(value: number) :FirstLiteralToken{
        return new FirstLiteralToken(value, "i" + this._count++)
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

export enum Type {
    Funtion,
    Number,
    Boolean,
    String,
    Array,
    Object,
    Expression
}

interface SetItem {
    equals(other: SetItem): boolean;
}

export class VariableSet<T extends SetItem> extends Set<T> {
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