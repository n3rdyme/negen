"use strict";
var fsx = require("fs-extra");
var path = require("path");
function toSnakeCase(name) {
    name = name.replace(/^[A-Z]+/, function (txt) { return txt[1].toLowerCase(); });
    name = name.replace(/[A-Z]+/g, function (txt) { return '_' + txt[1].toLowerCase(); });
    return name;
}
exports.toSnakeCase = toSnakeCase;
function toPascalCase(name) {
    name = name.replace(/_\w/g, function (txt) { return txt[1].toUpperCase(); });
    name = name[0].toUpperCase() + name.substr(1);
    return name;
}
exports.toPascalCase = toPascalCase;
function toCamelCase(name) {
    name = name.replace(/_\w/g, function (txt) { return txt[1].toUpperCase(); });
    name = name[0].toLowerCase() + name.substr(1);
    return name;
}
exports.toCamelCase = toCamelCase;
function replaceAll(target, search, replacement) {
    var result = target;
    result = result.replace(new RegExp(search, 'g'), replacement);
    if (search === '__name__') {
        result = result.replace(/__PascalName__/gi, function (val) { return toPascalCase(replacement); });
        result = result.replace(/__camelName__/gi, function (val) { return toCamelCase(replacement); });
        result = result.replace(/__snake_name__/gi, function (val) { return toSnakeCase(replacement); });
    }
    return result;
}
exports.replaceAll = replaceAll;
function isComplaintName(moduleName, nameConstrain) {
    return !(moduleName.search(nameConstrain) == -1);
}
exports.isComplaintName = isComplaintName;
function getSubDirectoryNames(srcPath) {
    return fsx.readdirSync(srcPath).filter(function (file) {
        return fsx.statSync(path.join(srcPath, file)).isDirectory();
    });
}
exports.getSubDirectoryNames = getSubDirectoryNames;
function dirAsListSync($root, result) {
    var p = path.normalize($root);
    var items = fsx.readdirSync(p);
    items.forEach(function (item) {
        var fileName = path.join(p, item);
        var stats = fsx.statSync(fileName);
        if (stats.isDirectory()) {
            result.push(fileName);
            dirAsListSync(fileName, result);
        }
        else if (stats.isFile()) {
            result.push(fileName);
        }
    });
}
function listDir($root) {
    var $fileList = [];
    dirAsListSync($root, $fileList);
    return $fileList;
}
exports.listDir = listDir;
//# sourceMappingURL=utils.js.map