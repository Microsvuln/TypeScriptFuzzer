import ts = require("typescript");
import morph = require("ts-morph")

let project = new morph.Project()
project.addSourceFileAtPath("D:/TypeScriptFuzzer/src/a.ts")
let program: morph.Program = project.getProgram()
let sourceFile: morph.SourceFile = project.getSourceFile("a.ts")
let checker: morph.TypeChecker = program.getTypeChecker();

function walkNode(node: morph.Node, depth = 0) {
  console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.getKind()], node.getStart(), node.getEnd(), node.getText());
  depth++;
  for (let child of node.getChildren()) {
    walkNode(child, depth)
  }
}

function walk(node: morph.Node) {
  if (node.getKind() == ts.SyntaxKind.VariableDeclaration) {
    // console.log(node.getKindName(), node.getText());
    let variable: morph.VariableDeclaration = <morph.VariableDeclaration>node;
    let type: morph.Type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node)

    // console.log(variable.getSymbol().getName());

    // console.log(checker.getTypeText(type));
    // console.log("----------------");
  } else if (node.getKind() == ts.SyntaxKind.CallExpression) {
    let callExp = <morph.CallExpression>node
    callExp.getArguments().forEach(arg => console.log(arg.getType().getText(), arg.getText()));
    console.log(callExp.getExpression().getText());
  }

  // else if (node.getKind() == ts.SyntaxKind.FunctionDeclaration) {
  //   let dFunction = <morph.FunctionDeclaration> node
  //   console.log(dFunction.getName());
  //   dFunction.getParameters().forEach(parameter => console.log(parameter.getName(), parameter.getType().getText()))
  //   console.log(dFunction.getReturnType().getText());
  // }
  node.forEachChild(child => walk(child))
}

walk(sourceFile)