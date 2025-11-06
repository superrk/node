# Reactive Streams

## Reactive Streams 规范详解

### 什么是 Reactive Streams？

Reactive Streams 是一个为 JVM 提供异步流处理标准的规范，旨在提供非阻塞背压（backpressure）的异步流处理。它解决了传统流处理中生产者速度过快导致消费者缓冲区溢出或数据丢失的问题。

#### 历史背景和动机

Reactive Streams 规范诞生于 2013 年，由 Netflix、Pivotal、Lightbend 等公司发起，旨在统一 JVM 生态系统中异步流处理的接口和行为。当时，各种流处理库（如 RxJava、Akka Streams）都有自己的 API，导致开发者在不同库间切换时需要重新学习，这增加了学习成本和维护难度。同时，传统异步处理模式往往缺乏有效的背压机制，容易导致内存溢出或性能问题。

规范的目标是：
- 提供统一的异步流处理 API
- 实现非阻塞的背压控制
- 确保线程安全和资源管理
- 支持多种底层实现（如基于回调、Future 或 Actor 的）

### 核心特性

- **异步性**：支持异步数据流处理，不阻塞线程
- **背压（Backpressure）**：消费者可以控制生产者的数据生产速率，避免资源耗尽
- **非阻塞**：使用事件驱动模式，避免阻塞等待
- **组合性**：支持流操作符的组合，形成复杂的处理管道

## 核心概念

Reactive Streams 遵循的 4 个核心概念：Java9的Flow API完整实现了这些内容。
1. **Publisher（发布者）**

   Publisher 是数据流的源头，负责向订阅者发布数据。它提供了 `subscribe` 方法，允许 Subscriber 订阅数据流。

   ```java
   public interface Publisher<T> {
       void subscribe(Subscriber<? super T> subscriber);
   }
   ```

   **关键点：**
   - 一个 Publisher 可以被多个 Subscriber 订阅
   - 订阅后，Publisher 必须调用 Subscriber 的 `onSubscribe` 方法，传入 Subscription 对象
   - Publisher 应该按照背压规则发送数据，不能无限制地推送数据
2. **Subscriber（订阅者）**

   Subscriber 是数据流的消费者，定义了如何处理接收到的数据和事件。

   ```java
   public interface Subscriber<T> {
       void onSubscribe(Subscription subscription);
       void onNext(T t);
       void onError(Throwable t);
       void onComplete();
   }
   ```

   **生命周期和方法说明：**
   - `onSubscribe(Subscription subscription)`：订阅开始时调用，接收 Subscription 对象用于控制数据流
   - `onNext(T t)`：接收到数据项时调用，可以调用多次
   - `onError(Throwable t)`：发生错误时调用，流处理终止
   - `onComplete()`：数据流正常结束时调用，流处理终止

   **注意：** `onSubscribe` 必须在其他方法之前调用，且只能调用一次。
3. **Subscription（订阅关系）**

   Subscription 代表了 Publisher 和 Subscriber 之间的订阅关系，提供了控制数据流的机制。

   ```java
   public interface Subscription {
       void request(long n);
       void cancel();
   }
   ```

   **方法说明：**
   - `request(long n)`：Subscriber 请求 Publisher 发送 n 个数据项，实现背压控制
   - `cancel()`：取消订阅，停止接收数据

   **背压机制：** Subscriber 通过 `request()` 方法告诉 Publisher 它能处理多少数据。Publisher 不会发送超过请求数量的数据，确保不会压垮消费者。
4. **Processor（处理器）**

   Processor 既是 Subscriber 又是 Publisher，可以作为数据流的中间处理器，对数据进行转换或过滤。

   ```java
   public interface Processor<T, R> extends Subscriber<T>, Publisher<R> {
   }
   ```

   **作用：** Processor 可以订阅上游 Publisher，处理数据，然后作为 Publisher 发布处理后的数据给下游 Subscriber。它常用于实现流操作符，如 map、filter、flatMap 等。

   ### 背压详解

   背压是 Reactive Streams 的核心机制之一，它允许下游消费者控制上游生产者的数据生产速率。

   #### 为什么需要背压？

   在异步系统中，生产者往往比消费者快，导致：
   - 缓冲区溢出
   - 内存耗尽
   - 数据丢失
   - 系统性能下降

   #### 背压的工作原理

   1. Subscriber 通过 `Subscription.request(n)` 请求特定数量的数据
   2. Publisher 只发送不超过请求数量的数据
   3. 当 Subscriber 处理完数据后，可以继续请求更多数据
   4. 通过这种方式实现生产者和消费者之间的流量控制

   #### 背压策略

   - **REQUEST_MAX**：Subscriber 维护最大请求数量
   - **UNBOUNDED**：无限制请求（相当于传统流）
   - **BUFFER**：使用缓冲区处理速率不匹配
## Reactive Streams 规范规则

Reactive Streams 规范定义了一系列规则，确保所有实现之间的一致性和互操作性。这些规则分为 Publisher 规则、Subscriber 规则和 Subscription 规则。

### Publisher 规则

