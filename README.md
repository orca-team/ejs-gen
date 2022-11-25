# @orca-fe/ejs-gen

这是一个基于 [`ejs`](https://github.com/mde/ejs) 的文件生成工具。

你可以使用一个目录，用于存放 `ejs` 模板，该工具可以扫描模板目录，并将每一个文件进行 `ejs` 模板渲染，再输出到指定目录。

该工具主要用于基于项目模板创建项目代码。

## 使用方式

### CLI

```bash
ejs-gen [source] [target] --data <data> --ejs-only [ejsOnly]
```

### NodeJS

```ts
import gen from '@orca-fe/ejs-gen';

gen('source', 'target', {
  data: {},
  ejsOnly: false,
});
```

## API

| 属性    | 说明                                                                                                                             | 类型                 | 默认值     |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------- |
| source  | 模板目录                                                                                                                         | `string`             | `required` |
| target  | 目标目录，在该目录下生成文件                                                                                                     | `string`             | `required` |
| data    | 用于 `ejs` 渲染的数据                                                                                                            | `JSON5`              | `{}`       |
| ejsOnly | 是否只转换 `ejs` 文件，开启后，只对后缀为 `.ejs` 的文件进行渲染，其它文件仅作复制。你也可以传入字符串，指定 `ejs` 文件的特殊后缀 | `boolean` / `string` | `false`    |

## 内置方法

内置了 [`change-case`](https://github.com/blakeembrey/change-case) 的用于处理字符串的方法。包含  `camelCase`, `pascalCase`, `paramCase`, `noCase`, `dotCase`, `capitalCase`, `pathCase`, `snakeCase`, `headerCase`, `sentenceCase`, `constantCase`. 详情请查看 [`change-case`](https://github.com/blakeembrey/change-case) 的文档。

### 示例

EJS Template:

```ejs
// data: { name: 'checkBox' }

const className = '<%= paramCase(name) %>';

export default class <%= pascalCase(name) %> {
  // ...
}
```

Output:

```javascript
const className = 'check-box';

export default class CheckBox {
  // ...
}
```