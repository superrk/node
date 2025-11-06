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

## 与 Spring WebFlux 集成

Project Reactor 是 Spring WebFlux 的基础，为构建反应式 Web 应用提供了强大支持。Spring WebFlux 允许使用函数式编程模型或注解驱动的控制器。

**注解驱动控制器示例：**

```java
@RestController
public class ReactiveController {

    @GetMapping("/users")
    public Flux<User> getUsers() {
        return userService.findAll()
            .doOnNext(user -> log.info("Processing user: {}", user.getId()));
    }

    @GetMapping("/user/{id}")
    public Mono<User> getUser(@PathVariable String id) {
        return userService.findById(id)
            .switchIfEmpty(Mono.error(new UserNotFoundException(id)));
    }

    @PostMapping("/user")
    public Mono<User> createUser(@RequestBody Mono<User> userMono) {
        return userMono
            .flatMap(userService::save)
            .doOnSuccess(user -> log.info("Created user: {}", user.getId()));
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> getEvents() {
        return Flux.interval(Duration.ofSeconds(1))
            .map(sequence -> ServerSentEvent.<String>builder()
                .id(String.valueOf(sequence))
                .event("periodic-event")
                .data("SSE - " + LocalTime.now().toString())
                .build());
    }
}
```

**函数式端点示例：**

```java
@Configuration
public class RouterConfig {

    @Bean
    public RouterFunction<ServerResponse> userRoutes(UserHandler userHandler) {
        return RouterFunctions.route()
            .GET("/api/users", userHandler::getAllUsers)
            .GET("/api/users/{id}", userHandler::getUserById)
            .POST("/api/users", userHandler::createUser)
            .build();
    }
}

@Component
public class UserHandler {

    public Mono<ServerResponse> getAllUsers(ServerRequest request) {
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(userService.findAll(), User.class);
    }

    public Mono<ServerResponse> getUserById(ServerRequest request) {
        String id = request.pathVariable("id");
        return userService.findById(id)
            .flatMap(user -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(user))
            .switchIfEmpty(ServerResponse.notFound().build());
    }
}
```

**WebClient 示例：**

```java
@Service
public class UserService {

    private final WebClient webClient;

    public UserService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.example.com").build();
    }

    public Flux<User> findAll() {
        return webClient.get()
            .uri("/users")
            .retrieve()
            .bodyToFlux(User.class)
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
            .timeout(Duration.ofSeconds(10));
    }

    public Mono<User> findById(String id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .onStatus(HttpStatus::is4xxClientError, response ->
                Mono.error(new UserNotFoundException(id)))
            .bodyToMono(User.class);
    }
}
```
