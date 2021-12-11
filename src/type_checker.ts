import * as ts from "typescript"
import * as morph from 'ts-morph'

var sourceCode = `
let cc:number[] = [7, 8, 9];
let ccc: number = cc[0];
let cccc: number = 1;
let ccccc: string = "1";
if (cccc > 1) {
    let dddd: number = 1;
    for(let i = 1; i < 10; i++) {
        console.log(i);
    }
}
`.trim();

const project = new morph.Project();
project.createSourceFile("/test.ts", sourceCode);
let program: morph.Program = project.getProgram()
let checker: morph.TypeChecker = program.getTypeChecker()
let sourceFile: morph.SourceFile = project.getSourceFile("/test.ts")

// for (let stmt of sourceFile.getStatements()) {
//     walkStmt(stmt);
// }


for (let declaration of sourceFile.getVariableDeclarations()) {
    console.log(checker.getTypeText(declaration.getVariableStatement().getType()));
    
}

// TODO 自顶向下的更新Local表

// 根据stmt所在的层次进行遍历
// function walkStmt(stmt: morph.Statement) {
//     // console.log(stmt.getStart(), stmt.getEnd(), stmt.getText(), stmt.getIndentationLevel());
//     // for (let local of stmt.getLocals()) {
//     //     if (local) {
//     //         console.log(local.getName());
//     //     }
//     // }
//     stmt.getSymbol()
//     for(let variable of stmt.getSymbolsInScope(morph.SymbolFlags.Variable)) {
//         if (variable.getName() === "cccc") {
//             if (stmt instanceof morph.VariableStatement) {

                
//             }
//             for(let declaration of variable.getDeclarations()){
//                 console.log(declaration.getText());
//             } 
//         }
//         // console.log(variable.getName());
//     }

//     for (let subStmt of stmt.getDescendantStatements()) {
//         if (subStmt instanceof morph.Statement) {
//             walkStmt(subStmt)
//         }
//     }
// }
// function walkNode(node: Node, depth = 0) {
//     console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.getKind()], node.getStart(), node.getEnd(), node.getText());
//     let type_info = checker.getTypeAtLocation(node).getSymbol()?.getFullyQualifiedName();
//     if (type_info) {
//         console.log(type_info);
//     }
//     depth++;
//     for (let child of node.getChildren()) {
//         walkNode(child, depth)
//     }
// }

// walkNode(sourceFile)