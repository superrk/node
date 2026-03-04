---
outline: deep
title: 代码整洁
order: 1
---

## 一：代码整洁 :tada:

>  让营地比你来时更干净

光明不灭，代码永存 

## 二：命名
<!-- more -->

> 合适的命名是头等大事，正如给新生儿起个好名字那样重要。不合适的命名通常是词不达意、误导观众、过度缩写等，由于英文并非我们的母语，找个合适的单词命名似乎真的很难。我建议是先把业务弄清楚，组织会议定下常用业务领域的单词，禁止组员各自发明，比如定值这个次，既有fixedValue，又有ConstVal, 还有Dz这样的简写，虽然都能表达定值的意思，但不统一就会让人觉得是不同的东西了。


### 1. 名副其实
请看下面这段代码，有几个人能读懂是什么含义。
``` java
int i,j,k;
int dmzjzd;
int d,dt;
```
改成下面这样是不是会好些

``` java
int firstIndex,secondIndex,thirdIndex;
int cleanCode;
int date,dateTime;
```
### 2. 避免误导
举个栗子，listdiff(list1,list2) 这个方法给你的第一印象是做什么的，如果不看注释，可能很多情况下会被理解为计算两个list的差值，然而事实上他是计算list1有但list2没有的，可能更合理的写法是: listfilter(sourceList,exceptList)
``` java
 public DoctorInfosResVO getDoctorInfosBySpaceId(spaceId)
 public DoctorInfoVO getDoctorInfoBySpaceId(spaceId)
```
### 3. 有意义的区分
``` java
private void changePassword(String password1 ,String password2)
private void changePassword(String oldPassowrd,String newPassword)
```
### 4.可读
主要针对的就是各种缩写和自造词，摒弃这种做法,除非你确认你的团队都把这个缩写固定为某种含义，
### 5.可搜索
硬编码通常是不好搜索的，因为通常你不清楚它对应的是什么含义，浪费记忆空间，且查找原始定义是困难的
### 6.类名和方法名
类名应为名词，方法名应为动词

可以想象一个类叫setProperty，一个方法叫property所带来的困惑了
### 7.每个概念应对应一个词
就像插入数据有人喜欢用insert，有人喜欢用save，但一个团队还是尽量保持一种写法。
### 8.添加有意义的语境
我们经常会用到id这个字段，如果不给其以前缀，则很难清楚其究竟是那个id，因此，我们需要给其具体的语境，通常是通过添加前缀或后缀的方式，但更好的方式是将其放到一个更大的结构体（类）中，给其已明确的含义，但是也别太详细了，这时这些命名就会显得啰嗦

## 三：函数
### 1.越短小越好
> if/else/while语句的代码块应该只有一行，该行应该是一个函数调用语句。
函数的缩进层级不应该多于一层或两层。

当然我并不觉得一定要完全做到这样，如果块内调用的逻辑一眼就能看出是干什么的，也没必要就得写个函数，但是尽量缩小函数层级是应该要追求的目标。
### 2.只做一件事
> - 如果函数只是做了该函数名下同一抽象层上的步骤，则函数只做了一件事。
> - 要判断函数是否不止做了一件事，就是要看是否能再拆出一个函数。

### 3.每个函数一个抽象层级
有助于阅读和理解
``` java
//  获取个人信息
private UserDTO getUserDTO(Integer userId)
{
    //获取基本信息
    … 此处写了10行

    //获取最近的一次订单信息
    … 此处写了30行

   // 获取钱包余额、可用优惠券张数等
    … 此处写了30行

   return userDTO;
}

private UserDTO getUserDTO(Integer userId)
{
    //获取基本信息
    UserDTO userDTO= getUserBasicInfo(userId);

    //获取最近的一次订单信息
    userDTO.setUserLastOrder(getUserLastOrder(userId));

    // 获取钱包、可用优惠券张数等
    userDTO.setUserAccount(getUserAccount(userId));
    return userDTO;
}
```
### 4.switch
把switch埋在较低的抽象层级，一般可以放在抽象工厂底下，用于创建多态对象。典型例子如加号的状态机
### 5.使用描述性的名称
这个也还是命名，用合适的语言描述出函数的功能
> 函数越短小、功能越集中，就越便于取个好名字。
别害怕长名称，长而具有描述性的名称，要比短而令人费解的名称好，要比描述性的长注释好。
别害怕花时间取名字。

