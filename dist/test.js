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
            child.variables.push(new typed_node_1.VariableType(child.node.getText(), type));
            console.log(child.node.getText(), typed_node_1.Type[type]);
        }
    }
    if (flag) {
        findIdentifier(node.parent, type);
    }
}
// 遍历树打印具体信息
function walkTypedNode(node, depth = 0) {
    console.log(new Array(depth + 1).join('----'), ts.SyntaxKind[node.node.getKind()], node.node.getStart(), node.node.getEnd(), node.node.getText());
    depth++;
    for (let child of node.children) {
        walkTypedNode(child, depth);
    }
}
var sourceCode = `
let cc:number[] = [7, 8, 9];
let ccc: number = cc[0];
let cccc: number = 1;
`.trim();
const project = new ts_morph_1.Project();
project.createSourceFile("/test.ts", sourceCode);
let sourceFile = project.getSourceFile("/test.ts");
let root;
if (sourceFile != undefined) {
    root = creatTypedNode(sourceFile);
    setParentTypeNode(root);
    // inferTypedNode(root);
    walkTypedNode(root);
}
//# sourceMappingURL=test.js.map