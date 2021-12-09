import { Project, SourceFile, Node } from 'ts-morph'
import * as ts from "typescript"
import { TypedNode, FunctionType, VariableType, Type } from "./typed_node"

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

  }
}

// 根据声明标识符和类型信息寻找到具体标识符，并加入到变量集合当中
function findIdentifier(node: TypedNode, type: Type) {
  if (!node.parent) return;
  

  let flag: boolean = false;

  for (let child of node.parent.children) {
    if (child.node.getKindName() == "Identifier") {
      flag = true;
      child.variables.push(new VariableType(child.node.getText(), type));
      console.log(child.node.getText(), Type[type]);
    }
  }

  if (flag) {
    findIdentifier(node.parent, type);
  }
}

// 遍历树打印具体信息
function walkTypedNode(node: TypedNode, depth = 0) {
  console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.node.getKind()], node.node.getStart(), node.node.getEnd(), node.node.getText());
  depth++;
  for (let child of node.children) {
    walkTypedNode(child, depth)
  }
}


var sourceCode = `
let cc:number[] = [7, 8, 9];
let ccc: number = cc[0];
let cccc: number = 1;
`.trim();

const project = new Project();
project.createSourceFile("/test.ts", sourceCode);
let sourceFile = project.getSourceFile("/test.ts");
let root: TypedNode;
if (sourceFile != undefined) {
  root = creatTypedNode(sourceFile);
  setParentTypeNode(root);
  // inferTypedNode(root);
  walkTypedNode(root);
}