### 6.函数参数
>- 参数越少越好，0参数最好，尽量避免用三个以上参数
>- 参数越多，编写单元测试就越困难，因为要写太多的分支了
>- 别用标识参数，向函数传入bool值是不好的，这意味着函数不止做一件事。可以将此函数拆成两个。
>- 将参数的顺序编码进函数名，减轻记忆参数顺序的负担，例如,assertExpectedEqualsActual(expected, actual)

如果方法参数将超过3个，建议放在类中包装起来，否则再增加参数时，由于语义的强耦合会导致调用方语法错误。比如多条件的分页查询接口，常常会有很多查询参数，而且有可能增加，封装起来是最好的。
### 7.无副作用，分离操作与获取
典型的就如在get方法里执行了其它操作，比如重置缓存，会话等
### 8.善用异常
``` java
if (deletePate(page) == E_OK) {
    if (xxx() == E_OK) {
        if (yyy() == E_OK) {
            log();
        } else {
            log();
        }
    } else {
        log();
    }
} else {
    log();
}

try {
    aaa();
    xxx();
    yyy();
} catch (Exception e) {
    log(e.getMessage());
}
```
### 8.抽离try-catch
最好把try和catch代码块的主体抽离出来，单独形成函数。然后我照着这条写了一个通用的方法。
``` java
    public static <T> void simpleTryCatch(Supplier<T> tryFunc, Consumer<Exception> catchFunc) {
        try {
            tryFunc.get();
        } catch (Exception e) {
            catchFunc.accept(e);
        }
    }
```

### 9.代码不要重复
标准就是你修改每一个功能时，只会修改一处，如果多余1处，ok，那么这就是重复了
### 10.持续改进
很少有人能把初稿写的完善，写代码也是如此，我们刚开始写的时候尽可以先为完成功能，然后逐步打磨，拆分函数，改善名称，消除重复。
>如何才是一个好的函数，单元测试好写的    --by Me
### 11.最短路径,不要啰嗦
短的路径通常来讲段落感更强,逻辑上更容易理解
``` java
    public RpcResponse<Boolean> methodName(Long param) {
        if (param == null || param.equals(0L)) {
            return RpcResponse.success(false);
        }
        return RpcResponse.success(true);
    }
```
## 四：注释

> Talk is cheap. Show me the code

### 1.好注释
好的注释应该简短,准确,最好的注释是没有注释。在我看来，必要的解释，警告，todo算是好的注释,
以下推荐一个代码收起的命令（idea,vs都有）
``` java
        //region 功能描述
        ···
        //endregion
```
### 2.糟糕的注释
1. 只有你自己看的懂的
2. 废话（getUserName这个方法需要写注释吗）
3. 有误导性的注释(这种是最危险的,listdiff 为例，如果写了不准确的注释，还不如不写)
4. 规矩注释(比如每个方法都要有标准javadoc的注释)
5. 注释代码（除非你确认这个注释只是暂时性的，要不还是删掉吧，git和svn的记性绝对比你好）

## 五: 格式
>代码是给机器运行的，但是也是给人看的。

没有格式的典范比如代码混肴器,min.css,min.js，但我想没人会喜欢阅读这类文件吧。那么有个良好的格式显得尤其重要。所以，不要用记事本敲代码(手动狗头)，善用格式化代码

### 1.垂直格式
1. 方法间加空行做出区分
2. 有调用关系的方法应尽量靠近，且调用者处于被调用者的上方
3. 变量声明尽量靠近调用点，本地变量应该在函数顶部出现
4. 自顶向下，善用structure

### 2.横向格式
1. 一行代码不要超过1屏，通常为多个条件与或，下面是合适的例子
``` java
        return createOrderParamVO != null
                && createOrderParamVO.getUserId() != null
                && createOrderParamVO.getPatientId() != null
                && createOrderParamVO.getSpaceId() != null;
```
2. 团队规则,在一个团队中，最好有一个统一的代码规则，如果懒得制定，那么用统一的ide的默认规则也是一个选择
>idea默认的格式化会自动加上空格，所以，提交代码之前，执行一次格式化(Ctrl+Alt+L)吧，避免合并代码时各种格式不同的问题，找到一个插件叫Save Action,能够在保存的时候自动格式化,可以尝试一下