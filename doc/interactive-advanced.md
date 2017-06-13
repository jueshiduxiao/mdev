# 交互开发-跨模块

跨模块开发分为数据跨模块及交互跨模块两种类型，优先使用数据跨模块方案。

### 数据跨模块
说明：两个模块共同依赖一部分数据。

实现：创建数据模型model，模块A与模块B分别调用或监听model对应方法，及获取对应数据。

示例场景：点击模块A中按钮实现添加item操作，同时更新模块B中的list列表。

代码模块A：
```javascript
$mod.on('button', 'click', function () {
    var item = ...;
    model.add(item);
});
```
代码模块B：
```javascript
model.on('add', function (data) {
    var item = data.item;
    var itemHtml = ...;
    $mod.find('list').append(itemHtml);
});
```

### 交互跨模块
说明：两个模块交互需要互动。

实现：基于消息机制的单向通信。

示例场景：点击模块A中的按钮，模块B中的按钮背景变成黑色。

代码模块A：
```javascript
$mod.on('button', 'click', function () {
    mdev.message.trigger('B', 'change-button', {});
});
```
代码模块B：
```javascript
mdev.message.listen(function (command, data) {
    if (command === 'change-button') {
        mdev.dom.getInstance(function ($mod) {
            $mod.find('botton').css('background', '#000000');
        });
    }
});
```
