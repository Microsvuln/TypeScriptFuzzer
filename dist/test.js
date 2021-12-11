"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const morph = require("ts-morph");
let project = new morph.Project();
project.addSourceFileAtPath("D:/TypeScriptFuzzer/src/a.ts");
let program = project.getProgram();
let sourceFile = project.getSourceFile("a.ts");
let checker = program.getTypeChecker();
function walk(node) {
    if (node.getKind() == ts.SyntaxKind.VariableDeclaration) {
        console.log(node.getKindName(), node.getText());
        let variable = node;
        let type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node);
        console.log(variable.getSymbol().getName());
        console.log(checker.getTypeText(type));
        console.log("----------------");
    }
    node.forEachChild(child => walk(child));
}
walk(sourceFile);
//# sourceMappingURL=test.js.map