import { Project, SourceFile, Node } from 'ts-morph'
import * as ts from "typescript"

export class TypedNode {
    private _node: Node;
    private _type: string | undefined;
    private _children: TypedNode[];
    private _parent: TypedNode | undefined;
    private _variables: VariableType[]  = [];
    private _functions: FunctionType[] = [];


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

    public get variables(): VariableType[] {
        return this._variables;
    }
    public set variables(value: VariableType[]) {
        this._variables = value;
    }

    public get functions(): FunctionType[] {
        return this._functions;
    }
    public set functions(value: FunctionType[]) {
        this._functions = value;
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

export class VariableType {
    variableName: string;
    variableType: Type;

    constructor(variableName: string, variableType: Type) {
        this.variableName = variableName;
        this.variableType = variableType;
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