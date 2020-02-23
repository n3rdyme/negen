
> Automatically generate project scaffolding for any project using `blueprints`.

## Install

Install globally  to use the CLI.

```
npm install -g  negen
```

Install locally  to use programtically.

```
npm install --save  negen
```

## Configuration

Negen requires you to set the path of your `blueprints` and the path where you want to generate you new modules.  
In your `package.json` add the object `negen` and set both paths. You can override this values using the cli options `-b` for blueprints_root and `-m` for modules_root.

```js
//file: package.json
{
	"negen": {
		"blueprints_root": "./path/to/your/blueprints/",
		"modules_root": "./src/modules"
	}
}

```

## Examples

ganerate a new module:
```bash
negen generate blueprint_name new_module_name
```

list all Blueprints:
```bash
negen list
```


## Creating Your Blueprints

A blueprint is any direct `">"` subdirectory of your `blueprints_root` directory.

	path/to/your/blueprints_root
	  +──  blueprint1
	  |   └──  __name__
	  |       +── __camelName__Controller.js
	  |       └── __snake_name___template.json
	  +──  blueprint1.ts
	  └──  blueprint2
	      └──  __name__
	          +── Test__PascalName__.js



**The `__name__` string:**  
Any `__name__` string in a directory or file name will be replaced by the `new_module_name` when the build process is executed.  
Any `__name__` string withing the content of the Blueprint files also will be replaced by the `new_module_name`.
Likewise, any `__PascalName__` string is replaced with the PascalCase, `__camelName__` for camelCase, `__snake_name__` for snake_case, or `__kebab-name__` for kebab-case.
Additionally, you can have nested items using the `path` portion of a generated name. for example `SomePath/NameToGenerate` would produce `SomePath` as the replacement value for `__PascalPath__` (or any other supported case).

## License

[MIT](http://en.wikipedia.org/wiki/MIT_License) 

Authors:

Origianl `anygen` from [@Ma Jerez]
https://github.com/M-jerez/any-generator

n3rdy.me
https://github.com/n3rdyme
