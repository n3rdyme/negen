"use strict";
var child_process = require('child_process');
var fsx = require('fs-extra');
var path = require("path");
var Blueprint_1 = require("./Blueprint");
var utils_1 = require("./utils");
var util = require('./utils');
var Builder = (function () {
    function Builder() {
        this.genStore = {};
    }
    Builder.getNameConstrain = function () {
        return Builder.nameConstrain;
    };
    Builder.prototype.addBlueprints = function (rootPath) {
        var _this = this;
        if (!fsx.existsSync(rootPath))
            throw new Error(rootPath + " is not a Directory.");
        var nRootPath = path.normalize(rootPath);
        var blueprints = Builder.findBlueprints(nRootPath);
        blueprints.forEach(function (blueprint) {
            var name = blueprint.name;
            if (typeof _this.genStore[name] != 'undefined')
                throw new Error("Duplicated blueprint " + name + ". The blueprint already exists.");
            else
                _this.genStore[name] = blueprint;
        });
    };
    Builder.prototype.getBlueprintNames = function () {
        return Object.keys(this.genStore);
    };
    Builder.prototype.build = function (blueprintName, moduleFullName, destPath) {
        var moduleParts = moduleFullName
            .split(/[\/\\]/g)
            .filter(function (name) { return name && name !== '.'; });
        var moduleName = moduleParts[moduleParts.length - 1];
        var modulePath = path.join.apply(path, moduleParts.slice(0, moduleParts.length - 1));
        moduleParts.filter(function (name) { return !utils_1.isComplaintName(name, Builder.nameConstrain); }).forEach(function (name) {
            throw new Error("Invalid argument '" + name + "'. Only characters, numbers and underscore allowed.");
        });
        fsx.ensureDir(destPath, function (err) {
            if (err) {
                throw new Error("Error creating destination directory: " + destPath + " ");
            }
        });
        var blueprint = this.genStore[blueprintName];
        if (blueprint === undefined) {
            throw new Error("Blueprint " + blueprintName + " not found.");
        }
        var src_root = path.resolve(blueprint.path);
        var src_files = utils_1.listDir(src_root);
        var destDirs = [];
        var destFiles = [];
        var destFilesContent = [];
        src_files.forEach(function (filePath) {
            var stats = fsx.statSync(filePath);
            var dest = path.resolve(destPath);
            if (stats.isDirectory()) {
                var dest_dir = Builder.replacePath(filePath, src_root, dest, moduleName, modulePath);
                destDirs.push(dest_dir);
            }
            else if (stats.isFile()) {
                var dest_file = Builder.replacePath(filePath, src_root, dest, moduleName, modulePath);
                var content = fsx.readFileSync(filePath, "utf-8");
                var newContent = utils_1.replaceAll(content, Builder.replaceName, moduleName);
                dest_file = utils_1.replaceAll(dest_file, Builder.replaceName, moduleName);
                destFiles.push(dest_file);
                destFilesContent.push((newContent));
            }
        });
        for (var i = 0; i < destDirs.length; i++) {
            var dest_dir = destDirs[i];
            fsx.ensureDirSync(dest_dir);
        }
        var generatedList = [];
        for (var i = 0; i < destFiles.length; i++) {
            var dest_file = destFiles[i];
            var newContent = destFilesContent[i];
            Builder.doesNotExist(dest_file);
            fsx.writeFileSync(dest_file, newContent, "utf-8");
            generatedList.push(path.resolve(dest_file));
        }
        if (blueprint.script && fsx.existsSync(blueprint.script)) {
            var isTypescript = /\.ts$/.test(blueprint.script);
            var execFilePath = !isTypescript ? 'node' :
                fsx.existsSync(path.join(process.cwd(), 'node_modules/.bin/ts-node'))
                    ? path.join(process.cwd(), 'node_modules/.bin/ts-node')
                    : 'ts-node';
            var jsonArgs = {
                blueprint: blueprint.name,
                source: path.resolve(blueprint.path),
                destination: path.resolve(destPath),
                name: moduleName,
                path: modulePath,
                pascalName: util.toPascalCase(moduleName),
                camelName: util.toCamelCase(moduleName),
                snakeName: util.toSnakeCase(moduleName),
                pascalPath: util.toPascalCase(modulePath),
                camelPath: util.toCamelCase(modulePath),
                snakePath: util.toSnakeCase(modulePath),
                generated: generatedList
            };
            child_process.execFileSync(execFilePath, [path.resolve(blueprint.script), moduleName, JSON.stringify(jsonArgs)], { stdio: 'inherit' });
        }
        return generatedList;
    };
    Builder.findBlueprints = function (rootPath) {
        var found = [];
        var names = utils_1.getSubDirectoryNames(rootPath);
        if (names.length == 0)
            throw Error("No Blueprint found in " + rootPath);
        names.forEach(function (blueprintName) {
            var name = blueprintName;
            var blueprintPath = path.join(rootPath, blueprintName);
            var scriptFile = fsx.existsSync(blueprintPath + '.js') ? blueprintPath + '.js' :
                fsx.existsSync(blueprintPath + '.ts') ? blueprintPath + '.ts' : null;
            var blueprint = new Blueprint_1.Blueprint(name, blueprintPath, scriptFile);
            found.push(blueprint);
        });
        return found;
    };
    Builder.replacePath = function (path, src_root, dest_root, moduleName, modulePath) {
        var destpath = path.replace(src_root, dest_root);
        if (!modulePath) {
            modulePath = '.';
        }
        destpath = utils_1.replaceAll(destpath, Builder.replaceName, moduleName);
        destpath = destpath.replace(/__path__/gi, function (val) { return modulePath; });
        destpath = destpath.replace(/__PascalPath__/gi, function (val) { return util.toPascalCase(modulePath); });
        destpath = destpath.replace(/__camelPath__/gi, function (val) { return util.toCamelCase(modulePath); });
        destpath = destpath.replace(/__snake_path__/gi, function (val) { return util.toSnakeCase(modulePath); });
        destpath = destpath.replace(/\.\//g, '');
        return destpath;
    };
    Builder.doesNotExist = function (dest_file) {
        if (fsx.existsSync(dest_file)) {
            throw new Error("File : " + dest_file + " already exists.");
        }
    };
    Builder.nameConstrain = /^[a-z0-9_]+$/i;
    Builder.replaceName = "__name__";
    return Builder;
}());
exports.Builder = Builder;
//# sourceMappingURL=Builder.js.map