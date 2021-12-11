import ts = require("typescript");
import {dirname, join} from 'path';
import morph = require("ts-morph")

let project = new morph.Project()
project.addSourceFileAtPath("D:/TypeScriptFuzzer/src/a.ts")
let program: morph.Program = project.getProgram()
let sourceFile: morph.SourceFile = project.getSourceFile("a.ts")
let checker: morph.TypeChecker = program.getTypeChecker();

function walk(node: morph.Node) {
    if (node.getKind() == ts.SyntaxKind.VariableDeclaration) {
        console.log(node.getKindName(), node.getText());
        let variable: morph.VariableDeclaration = <morph.VariableDeclaration>node;
        let type: morph.Type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node)
        
        console.log(variable.getSymbol().getName());
        
        console.log(checker.getTypeText(type));
        console.log("----------------");
    }
    node.forEachChild(child => walk(child))
}

walk(sourceFile)