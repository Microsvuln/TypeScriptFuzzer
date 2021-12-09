import { Project, SourceFile, Node } from 'ts-morph'
import * as ts from "typescript"
import * as fs from "fs";

const project = new Project();
// 添加文件
project.addSourceFilesAtPaths("D:/PyCharm 2021.2.1/code/test/*.ts")
let projectFileLength: number = project.getSourceFiles().length;

function randomNum(min: number, max: number): number {
    let range = max - min;
    let rand = Math.random();
    return (min + Math.round(rand * range))
}

// 添加所有的节点
function walkAST(node: Node, selectFileNodes: Node[]) {
    selectFileNodes.push(node)
    node.forEachChild(child => walkAST(child, selectFileNodes))
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

// 进行同类节点之间的替换
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
        console.log("replace", selectNode.getText(), "to", selectNode.getText());
        selectFile.replaceText([selectNode.getStart(), selectNode.getEnd()], replaceNode.getText());
    }

    // console.log();
    // try {
    //     selectFile.transform(traversal => {
    //         const node = traversal.visitChildren();
    //         if (selectNode.compilerNode == node) {
    //             if (targetNodes.length >= 1) {
    //                 let replaceNode: ts.Node = targetNodes[randomNum(0, targetNodes.length - 1)]
    //                 console.log("replace " + node.getText() + " to " + replaceNode.getText());
    //                 console.log("replace " + ts.SyntaxKind[node.kind] + " to " + ts.SyntaxKind[replaceNode.kind]);
    //                 console.log(node.kind, replaceNode.kind);
    //                 console.log(replaceNode);
    //                 return replaceNode;
    //             }
    //         }
    //         return node;
    //     });
    // } catch (ManipulationError) {
    //     console.error(ManipulationError)
    // }
}

function selectLiteral(nodes: Node[]): Node | void {
    let candidateNodes: Node[] = []
    for (let node in nodes) {
        if (nodes[node].getKindName().search("Literal") != -1) {
            candidateNodes.push(nodes[node])
        }
    }

    if (candidateNodes.length >= 1) {
        candidateNodes.forEach(node => console.log(node.getKindName(), node.getText()))
        return candidateNodes[randomNum(0, candidateNodes.length - 1)];
    } else {
        return
    }
}


for (let i = 0; i < 10; i++) {
    // 随机选择一个文件
    let selectFileIndex: number = randomNum(0, projectFileLength - 1);
    let selectFile = project.getSourceFiles()[selectFileIndex];

    // 打印突变之前的代码
    console.log("\nBefore mutate: \"" + selectFile.getText() + "\"");

    // 随机选择一个节点
    let selectFileNodes: Node[] = [];

    walkAST(selectFile, selectFileNodes)

    let selectNode = selectLiteral(selectFileNodes)
    if (selectNode) {
        console.log(selectNode.getKindName());

        // 替换选择的节点
        replaceNodeWithKind(selectFile, selectNode, selectFileIndex);

        // 打印突变之后的代码
        console.log("\nAfter mutate: \"" + selectFile.getText() + "\"");
        console.log("------------");
        // 将突变之后的代码写入文件中
        fs.writeFileSync("D:/PyCharm 2021.2.1/code/result/mutate_file_" + i + ".ts", selectFile.getText())
    }
}

// for (let i = 0; i < 20; i++) {
    // // 随机选择一个文件
    // let selectFileIndex: number = randomNum(0, projectFileLength - 1);    
    // let selectFile = project.getSourceFiles()[selectFileIndex];
    // project.getSourceFiles().forEach(file => process.stdout.write(file.getBaseName() + " "));
    // // 打印突变之前的代码
    // console.log("\nBefore mutate: " + selectFile.getText());

    // // 随机选择一个节点
    // let selectFileNodes: Node[] = [];

    // walkAST(selectFile, selectFileNodes)

    // let selectNodeIndex = randomNum(0, selectFileNodes.length - 1);
    // let selectNode = selectFileNodes[selectNodeIndex]
//     console.log("parent node kind ", selectNode.getParent()?.getKindName());
//     process.stdout.write("child node kind: ")
//     selectNode.getParent()?.getChildren().forEach(child => process.stdout.write(child.getKindName() + " "))
//     console.log("\nselect node kind: " + selectNode.getKindName());

    // // 替换选择的节点
    // replaceNodeWithKind(selectFile, selectNode, selectFileIndex);

    // // 打印突变之后的代码
    // let content:string = selectFile.getText()
    // console.log("After mutate: " + content);
    // console.log("------------");
    // // 将突变之后的代码写入文件中
    // fs.writeFileSync("D:/PyCharm 2021.2.1/code/result/mutate_file_" + i + ".ts", content)
// }