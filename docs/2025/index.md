---
outline: deep
title: Project Reactor 整理
order: 1
next: false
---

# Project Reactor

## 简介

Project Reactor 是 JVM 上完全非阻塞的反应式编程基础库。它实现了 [Reactive Streams](https://www.reactive-streams.org/) 规范，并提供了丰富的操作符来处理异步数据流。Reactor 主要用于构建响应式应用，能够高效处理高并发、低延迟的场景。

**核心特性：**
- 非阻塞：基于事件驱动，避免线程阻塞
- 背压：自动调节生产者和消费者之间的数据流速
- 操作符丰富：提供 500+ 个操作符用于数据转换和组合
- 调度灵活：支持多种线程调度策略
- 错误处理：强大的错误处理和恢复机制

[官方网站](https://projectreactor.io/) | [GitHub](https://github.com/reactor/reactor-core) | [文档](https://projectreactor.io/docs/core/release/reference/)

## 核心组件

### Mono

[Mono](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html) 表示 0 或 1 个元素的异步序列。它适合处理单个结果的场景，如数据库查询或网络请求。

#### 创建 Mono

- `Mono.just(T data)`: 从单个值创建 Mono
- `Mono.empty()`: 创建空的 Mono
- `Mono.error(Throwable error)`: 创建包含错误的 Mono
- `Mono.fromCallable(Callable<T> callable)`: 从 Callable 创建 Mono
- `Mono.fromFuture(CompletableFuture<T> future)`: 从 Future 创建 Mono
- `Mono.defer(Supplier<Mono<T>> supplier)`: 延迟创建 Mono

**示例：**

```java
Mono<String> mono = Mono.just("Hello, Reactor!");
mono.subscribe(System.out::println);

Mono<String> emptyMono = Mono.empty();
Mono<String> errorMono = Mono.error(new RuntimeException("Error"));
Mono<String> callableMono = Mono.fromCallable(() -> {
    Thread.sleep(1000);
    return "Delayed result";
});
```

#### Mono 操作符

- `map(Function<T, R> mapper)`: 转换元素
- `flatMap(Function<T, Mono<R>> mapper)`: 异步转换，返回新的 Mono
- `filter(Predicate<T> predicate)`: 过滤元素
- `doOnNext(Consumer<T> onNext)`: 在元素发出时执行其它动作
- `then(Function<T, Mono<Void>> transformer)`: 执行完成后继续
- `subscribeOn(Scheduler scheduler)`: 指定订阅线程
- `publishOn(Scheduler scheduler)`: 指定发布线程

**示例：**

```java
Mono<String> result = Mono.just("hello")
    .map(String::toUpperCase)
    .doOnNext(s -> System.out.println("Processing: " + s))
    .flatMap(s -> Mono.just(s + " World"))
    .subscribeOn(Schedulers.parallel());
```

### Flux

[Flux](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html) 表示 0 到 N 个元素的异步序列。它适合处理多个结果的场景，如流式数据处理。

#### 创建 Flux

- `Flux.just(T... data)`: 从多个值创建 Flux
- `Flux.fromIterable(Iterable<T> iterable)`: 从 Iterable 创建 Flux
- `Flux.range(int start, int count)`: 创建数字序列
- `Flux.interval(Duration period)`: 创建定时序列
- `Flux.create(Consumer<FluxSink<T>> emitter)`: 编程式创建 Flux
- `Flux.generate(Consumer<SynchronousSink<T>> generator)`: 生成式创建 Flux

**示例：**

```java
Flux<String> flux = Flux.just("Apple", "Banana", "Cherry");
flux.subscribe(System.out::println);

Flux<Integer> rangeFlux = Flux.range(1, 5);
Flux<Long> intervalFlux = Flux.interval(Duration.ofSeconds(1));
Flux<String> iterableFlux = Flux.fromIterable(Arrays.asList("A", "B", "C"));
```

#### Flux 操作符

- `map(Function<T, R> mapper)`: 转换每个元素
- `flatMap(Function<T, Publisher<R>> mapper)`: 异步转换，返回新的 Publisher
- `filter(Predicate<T> predicate)`: 过滤元素
- `take(long n)`: 取前 n 个元素
- `skip(long n)`: 跳过前 n 个元素
- `collectList()`: 收集为 List
- `reduce(BinaryOperator<T> aggregator)`: 聚合元素
- `window(int size)`: 分组为窗口
- `groupBy(Function<T, K> keyMapper)`: 按键分组
- `subscribeOn(Scheduler scheduler)`: 指定订阅线程
- `publishOn(Scheduler scheduler)`: 指定发布线程

**示例：**

```java
Flux<Integer> numbers = Flux.range(1, 10)
    .filter(n -> n % 2 == 0)
    .map(n -> n * 2)
    .take(3);

Mono<List<Integer>> listMono = Flux.range(1, 5)
    .collectList();

Mono<Integer> sumMono = Flux.range(1, 10)
    .reduce(0, Integer::sum);
```

## 操作符

Reactor 提供了丰富的操作符来转换和组合数据流。

### 映射操作符

- [`map()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#map-java.util.function.Function-): 对每个元素应用转换函数
- [`flatMap()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#flatMap-java.util.function.Function-): 对每个元素应用异步转换函数，返回新的 Publisher
- [`flatMapMany()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#flatMapMany-java.util.function.Function-): Mono 转换为多个元素
- [`concatMap()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#concatMap-java.util.function.Function-): 保持顺序的异步转换

**示例：**

```java
Mono<String> upperMono = Mono.just("hello")
    .map(String::toUpperCase);

Flux<Integer> lengths = Flux.just("apple", "banana")
    .map(String::length);

// flatMapMany 示例
Mono<List<String>> listMono = Mono.just(Arrays.asList("a", "b", "c"));
Flux<String> flatMapped = listMono.flatMapMany(Flux::fromIterable);
```

### 过滤操作符

- [`filter()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#filter-java.util.function.Predicate-): 根据谓词过滤元素
- [`take()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#take-long-): 取前 N 个元素
- [`takeWhile()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#takeWhile-java.util.function.Predicate-): 取满足条件的前缀元素
- [`skip()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#skip-long-): 跳过前 N 个元素
- [`distinct()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#distinct--): 去重
- [`elementAt()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#elementAt-int-): 获取指定位置元素

**示例：**

```java
Flux<Integer> evenNumbers = Flux.range(1, 10)
    .filter(n -> n % 2 == 0);

Flux<Integer> firstThree = Flux.range(1, 10)
    .take(3);

Flux<Integer> lessThanFive = Flux.range(1, 10)
    .takeWhile(n -> n < 5);
```

### 组合操作符

- [`zip()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#zip-reactor.core.publisher.Flux-reactor.core.publisher.Flux-): 将多个 Publisher 的元素配对
- [`merge()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#merge-reactor.core.publisher.Publisher-): 合并多个 Publisher（无序）
- [`concat()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#concat-reactor.core.publisher.Publisher-): 连接多个 Publisher（有序）
- [`combineLatest()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#combineLatest-reactor.core.publisher.Publisher-reactor.core.publisher.Publisher-): 组合最新值
- [`withLatestFrom()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#withLatestFrom-reactor.core.publisher.Publisher-): 与另一个 Publisher 的最新值组合

**示例：**

```java
Flux<String> combined = Flux.zip(
    Flux.just("A", "B"),
    Flux.just("1", "2"),
    (a, b) -> a + b
);

Flux<Integer> merged = Flux.merge(
    Flux.just(1, 2),
    Flux.just(3, 4)
);

Flux<Integer> concatenated = Flux.concat(
    Flux.just(1, 2),
    Flux.just(3, 4)
);
```

### 聚合操作符

- [`collectList()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#collectList--): 收集为 List
- [`collectMap()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#collectMap-java.util.function.Function-): 收集为 Map
- [`reduce()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#reduce-java.lang.Object-java.util.function.BiFunction-): 聚合为单个值
- [`count()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#count--): 计数
- [`all()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#all-java.util.function.Predicate-): 检查所有元素是否满足条件
- [`any()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#any-java.util.function.Predicate-): 检查是否有元素满足条件

**示例：**

```java
Mono<List<Integer>> listMono = Flux.range(1, 5).collectList();
Mono<Integer> sumMono = Flux.range(1, 10).reduce(0, Integer::sum);
Mono<Long> countMono = Flux.range(1, 100).count();
Mono<Boolean> allEvenMono = Flux.range(1, 10).all(n -> n % 2 == 0);
```

### 分组和窗口操作符

- [`window()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#window-int-): 按数量分组
- [`buffer()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#buffer-int-): 收集为列表
- [`groupBy()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#groupBy-java.util.function.Function-): 按键分组

**示例：**

```java
Flux<Flux<Integer>> windows = Flux.range(1, 10).window(3);
Flux<List<Integer>> buffers = Flux.range(1, 10).buffer(3);
Flux<GroupedFlux<String, Integer>> grouped = Flux.range(1, 10)
    .groupBy(n -> n % 2 == 0 ? "even" : "odd");
```

## 测试和调试

Reactor 提供了强大的测试和调试工具：

### 测试

使用 `reactor-test` 模块进行单元测试：

```java
@Test
public void testMono() {
    Mono<String> mono = Mono.just("test");
    StepVerifier.create(mono)
        .expectNext("test")
        .verifyComplete();
}

@Test
public void testFluxWithTime() {
    StepVerifier.withVirtualTime(() -> Flux.interval(Duration.ofHours(1)).take(2))
        .thenAwait(Duration.ofHours(2))
        .expectNext(0L, 1L)
        .verifyComplete();
}
```

### 调试

启用调试模式查看操作链：

```java
// 全局启用调试
Hooks.onOperatorDebug();

// 或为特定序列启用
Flux<Integer> flux = Flux.range(1, 10)
    .checkpoint("range")
    .map(i -> i * 2)
    .checkpoint("multiply")
    .filter(i -> i > 5);

// 使用 doOnNext 等进行调试
flux.doOnNext(i -> System.out.println("Element: " + i))
    .doOnError(error -> System.err.println("Error: " + error))
    .doOnComplete(() -> System.out.println("Complete"))
    .subscribe();
```

## 性能优化

### 背压 (Backpressure)

Reactor 自动处理背压，支持以下策略：

- `BUFFER`: 缓冲元素（默认）
- `DROP`: 丢弃新元素
- `LATEST`: 只保留最新元素
- `ERROR`: 抛出异常

```java
Flux<Integer> flux = Flux.range(1, 1000)
    .onBackpressureDrop(i -> System.out.println("Dropped: " + i));
```

### 最佳实践

1. **避免阻塞操作**：不要在反应式链中使用阻塞 API
2. **合理使用调度器**：根据任务类型选择合适的调度器
3. **错误处理**：使用适当的错误处理策略
4. **内存管理**：注意大流量的内存使用
5. **测试覆盖**：编写全面的单元测试

## 错误处理

Reactor 提供了强大的错误处理机制：

- [`onErrorReturn()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#onErrorReturn-java.lang.Object-): 返回默认值
- [`onErrorResume()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#onErrorResume-java.util.function.Function-): 切换到备用 Publisher
- [`retry()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#retry--): 重试操作
- [`retryWhen()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#retryWhen-reactor.util.retry.Retry-): 基于条件的重试
- [`onErrorContinue()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#onErrorContinue-java.util.function.BiConsumer-): 继续处理错误，跳过有问题的元素
- [`doOnError()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#doOnError-java.util.function.Consumer-): 在发生错误时执行副作用
- [`timeout()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html#timeout-java.time.Duration-): 设置超时

**示例：**

```java
Mono<String> result = Mono.fromCallable(() -> {
        if (Math.random() > 0.5) {
            throw new RuntimeException("Random error");
        }
        return "Success";
    })
    .onErrorReturn("Default value")
    .retry(2);

// 超时和错误恢复
Mono<String> timeoutMono = Mono.delay(Duration.ofSeconds(5))
    .map(i -> "Delayed result")
    .timeout(Duration.ofSeconds(2))
    .onErrorResume(TimeoutException.class, e -> Mono.just("Timeout fallback"));

// 错误继续处理
Flux<Integer> continued = Flux.range(1, 10)
    .map(i -> {
        if (i == 5) throw new RuntimeException("Error at 5");
        return i * 2;
    })
    .onErrorContinue((error, value) -> System.out.println("Error: " + error + ", value: " + value));
```

## 调度器 (Schedulers)

Reactor 支持在不同线程上执行操作，实现异步和并发处理：

- [`Schedulers.immediate()`](https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html#immediate--): 当前线程（同步）
- [`Schedulers.parallel()`](https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html#parallel--): 并行线程池，适合 CPU 密集型任务
- [`Schedulers.elastic()`](https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html#elastic--): 弹性线程池，适合 I/O 密集型任务（已弃用，建议使用 `boundedElastic()`）
- [`Schedulers.single()`](https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html#single--): 单线程调度器
- [`Schedulers.boundedElastic()`](https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html#boundedElastic--): 有界弹性线程池

**关键操作符：**

- [`subscribeOn()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#subscribeOn-reactor.core.scheduler.Scheduler-): 指定订阅和请求发生的线程
- [`publishOn()`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html#publishOn-reactor.core.scheduler.Scheduler-): 指定数据发布（onNext）的线程

**示例：**

```java
Flux<Integer> flux = Flux.range(1, 10)
    .subscribeOn(Schedulers.boundedElastic())  // 订阅在弹性线程上
    .publishOn(Schedulers.parallel())          // 处理在并行线程上
    .map(this::expensiveOperation)
    .publishOn(Schedulers.single())            // 结果在单线程上处理
    .doOnNext(result -> System.out.println("Result: " + result));

// 异步 Mono 处理
Mono<String> asyncMono = Mono.fromCallable(() -> {
        Thread.sleep(1000);  // 模拟 I/O 操作
        return "Async result";
    })
    .subscribeOn(Schedulers.boundedElastic());
```

---

### 实际应用场景

#### 用户服务示例

```java
/**
 * 查询用户及其订单信息 - 组合多个异步操作
 */
public static Mono<UserWithOrders> getUserWithOrders(int userId) {
    Mono<User> userMono = findUserById(userId);
    Flux<Order> ordersFlux = findOrdersByUserId(userId);
    
    // 并行查询用户和订单，然后组合
    return Mono.zip(userMono, ordersFlux.collectList())
            .map(tuple -> new UserWithOrders(tuple.getT1(), tuple.getT2()));
}

/**
 * 并发查询多个用户
 */
public static Flux<User> findUsersConcurrently(List<Integer> userIds) {
    return Flux.fromIterable(userIds)
            .parallel()  // 转为并行流
            .runOn(Schedulers.parallel())
            .flatMap(UserServiceExample::findUserById)
            .sequential();  // 转回顺序流
}

/**
 * 查找高价值客户（订单总额超过指定金额）
 */
public static Flux<UserWithOrderSummary> findHighValueCustomers(double minTotalAmount) {
    return Flux.fromIterable(userDatabase.keySet())
            .flatMap(userId -> {
                Mono<User> userMono = findUserById(userId);
                Flux<Order> ordersFlux = findOrdersByUserId(userId);
                
                return Mono.zip(
                        userMono,
                        ordersFlux.map(Order::getAmount).reduce(0.0, Double::sum)
                ).map(tuple -> new UserWithOrderSummary(tuple.getT1(), tuple.getT2()));
            })
            .filter(userWithSummary -> userWithSummary.getTotalAmount() > minTotalAmount);
}
```

### 实时数据流处理（股票价格监控）

```java
// 模拟多只股票的价格流
Flux<StockPrice> appleStream = simulateStockPrice("AAPL");
Flux<StockPrice> googleStream = simulateStockPrice("GOOGL");
Flux<StockPrice> teslaStream = simulateStockPrice("TSLA");

// 合并多个股票流并计算统计信息
Flux.merge(appleStream, googleStream, teslaStream)
    .doOnNext(price -> System.out.println("[实时] " + price))
    // 窗口：每5个价格计算一次平均
    .window(5)
    .flatMap(window -> window
            .collectList()
            .map(prices -> {
                double avg = prices.stream()
                        .mapToDouble(StockPrice::price)
                        .average()
                        .orElse(0.0);
                return String.format("[统计] 5次平均价格: $%.2f", avg);
            }))
    .subscribe(System.out::println);
```

### 限流与防抖控制

```java
// 模拟高频用户输入（如搜索框输入）
Flux<String> userInputs = Flux.interval(Duration.ofMillis(100))
        .take(10)
        .map(i -> "搜索词" + i);

// 防抖：使用 sample 模拟防抖效果
userInputs
    .doOnNext(input -> System.out.println("[输入] " + input))
    .sample(Duration.ofMillis(300))  // 每300ms采样一次
    .subscribe(input -> System.out.println("[采样后] " + input));

// 限流：限制处理速率
Flux.range(1, 20)
    .limitRate(5)  // 每次只请求5个元素
    .subscribe();
```

### 批处理与窗口操作

```java
// 按数量批量处理（每5条处理一次）
dataStream
    .buffer(5)
    .flatMap(this::simulateBatchSave)
    .subscribe(result -> System.out.println("批量保存结果: " + result));

// 按时间窗口处理（每500ms处理一次）
Flux.interval(Duration.ofMillis(80))
    .window(Duration.ofMillis(500))
    .flatMap(window -> window.collectList())
    .subscribe(list -> System.out.println("窗口数据: " + list));

// 按时间或数量触发（先到先触发）
Flux.interval(Duration.ofMillis(100))
    .bufferTimeout(5, Duration.ofMillis(400))  // 5条或400ms，先到先触发
    .subscribe(batch -> System.out.println("批量: " + batch.size() + "条"));
```

### 多级缓存模式

```java
/**
 * 多级缓存查询 (L1 -> L2 -> DB)
 */
private static Mono<String> getWithMultiLevelCache(int id,
                                                   Map<Integer, String> l1Cache,
                                                   Map<Integer, String> l2Cache) {
    // L1缓存检查
    if (l1Cache.containsKey(id)) {
        return Mono.just(l1Cache.get(id));
    }

    // L2缓存检查，如果不存在则查询DB
    return Mono.justOrEmpty(l2Cache.get(id))
            .switchIfEmpty(Mono.defer(() -> simulateDatabaseQuery(id)))
            .doOnNext(result -> l1Cache.put(id, result));  // 回填L1缓存
}
```

---

## 大文件处理

### 流式逐行处理

```java
/**
 * 响应式逐行读取文件 - 避免内存溢出
 */
private static Flux<String> readLinesReactive(Path filePath) {
    return Flux.using(
            () -> new BufferedReader(new FileReader(filePath.toFile())),
            reader -> Flux.fromStream(reader.lines()),
            reader -> {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
    ).subscribeOn(Schedulers.boundedElastic());
}

// 使用：流式处理大文件
readLinesReactive(filePath)
    .filter(line -> !line.trim().isEmpty())
    .map(String::toUpperCase)
    .take(1000)  // 只处理前1000行
    .subscribe();
```

### 并行处理文件内容

```java
readLinesReactive(filePath)
    .buffer(100)  // 每100行作为一个批次
    .flatMap(batch -> Flux.fromIterable(batch)
            .parallel(4)  // 使用4个线程并行处理
            .runOn(Schedulers.parallel())
            .map(line -> processLine(line))
            .sequential()
    )
    .subscribe();
```

### 背压感知的大文件处理

```java
readLinesReactive(filePath)
    .onBackpressureBuffer(50,  // 缓冲区大小
            dropped -> System.out.println("背压丢弃: " + dropped),
            BufferOverflowStrategy.DROP_OLDEST)  // 丢弃最旧的数据
    .flatMap(line -> 
            Mono.fromCallable(() -> slowProcess(line))
                .subscribeOn(Schedulers.boundedElastic()),
            5  // 最大并发数限制
    )
    .subscribe();
```

### MapReduce 风格的大文件处理

```java
// 将文件分成多个 chunk，每个 chunk 并行处理
Flux<FileChunk> chunks = splitFileIntoChunks(filePath, 5);

// Map 阶段：并行处理每个 chunk
chunks
    .flatMap(chunk -> processChunk(chunk)
            .subscribeOn(Schedulers.boundedElastic()))
    .reduce(new MapReduceResult(0, 0, 0), MapReduceResult::merge)
    .subscribe(result -> {
        System.out.println("总行数: " + result.totalLines());
        System.out.println("总字符数: " + result.totalChars());
    });
```

---

## WebFlux 常见模式

### REST API 聚合模式

```java
// 一个端点需要调用多个下游服务并合并结果
Mono<OrderInfo> orderMono = fetchOrderInfo(orderId);
Mono<UserInfo> userMono = fetchUserInfo(userId);
Flux<ProductInfo> productsFlux = fetchProducts(productIds);

// 使用 zip 并行调用并合并结果
Mono<OrderDetailView> orderDetail = Mono.zip(orderMono, userMono, productsFlux.collectList())
    .map(tuple -> new OrderDetailView(
            tuple.getT1(),  // order
            tuple.getT2(),  // user
            tuple.getT3()   // products
    ));

orderDetail.subscribe(detail -> System.out.println("订单详情: " + detail));
```

### 响应式缓存模式

```java
/**
 * 响应式缓存实现（带缓存击穿防护）
 */
static class ReactiveCache {
    private final Map<String, Mono<?>> loadingCache = new ConcurrentHashMap<>();
    private final Map<String, Object> cache = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    public <T> Mono<T> get(String key, Function<String, Mono<T>> loader) {
        // 检查内存缓存
        if (cache.containsKey(key)) {
            return Mono.just((T) cache.get(key));
        }

        // 使用 computeIfAbsent 防止缓存击穿
        return (Mono<T>) loadingCache.computeIfAbsent(key, k ->
                loader.apply(k)
                    .doOnNext(value -> {
                        cache.put(k, value);
                        loadingCache.remove(k);
                    })
                    .cache()  // 确保并发请求共享结果
        );
    }
}
```

### Saga 事务模式

```java
/**
 * Saga 模式 - 分布式事务补偿
 */
private static Mono<String> createOrderSaga(OrderRequest request) {
    String orderId = "ORDER-" + System.currentTimeMillis();

    // Step 1: 创建订单
    return createOrder(orderId, request)
            // Step 2: 扣减库存
            .flatMap(oid -> deductInventory(request.items())
                    .then(Mono.just(oid)))
            // Step 3: 扣款
            .flatMap(oid -> processPayment(request.userId(), request.amount())
                    .then(Mono.just(oid)))
            // Step 4: 发送通知
            .flatMap(oid -> sendNotification(request.userId(), "订单创建成功")
                    .then(Mono.just(oid)))
            // 补偿操作
            .doOnError(e -> {
                restoreInventory(request.items()).subscribe();
                cancelOrder(orderId).subscribe();
            });
}
```

### 总结

#### 适用场景

✅ **适合使用 Project Reactor：**
- 高并发 Web 应用（配合 WebFlux）
- 数据流处理（实时监控、日志分析）
- 微服务间异步调用
- 大文件处理
- 事件驱动架构

❌ **不适合使用：**
- 简单的 CRUD 应用
- 大量遗留阻塞代码

核心要点：响应式编程不是银弹，但在高并发 IO 场景下，它能让你用更少的资源处理更多的请求。关键在于理解非阻塞的本质，避免在响应式链中引入阻塞操作。