1. **订阅处理**：`subscribe` 方法必须调用 Subscriber 的 `onSubscribe` 方法一次，且在其他任何信号之前。
2. **信号顺序**：在 `onSubscribe` 之后，只能发送 `onNext`、`onError` 或 `onComplete` 信号，但不能同时发送 `onError` 和 `onComplete`。
3. **背压遵守**：Publisher 绝不能发送超过 Subscriber 通过 `request()` 请求数量的数据。
4. **错误处理**：如果 Publisher 遇到不可恢复的错误，必须发送 `onError` 信号。
5. **完成处理**：Publisher 在发送所有数据后必须发送 `onComplete` 信号。

### Subscriber 规则

1. **请求管理**：Subscriber 必须通过 `request()` 方法请求数据，不能被动等待。
2. **信号处理**：Subscriber 必须准备好随时处理 `onNext`、`onError` 和 `onComplete` 信号。
3. **取消处理**：Subscriber 可以随时调用 `cancel()` 取消订阅。
4. **线程安全**：所有 Subscriber 方法必须是线程安全的。

### Subscription 规则

1. **唯一性**：每个 Subscriber 只接收一个 Subscription 实例。
2. **请求累积**：`request()` 调用是累积的，后续调用会添加到之前的请求数量。
3. **取消唯一性**：`cancel()` 调用后，所有后续的 `request()` 调用都无效。
4. **并发安全**：Subscription 的方法必须是线程安全的。

## 代码示例

### 简单 Publisher 实现

```java
public class SimplePublisher implements Publisher<Integer> {
    @Override
    public void subscribe(Subscriber<? super Integer> subscriber) {
        SimpleSubscription subscription = new SimpleSubscription(subscriber);
        subscriber.onSubscribe(subscription);
    }

    static class SimpleSubscription implements Subscription {
        private final Subscriber<? super Integer> subscriber;
        private boolean cancelled = false;
        private long requested = 0;

        SimpleSubscription(Subscriber<? super Integer> subscriber) {
            this.subscriber = subscriber;
        }

        @Override
        public void request(long n) {
            if (n <= 0) {
                subscriber.onError(new IllegalArgumentException("请求数量必须大于0"));
                return;
            }
            synchronized (this) {
                requested += n;
            }
            publish();
        }

        @Override
        public void cancel() {
            cancelled = true;
        }

        private void publish() {
            synchronized (this) {
                while (requested > 0 && !cancelled) {
                    requested--;
                    subscriber.onNext((int) (Math.random() * 100));
                }
                if (!cancelled) {
                    subscriber.onComplete();
                }
            }
        }
    }
}
```

### Subscriber 使用示例

```java
public class SimpleSubscriber implements Subscriber<Integer> {
    private Subscription subscription;

    @Override
    public void onSubscribe(Subscription subscription) {
        this.subscription = subscription;
        System.out.println("订阅成功，开始请求数据");
        subscription.request(5); // 请求5个数据
    }

    @Override
    public void onNext(Integer value) {
        System.out.println("接收到数据: " + value);
        // 处理完一个数据后，继续请求下一个
        subscription.request(1);
    }

    @Override
    public void onError(Throwable t) {
        System.err.println("发生错误: " + t.getMessage());
    }

    @Override
    public void onComplete() {
        System.out.println("数据流处理完成");
    }
}
```

### 使用示例

```java
Publisher<Integer> publisher = new SimplePublisher();
Subscriber<Integer> subscriber = new SimpleSubscriber();
publisher.subscribe(subscriber);
```

## 常见实现库

### RxJava

RxJava 是 Reactive Streams 最流行的实现之一，提供丰富的操作符和调度器。

```java
Observable<Integer> observable = Observable.range(1, 10);
observable.subscribe(
    value -> System.out.println("接收: " + value),
    error -> System.err.println("错误: " + error),
    () -> System.out.println("完成")
);
```

### Project Reactor

Project Reactor 是 Spring 生态系统的 Reactive Streams 实现，提供 Mono 和 Flux 两种类型。

```java
Flux<Integer> flux = Flux.range(1, 10)
    .map(i -> i * 2)
    .filter(i -> i > 5);

flux.subscribe(
    value -> System.out.println("接收: " + value),
    error -> System.err.println("错误: " + error),
    () -> System.out.println("完成")
);
```

### Akka Streams

Akka Streams 提供了基于 Actor 的 Reactive Streams 实现，适合构建分布式系统。

```java
Source<Integer, NotUsed> source = Source.range(1, 10);
Sink<Integer, CompletionStage<Done>> sink = Sink.foreach(System.out::println);

RunnableGraph<CompletionStage<Done>> graph = source.to(sink);
graph.run(system);
```

## 总结

Reactive Streams 规范通过定义统一的接口和规则，解决了异步流处理中的关键问题：

- **背压机制**：防止生产者压垮消费者
- **标准化接口**：确保不同实现之间的互操作性
- **错误处理**：提供一致的错误传播机制
- **资源管理**：支持取消和生命周期管理

掌握 Reactive Streams 的核心概念和规范规则，有助于开发高性能、可扩展的异步应用程序。