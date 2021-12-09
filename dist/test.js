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
const ts_morph_1 = require("ts-morph");
const ts = __importStar(require("typescript"));
const typed_node_1 = require("./typed_node");
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
            findIdentifier(node, typed_node_1.Type.Number);
        }
        case "FirstLiteralToken": {
            node.firstLiteralToken = firstLiteralTokenFactory.getCommaToken(Number(node.node.getText()));
        }
    }
}
// 先序遍历更新可用变量节点
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
function walkAST(node) {
    // console.log(node.node.getKindName()); 
    if (node.node.getKindName() === "NumericLiteral") {
        potentialNodes.push(node);
    }
    for (let child of node.children) {
        walkAST(child);
    }
}
function randomNum(min, max) {
    let range = max - min;
    let rand = Math.random();
    return (min + Math.round(rand * range));
}
var sourceCode = `
let cc:number[] = [7, 8, 9];
let ccc: number = cc[0];
let cccc: number = 1;
let ccccc: string = "1";
`.trim();
console.log("before mutate: " + sourceCode);
const project = new ts_morph_1.Project();
project.createSourceFile("/test.ts", sourceCode);
let firstLiteralTokenFactory = new typed_node_1.FirstLiteralTokenFactory();
// const project = new Project();
// // 添加文件
// project.addSourceFilesAtPaths("D:/PyCharm 2021.2.1/code/test/*.ts")
let sourceFile = project.getSourceFile("/test.ts");
let root;
// 得到所有节点
let potentialNodes = [];
if (sourceFile != undefined) {
    root = creatTypedNode(sourceFile);
    setParentTypeNode(root);
    inferTypedNode(root);
    updateVariables(root);
    // walkTypedNode(root);
    walkAST(root);
    if (potentialNodes.length > 0) {
        let targetNode = potentialNodes[randomNum(0, potentialNodes.length - 1)];
        let replaceText = "";
        let idx = randomNum(0, targetNode.variables.size);
        let count = 0;
        for (let entry of targetNode.variables) {
            if (count === idx) {
                replaceText = entry.variableName;
                break;
            }
        }
        sourceFile.replaceText([targetNode.node.getStart(), targetNode.node.getEnd()], replaceText);
    }
    console.log("after mutate: " + root.node.getText());
}
//# sourceMappingURL=test.js.map