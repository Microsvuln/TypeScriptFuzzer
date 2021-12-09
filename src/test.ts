import { Project, SourceFile, Node, TypeNode } from 'ts-morph'
import * as ts from "typescript"
import { TypedNode, FunctionType, VariableType, Type, VariableSet, FirstLiteralTokenFactory } from "./typed_node"

// 自底向上构建类型树
function creatTypedNode(node: Node, parent?: TypedNode): TypedNode {
  let children: TypedNode[] = [];

  for (let child of node.getChildren()) {
    children.push(creatTypedNode(child));
  }

  let typedNode = new TypedNode(node, children);
  return typedNode
}

//自顶向下为树添加父节点
function setParentTypeNode(node: TypedNode) {
  for (let child of node.children) {
    child.parent = node;
    setParentTypeNode(child);
  }
}

// 自底向上的为节点添加类型信息
function inferTypedNode(node: TypedNode) {
  for (let child of node.children) {
    inferTypedNode(child);
  }

  switch (node.node.getKindName()) {
    case "NumberKeyword": {
      findIdentifier(node, Type.Number);
    }
    case "FirstLiteralToken": {
      node.firstLiteralToken = firstLiteralTokenFactory.getCommaToken(Number(node.node.getText()))
    }
  }
}

// 先序遍历更新可用变量节点
function updateVariables(node: TypedNode) {
  for (let child of node.children) {
    updateVariables(child)
  }

  node.variables.forEach(variable => node.parent?.variables.add(variable));

  if (node.parent) {
    let children = node.parent.children;
    if (children.indexOf(node) >= 1) {
      for (let i = children.indexOf(node) + 1; i < children.length; i++) {
        node.variables.forEach(variable => node.parent?.children[i].variables.add(variable));
      }
    }
  }
}

// 根据声明标识符和类型信息寻找到具体标识符，并加入到变量集合当中
function findIdentifier(node: TypedNode, type: Type) {
  if (!node.parent) return;


  let flag: boolean = false;

  for (let child of node.parent.children) {
    if (child.node.getKindName() == "Identifier") {
      flag = true;
      child.variables.add(new VariableType(child.node.getText(), type));
    }
  }

  if (!flag) {
    findIdentifier(node.parent, type);
  }
}

// 遍历树打印具体信息
function walkTypedNode(node: TypedNode, depth = 0) {
  console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.node.getKind()], node.node.getStart(), node.node.getEnd(), node.node.getText());
  node.variables.forEach(variable => process.stdout.write(variable.variableName + " "));
  depth++;
  for (let child of node.children) {
    walkTypedNode(child, depth)
  }
}

function walkAST(node: TypedNode) {
  // console.log(node.node.getKindName()); 
  if (node.node.getKindName() === "NumericLiteral") {
    potentialNodes.push(node);
  }
  for (let child of node.children) {
    walkAST(child);
  }
}

function randomNum(min: number, max: number): number {
  let range = max - min;
  let rand = Math.random();
  return (min + Math.round(rand * range))
}

var sourceCode = `
let cc:number[] = [7, 8, 9];
let ccc: number = cc[0];
let cccc: number = 1;
let ccccc: string = "1";
`.trim();
console.log("before mutate: " + sourceCode);

const project = new Project();
project.createSourceFile("/test.ts", sourceCode);
let firstLiteralTokenFactory = new FirstLiteralTokenFactory();
// const project = new Project();
// // 添加文件
// project.addSourceFilesAtPaths("D:/PyCharm 2021.2.1/code/test/*.ts")
let sourceFile = project.getSourceFile("/test.ts");
let root: TypedNode;
// 得到所有节点
let potentialNodes: TypedNode[] = []
if (sourceFile != undefined) {
  root = creatTypedNode(sourceFile);
  setParentTypeNode(root);
  inferTypedNode(root);
  updateVariables(root);
  // walkTypedNode(root);
  walkAST(root);
  if (potentialNodes.length > 0) {
    let targetNode = potentialNodes[randomNum(0, potentialNodes.length - 1)];
    let replaceText = "";
    let idx = randomNum(0, targetNode.variables.size)
    let count = 0;
    for (let entry of targetNode.variables) {
      if (count === idx) {
        replaceText = entry.variableName
        break;
      }
    }
    sourceFile.replaceText([targetNode.node.getStart(), targetNode.node.getEnd()], replaceText)
  }
  console.log("after mutate: " + root.node.getText());
}
