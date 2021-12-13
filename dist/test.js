"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const morph = require("ts-morph");
let project = new morph.Project();
project.addSourceFileAtPath("D:/TypeScriptFuzzer/src/a.ts");
let program = project.getProgram();
let sourceFile = project.getSourceFile("a.ts");
let checker = program.getTypeChecker();
function walkTypedNode(node, depth = 0) {
    console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.getKind()], node.getStart(), node.getEnd(), node.getText());
    depth++;
    for (let child of node.getChildren()) {
        walkTypedNode(child, depth);
    }
}
function walk(node) {
    if (node.getKind() == ts.SyntaxKind.VariableDeclaration) {
        console.log(node.getKindName(), node.getText());
        let variable = node;
        let type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node);
        console.log(variable.getSymbol().getName());
        console.log(checker.getTypeText(type));
        console.log("----------------");
    } //else if(node.getKind() == ts.SyntaxKind.ExpressionStatement) {
    // console.log(node.getKindName(), node.getText());
    // let stmt: morph.ExpressionStatement = <morph.ExpressionStatement>node;
    // stmt.getDescendants().forEach(n => console.log(checker.getTypeAtLocation(n)?.getText(), n.getText(), n.getKindName()));
    // let type: morph.Type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node)
    // console.log(variable.getSymbol().getName());
    // console.log(checker.getTypeText(type))
    // }
    node.forEachChild(child => walk(child));
}
walk(sourceFile);
//# sourceMappingURL=test.js.map