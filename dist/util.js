"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const morph = __importStar(require("ts-morph"));
const ts = __importStar(require("typescript"));
const typed_node_1 = require("./typed_node");
const project = new morph.Project();
// 添加文件
project.addSourceFilesAtPaths("D:/PyCharm 2021.2.1/code/test/*.ts");
let literalNameFactory = new typed_node_1.LiteralNameFactory();
// 自底向上构建类型树
function creatTypedNode(node, parent) {
    let children = [];
    for (let child of node.getChildren()) {
        children.push(creatTypedNode(child));
    }
    let typedNode = new typed_node_1.TypedNode(node, children);
    return typedNode;
}
//自顶向下为树添加父节点
function setParentTypeNode(node) {
    for (let child of node.children) {
        child.parent = node;
        setParentTypeNode(child);
    }
}
// 自底向上的为节点添加类型信息
function inferTypedNode(node) {
    for (let child of node.children) {
        inferTypedNode(child);
    }
    switch (node.node.getKindName()) {
        case "NumberKeyword": {
            findIdentifier(node, "number");
        }
    }
}
// 自底向上的更新节点的可用变量
function updateVariables(node) {
    for (let child of node.children) {
        updateVariables(child);
    }
    node.variables.forEach(variable => { var _a; return (_a = node.parent) === null || _a === void 0 ? void 0 : _a.variables.add(variable); });
    if (node.parent) {
        let children = node.parent.children;
        if (children.indexOf(node) >= 1) {
            for (let i = children.indexOf(node) + 1; i < children.length; i++) {
                node.variables.forEach(variable => { var _a; return (_a = node.parent) === null || _a === void 0 ? void 0 : _a.children[i].variables.add(variable); });
            }
        }
    }
}
// 通过变量的声明语句为树添加初始的变量
function initVariables(node) {
    if (node.node.getKind() == ts.SyntaxKind.VariableDeclaration) {
        let checker = node.node.getProject().getProgram().getTypeChecker();
        let symbol = node.node.getSymbol();
        let type = checker.getTypeOfSymbolAtLocation(symbol, node.node);
        node.variables.add(new typed_node_1.VariableType(symbol.getName(), type.getText().toLowerCase()));
    }
    else if (node.node.getKindName().search("Literal") != -1) {
        let checker = node.node.getProject().getProgram().getTypeChecker();
        let type = checker.getBaseTypeOfLiteralType(node.node.getType()).getText();
        node.literals.add(new typed_node_1.LiteralType(type.toLowerCase(), node.node.getText(), literalNameFactory));
    }
    else if (node.node.getKindName().search("FalseKeyword") != -1) {
        node.literals.add(new typed_node_1.LiteralType("boolean", false, literalNameFactory));
    }
    else if (node.node.getKindName().search("TrueKeyword") != -1) {
        node.literals.add(new typed_node_1.LiteralType("boolean", true, literalNameFactory));
    }
    node.children.forEach(child => initVariables(child));
}
// 根据声明标识符和类型信息寻找到具体标识符，并加入到变量集合当中
function findIdentifier(node, type) {
    if (!node.parent)
        return;
    let flag = false;
    for (let child of node.parent.children) {
        if (child.node.getKindName() == "Identifier") {
            flag = true;
            child.variables.add(new typed_node_1.VariableType(child.node.getText(), type));
        }
    }
    if (!flag) {
        findIdentifier(node.parent, type);
    }
}
// 遍历树打印具体信息
function walkTypedNode(node, depth = 0) {
    console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.node.getKind()], node.node.getStart(), node.node.getEnd(), node.node.getText());
    node.variables.forEach(variable => process.stdout.write(variable.variableName + " "));
    depth++;
    for (let child of node.children) {
        walkTypedNode(child, depth);
    }
}
function walkAST(node, depth = 0) {
    console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.getKind()], node.getStart(), node.getEnd(), node.getText());
    depth++;
    for (let child of node.getChildren()) {
        walkAST(child, depth);
    }
}
function randomNum(min, max) {
    let range = max - min;
    let rand = Math.random();
    return (min + Math.round(rand * range));
}
function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}
function replaceNode(node, allASTs, selectFileIndex) {
    var _a;
    let targets = new Set();
    let declarationStmt = node.node.compilerNode;
    let targetType;
    if (declarationStmt.type) {
        targetType = (_a = declarationStmt.type) === null || _a === void 0 ? void 0 : _a.getText();
    }
    else {
        let checker = node.node.getProject().getProgram().getTypeChecker().compilerObject;
        targetType = checker.typeToString(checker.getTypeAtLocation(declarationStmt.initializer));
    }
    let selectNode = declarationStmt.initializer;
    // 在目标节点中添加 1.自己文件中类型匹配的变量或常量 2.其他文件中的常量
    for (let i in allASTs) {
        if (targetType == "any") {
            allASTs[i].literals.forEach(literal => targets.add(literal.literalValue));
        }
        else {
            for (let literal of allASTs[i].literals) {
                if (literal.literalType === targetType) {
                    targets.add(literal.literalValue);
                }
            }
        }
        if (Number(i) == selectFileIndex) {
            for (let variable of allASTs[i].variables) {
                if (variable.variableType === targetType) {
                    targets.add(variable.variableName);
                }
            }
        }
    }
    targets.delete(declarationStmt.name.getText());
    targets.delete(declarationStmt.initializer.getText());
    console.log("select node:" + selectNode.getText(), targetType);
    process.stdout.write("target node: ");
    targets.forEach(target => process.stdout.write(target + " "));
    if (targets.size >= 1) {
        let targetsArray = Array.from(targets);
        let replaceText = targetsArray[randomNum(0, targetsArray.length - 1)];
        console.log("\nreplace", selectNode.getText(), "to", replaceText);
        // node.node.getSourceFile().replaceText([selectNode.getStart(), selectNode.getEnd()], replaceText);
        // console.log(selectNode.getStart(), selectNode.getEnd());
        console.log("\nAfter mutate: " + replaceRange(selectNode.getSourceFile().getFullText(), selectNode.getStart(), selectNode.getEnd(), replaceText));
    }
}
function walkByType(node, type, targets) {
    for (let variable of node.variables) {
        if (variable.variableType === type) {
            targets.add(variable.variableName);
        }
    }
    node.children.forEach(child => walkByType(child, type, targets));
}
function selectLiteral(nodes) {
    let candidateNodes = [];
    for (let node in nodes) {
        if (nodes[node].getKindName().search("Literal") != -1) {
            candidateNodes.push(nodes[node]);
        }
    }
    if (candidateNodes.length >= 1) {
        // candidateNodes.forEach(node => console.log(node.getKindName(), node.getText()))
        return candidateNodes[randomNum(0, candidateNodes.length - 1)];
    }
    else {
        return;
    }
}
function selectCandidateNodes(node, candidateNode) {
    // 增加变量声明语句到候选中
    if (node.node.getKind() == ts.SyntaxKind.VariableDeclaration) {
        candidateNode.add(node);
    }
    node.children.forEach(child => selectCandidateNodes(child, candidateNode));
    return candidateNode;
}
// 自底向上的将所有的literal汇总至根节点中
function updateLiterals(node) {
    node.children.forEach(child => updateLiterals(child));
    node.literals.forEach(literal => { var _a; return (_a = node.parent) === null || _a === void 0 ? void 0 : _a.literals.add(literal); });
}
// 选择具有指定类型的节点
function walkASTWithKind(node, kind, replaceNodes) {
    // console.log("find type " + node.getKindName());
    // console.log("require type " + kindName);
    if (node.compilerNode.kind == kind) {
        replaceNodes.push(node);
    }
    node.forEachChild(child => walkASTWithKind(child, kind, replaceNodes));
}
let allASTs = [];
// 对于所有的文件构建TypedNode树
for (let sourceFile of project.getSourceFiles()) {
    // console.log(sourceFile.getBaseName());
    // console.log(sourceFile.getText());
    if (sourceFile != undefined) {
        // walkAST(sourceFile)
        let root;
        root = creatTypedNode(sourceFile);
        // walkTypedNode(root)
        setParentTypeNode(root);
        initVariables(root);
        updateVariables(root);
        updateLiterals(root);
        // console.log("variables value ---------------");
        // root.variables.forEach(variable => console.log(variable.variableName, Type[variable.variableType]))
        // console.log("literals value ---------------");
        // root.literals.forEach(literal => console.log(Type[literal.literalType], literal.literalName, literal.literalValue))
        allASTs.push(root);
    }
}
// 突变10次
for (let i = 0; i < 10; i++) {
    //随机选择一个树
    let index = randomNum(0, allASTs.length - 1);
    let selectTree = allASTs[index];
    console.log("\nBefore mutate: \"" + selectTree.node.getText() + "\"");
    //随机选择一个节点
    let candidateNodes = new typed_node_1.TypedNodeSet();
    selectCandidateNodes(selectTree, candidateNodes);
    let candidateNodesArray = Array.from(candidateNodes);
    let selectNode = candidateNodesArray[randomNum(0, candidateNodesArray.length - 1)];
    if (selectNode) {
        // 替换选择的节点
        // replaceNodeWithKind(selectTree.node.getSourceFile(), selectNode, index);
        replaceNode(selectNode, allASTs, index);
        // 打印突变之后的代码
        // console.log("\nAfter mutate: \"" + selectTree.node.getText() + "\"");
        console.log("------------");
        // 将突变之后的代码写入文件中
        // fs.writeFileSync("D:/PyCharm 2021.2.1/code/result/mutate_file_" + i + ".ts", selectFile.getText())
    }
}
//# sourceMappingURL=util.js.map