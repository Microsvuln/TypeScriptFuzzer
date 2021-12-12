import ts = require("typescript");
import morph = require("ts-morph")

let project = new morph.Project()
project.addSourceFileAtPath("D:/TypeScriptFuzzer/src/a.ts")
let program: morph.Program = project.getProgram()
let sourceFile: morph.SourceFile = project.getSourceFile("a.ts")
let checker: morph.TypeChecker = program.getTypeChecker();

function walkTypedNode(node: morph.Node, depth = 0) {
    console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.getKind()], node.getStart(), node.getEnd(), node.getText());
    depth++;
    for (let child of node.getChildren()) {
      walkTypedNode(child, depth)
    }
  }

function walk(node: morph.Node) {
    if (node.getKind() == ts.SyntaxKind.VariableDeclaration) {
        console.log(node.getKindName(), node.getText());
        let variable: morph.VariableDeclaration = <morph.VariableDeclaration>node;
        let type: morph.Type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node)
        
        console.log(variable.getSymbol().getName());
        
        console.log(checker.getTypeText(type));
        console.log("----------------");
    } else if(node.getKind() == ts.SyntaxKind.ExpressionStatement) {
        console.log(node.getKindName(), node.getText());
        let stmt: morph.ExpressionStatement = <morph.ExpressionStatement>node;
        stmt.getDescendants().forEach(n => console.log(checker.getTypeAtLocation(n)?.getText(), n.getText(), n.getKindName()));
        
        // let type: morph.Type = checker.getTypeOfSymbolAtLocation(variable.getSymbol(), node)
        
        // console.log(variable.getSymbol().getName());
        
        // console.log(checker.getTypeText(type))
    }
    node.forEachChild(child => walk(child))
}

walk(sourceFile)