"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const morph = require("ts-morph");
let project = new morph.Project();
project.addSourceFileAtPath("D:/TypeScriptFuzzer/src/a.ts");
let program = project.getProgram();
let sourceFile = project.getSourceFile("a.ts");
let checker = program.getTypeChecker();
function walkNode(node, depth = 0) {
    console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.getKind()], node.getStart(), node.getEnd(), node.getText());
    depth++;
    for (let child of node.getChildren()) {
        walkNode(child, depth);
    }
}
function walk(node) {
    if (node.getKind() == ts.SyntaxKind.VariableDeclaration) {
        // console.log(node.getKindName(), node.getText());
        let variable = node;
        let type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node);
        // console.log(variable.getSymbol().getName());
        // console.log(checker.getTypeText(type));
        // console.log("----------------");
    }
    else if (node.getKind() == ts.SyntaxKind.CallExpression) {
        let callExp = node;
        callExp.getArguments().forEach(arg => console.log(arg.getType().getText(), arg.getText()));
        console.log(callExp.getExpression().getText());
    }
    // else if (node.getKind() == ts.SyntaxKind.FunctionDeclaration) {
    //   let dFunction = <morph.FunctionDeclaration> node
    //   console.log(dFunction.getName());
    //   dFunction.getParameters().forEach(parameter => console.log(parameter.getName(), parameter.getType().getText()))
    //   console.log(dFunction.getReturnType().getText());
    // }
    node.forEachChild(child => walk(child));
}
walkNode(sourceFile);
//# sourceMappingURL=test.js.map