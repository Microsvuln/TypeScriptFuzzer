import { Project, SourceFile, Node, TypeNode, VariableDeclaration, TypeChecker } from 'ts-morph'
import * as ts from "typescript"
import { TypedNode, FunctionType, VariableType, Type, VariableSet, strToType, LiteralNameFactory, LiteralType } from "./typed_node"

const project = new Project();
// 添加文件
project.addSourceFilesAtPaths("D:/PyCharm 2021.2.1/code/test/*.ts")
let literalNameFactory = new LiteralNameFactory()

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

// 自底向上的更新节点的可用变量
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

// 通过变量的声明语句为树添加初始的变量
function initVariables(node: TypedNode) {
  if (node.node.getKind() == ts.SyntaxKind.VariableDeclaration) {
    let checker = node.node.getProject().getProgram().getTypeChecker()
    let symbol = node.node.getSymbol()
    let type = checker.getTypeOfSymbolAtLocation(symbol, node.node)
    node.variables.add(new VariableType(symbol.getName(), strToType(type.getText())))
  }
  // } else if (node.node.getKindName().search("Literal") != -1) {
  //   let checker = node.node.getProject().getProgram().getTypeChecker()
  //   console.log(checker);

  // node.literals.add(new LiteralType(strToType(type.getText()), node.node.getText(), literalNameFactory))
  // console.log(strToType(type.getText()), node.node.getText())
  // }

  node.children.forEach(child => initVariables(child))
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
  selectFileNodes.push(node.node)
  for (let child of node.children) {
    walkAST(child);
  }
}

function randomNum(min: number, max: number): number {
  let range = max - min;
  let rand = Math.random();
  return (min + Math.round(rand * range))
}

function replaceNodeWithKind(selectFile: SourceFile, selectNode: Node, selectFileIndex: number) {
  let targetNodes: Node[] = []
  for (let i in project.getSourceFiles()) {
    if (Number(i) != selectFileIndex) {
      walkASTWithKind(project.getSourceFiles()[i], selectNode.getKind(), targetNodes)
    }
  }

  targetNodes.forEach(node => process.stdout.write(node.getText().trim() + " "))

  if (targetNodes.length >= 1) {
    let replaceNode: Node = targetNodes[randomNum(0, targetNodes.length - 1)];
    console.log("replace", selectNode.getText(), "to", replaceNode.getText());
    selectFile.replaceText([selectNode.getStart(), selectNode.getEnd()], replaceNode.getText());
  }
}

function selectLiteral(nodes: Node[]): Node | void {
  let candidateNodes: Node[] = []
  for (let node in nodes) {
      if (nodes[node].getKindName().search("Literal") != -1) {
          candidateNodes.push(nodes[node])
      }
  }

  if (candidateNodes.length >= 1) {
      // candidateNodes.forEach(node => console.log(node.getKindName(), node.getText()))
      return candidateNodes[randomNum(0, candidateNodes.length - 1)];
  } else {
      return
  }
}

// 选择具有指定类型的节点
function walkASTWithKind(node: Node, kind: number, replaceNodes: Node[]) {
  // console.log("find type " + node.getKindName());
  // console.log("require type " + kindName);
  if (node.compilerNode.kind == kind) {
    replaceNodes.push(node);
  }
  node.forEachChild(child => walkASTWithKind(child, kind, replaceNodes));
}

let allASTs: TypedNode[] = []
// 对于所有的文件构建TypedNode树
for (let sourceFile of project.getSourceFiles()) {
  if (sourceFile != undefined) {
    let root: TypedNode;
    root = creatTypedNode(sourceFile);
    // walkTypedNode(root)
    setParentTypeNode(root);
    initVariables(root);
    updateVariables(root);
    allASTs.push(root);
  }
}

// 突变10次
for (let i = 0; i < 10; i++) {
  //随机选择一个树
  let index = randomNum(0, allASTs.length - 1)
  let selectTree = allASTs[index]
  var selectFileNodes: Node[] = []
  console.log("\nBefore mutate: \"" + selectTree.node.getText() + "\"");
  walkAST(selectTree)
  //随机选择一个节点
  let selectNode = selectLiteral(selectFileNodes)
  if (selectNode) {
      console.log(selectNode.getKindName());

      // 替换选择的节点
      replaceNodeWithKind(selectTree.node.getSourceFile(), selectNode, index);

      // 打印突变之后的代码
      console.log("\nAfter mutate: \"" + selectTree.node.getText() + "\"");
      console.log("------------");
      // 将突变之后的代码写入文件中
      // fs.writeFileSync("D:/PyCharm 2021.2.1/code/result/mutate_file_" + i + ".ts", selectFile.getText())
  }
}
