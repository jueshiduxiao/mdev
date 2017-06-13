# 交互开发-基础API

### 获取module实例
`mdev.dom.build`

通过build获取模块，进行模块操作，回调执行时间由框架统一控制，针对每个模块实例有效。
```javascript
window.mdev.dom.build(function ($mod) {
    // $mod...
});
```
`mdev.dom.getInstance`

通过getInstance获取模块，进行模块操作，回调立即执行，针对当前存在的每个模块实例有效。
```javascript
window.mdev.dom.getInstance(function ($mod) {
    // $mod...
});
```

### 基于module进行dom选择
```javascript
var selector = '[node-type~="btn"]';
var $btn = $mod.find(selector);
```

备注：
* 避免在代码中使用document进行dom选择。
* 避免在代码中使用jQuery或者$进行dom选择。
* 选择器只能使用 node-type 属性选择器 '[node-type~="btn"]'

### Dom操作
dom选择获得的为jQuery对象，支持所有jQuery方法。
```javascript
var selector = '[node-type~="btn"]';
var $btn = $mod.find(selector);
$btn.addClass('active');
```
dom对象转jQuery对象
```javascript
var dom = ...;
var $dom = window.mdev.wrapDom(dom);
```

`mdev.dom.prepend`

向body中插入节点
```javascript
window.mdev.dom.prepend(...);
```
`mdev.dom.append`

向body中追加节点
```javascript
window.mdev.dom.append(...);
```
### 弹框
`mdev.dom.dialog`

弹出弹框
```javascript
window.mdev.dom.dialog(...);
```
关闭弹框
```javascript
window.mdev.dom.dialog.close();
```

### VelocityJs
velocity模板转string
```javascript
var tmpl = '...';
var data = '...';
var html = window.mdev.tmpl(tmpl, data);
```

### Ajax
发送ajax请求，或jsonp请求，等同于$.ajax。
```javascript
window.mdev.ajax(...);
```
