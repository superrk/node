---
outline: deep
title: Kotlin 协程整理
order: 3
---

# Kotlin 协程

## 简介

Kotlin 协程是用于异步编程的强大工具。它允许以同步的方式编写异步代码，提供了一种更简单、更安全的方式来处理并发和异步操作。

**核心特性：**
- 非阻塞：协程可以在不阻塞线程的情况下挂起和恢复
- 轻量级：协程比线程更轻量，可以创建数万个协程而不会影响性能
- 结构化并发：协程遵循结构化并发原则，确保协程的生命周期得到正确管理
- 灵活的取消：支持协程的取消和超时操作
- 异常传播：协程中的异常会沿着协程层次结构传播

[官方网站](https://kotlinlang.org/docs/coroutines-overview.html) | [GitHub](https://github.com/Kotlin/kotlinx.coroutines) | [文档](https://kotlinlang.org/api/kotlinx.coroutines/)

## 基本概念

### 协程

协程是一种可以挂起和恢复执行的计算实例。它可以被看作是轻量级的线程，但不是由操作系统调度，而是由 Kotlin 运行时管理的。

### 挂起函数

挂起函数是可以被挂起的函数，使用 `suspend` 关键字声明。挂起函数只能在协程或其他挂起函数中调用。

```kotlin
suspend fun delayAndPrint() {
    delay(1000L)  // 挂起 1 秒
    println("Hello after delay")
}
```

### 协程构建器

协程构建器用于创建协程，主要包括：

- [`launch`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html): 创建并启动协程，返回 `Job`
- [`async`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html): 创建协程并返回 `Deferred<T>`，可用于获取结果

### 协程作用域

协程作用域用于管理协程的生命周期：

- [`CoroutineScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/): 定义协程的生命周期范围
- [`GlobalScope`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/): 全局协程作用域
- [`viewModelScope`](https://developer.android.com/topic/libraries/architecture/coroutines): Android ViewModel 作用域
- [`lifecycleScope`](https://developer.android.com/topic/libraries/architecture/coroutines): Android 生命周期作用域

## 协程构建器

### launch

`launch` 构建器用于启动不返回结果的协程。它返回一个 `Job` 对象，可用于取消协程或等待其完成。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        delay(1000L)
        println("World!")
    }
    println("Hello,")
    job.join()  // 等待协程完成
}
```

### async

`async` 构建器用于启动返回结果的协程。它返回一个 `Deferred<T>` 对象，可以通过 `await()` 获取结果。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val deferred = async {
        delay(1000L)
        "Result"
    }
    println("Waiting for result...")
    val result = deferred.await()
    println("Result: $result")
}
```

### runBlocking

`runBlocking` 构建器用于桥接阻塞和非阻塞代码。它会阻塞当前线程直到协程完成。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        delay(1000L)
        println("Task from runBlocking")
    }
    println("Hello from main")
}
```

### coroutineScope

`coroutineScope` 构建器用于创建协程作用域，它会等待所有子协程完成后再继续执行。

```kotlin
import kotlinx.coroutines.*

suspend fun performTasks() = coroutineScope {
    launch {
        delay(1000L)
        println("Task 1 completed")
    }
    launch {
        delay(2000L)
        println("Task 2 completed")
    }
    println("All tasks started")
}

fun main() = runBlocking {
    performTasks()
    println("All tasks finished")
}
```

## 上下文和调度器

### CoroutineContext

协程上下文包含协程的执行环境信息，包括：

- `Job`: 协程的句柄
- `CoroutineDispatcher`: 决定协程在哪个线程或线程池执行
- `CoroutineName`: 协程的名称（用于调试）
- `CoroutineExceptionHandler`: 异常处理器

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val context = CoroutineName("MyCoroutine") + Dispatchers.Default
    launch(context) {
        println("Running in ${Thread.currentThread().name}")
    }
}
```

### 调度器 (Dispatchers)

调度器决定协程在哪个线程执行：

- [`Dispatchers.Default`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html): CPU 密集型任务的默认调度器
- [`Dispatchers.IO`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html): I/O 操作的调度器
- [`Dispatchers.Main`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html): UI 线程调度器（Android）
- [`Dispatchers.Unconfined`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-unconfined.html): 不限制线程的调度器

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch(Dispatchers.Default) {
        println("Default: ${Thread.currentThread().name}")
    }
    launch(Dispatchers.IO) {
        println("IO: ${Thread.currentThread().name}")
    }
}
```

### 上下文切换

使用 `withContext` 在协程中切换上下文：

```kotlin
import kotlinx.coroutines.*

suspend fun fetchData(): String = withContext(Dispatchers.IO) {
    delay(1000L)  // 模拟网络请求
    "Fetched data"
}

fun main() = runBlocking {
    val data = fetchData()
    println(data)
}
```

## 取消和超时

### 协程取消

协程可以通过 `Job.cancel()` 取消。被取消的协程会抛出 `CancellationException`。

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("job: I'm sleeping $i ...")
                delay(500L)
            }
        } catch (e: CancellationException) {
            println("job: I'm cancelled")
            throw e
        } finally {
            println("job: I'm running finally")
        }
    }

    delay(1300L) // 延迟一段时间
    println("main: I'm tired of waiting!")
    job.cancel() // 取消协程
    job.join() // 等待协程结束
    println("main: Now I can quit.")
}
```

### 超时

使用 `withTimeout` 或 `withTimeoutOrNull` 为协程设置超时：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    try {
        withTimeout(1300L) {
            repeat(1000) { i ->
                println("I'm sleeping $i ...")
                delay(500L)
            }
        }
    } catch (e: TimeoutCancellationException) {
        println("Timed out with $e")
    }

    // 使用 withTimeoutOrNull 返回 null 而不是抛出异常
    val result = withTimeoutOrNull(1300L) {
        repeat(1000) { i ->
            println("I'm sleeping $i ...")
            delay(500L)
        }
        "Done"
    }
    println("Result is $result")
}
```

## 异常处理

### 异常传播

协程中的异常会沿着协程层次结构向上传播：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    try {
        launch {
            throw IllegalArgumentException("Something went wrong")
        }
    } catch (e: IllegalArgumentException) {
        println("Caught exception: ${e.message}")
    }
}
```

### CoroutineExceptionHandler

使用 `CoroutineExceptionHandler` 处理未捕获的异常：

```kotlin
import kotlinx.coroutines.*

val handler = CoroutineExceptionHandler { _, exception ->
    println("Caught $exception")
}

fun main() = runBlocking {
    val job = GlobalScope.launch(handler) {
        throw AssertionError("Something went wrong")
    }
    job.join()
}
```

### supervisorScope

`supervisorScope` 允许子协程独立失败，而不会影响其他子协程：

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    supervisorScope {
        launch {
            delay(1000L)
            throw Error("Some error")
        }

        launch {
            delay(2000L)
            println("Second child completed")
        }
    }
    println("Supervisor scope completed")
}
```

## 通道 (Channel)

通道是协程之间通信的方式，类似于 Go 语言的通道。

### 基本使用

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun main() = runBlocking {
    val channel = Channel<Int>()
    launch {
        for (x in 1..5) {
            channel.send(x * x)
        }
        channel.close()
    }

    for (y in channel) {
        println(y)
    }
    println("Done!")
}
```

### 通道类型

- `Channel.UNLIMITED`: 无缓冲通道
- `Channel.BUFFERED`: 缓冲通道（默认缓冲大小）
- `Channel.CONFLATED`: 保留最新值的通道
- `Channel.RENDEZVOUS`: 无缓冲通道（默认）

### 生产者和消费者模式

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun CoroutineScope.produceNumbers() = produce<Int> {
    var x = 1
    while (true) {
        send(x++)
        delay(100L)
    }
}

fun CoroutineScope.square(numbers: ReceiveChannel<Int>) = produce<Int> {
    for (x in numbers) {
        send(x * x)
    }
}

fun main() = runBlocking {
    val numbers = produceNumbers()
    val squares = square(numbers)
    repeat(5) {
        println(squares.receive())
    }
    coroutineContext.cancelChildren()
}
```

## 流 (Flow)

Flow 是冷流，用于异步数据流处理，类似于 Reactive Streams。

### 基本使用

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        delay(100L)
        emit(i)
    }
}

fun main() = runBlocking {
    simple().collect { value -> println(value) }
}
```

### Flow 操作符

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun main() = coroutineScope {
    (1..5).asFlow()
        .filter { it % 2 == 0 }
        .map { it * it }
        .collect { println(it) }
}
```

### 转换操作符

- `map`: 转换元素
- `filter`: 过滤元素
- `transform`: 自定义转换
- `take`: 取前 n 个元素
- `drop`: 跳过前 n 个元素

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun main() = coroutineScope {
    flowOf(1, 2, 3, 4, 5)
        .transform { value ->
            emit(value)
            emit(value * 2)
        }
        .collect { println(it) }
}
```

### 终端操作符

- `collect`: 收集所有元素
- `toList()`: 转换为 List
- `toSet()`: 转换为 Set
- `first()`: 获取第一个元素
- `single()`: 获取单个元素
- `reduce`: 聚合操作
- `fold`: 折叠操作

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun main() = coroutineScope {
    val sum = (1..5).asFlow()
        .map { it * it }
        .reduce { a, b -> a + b }
    println(sum)

    val list = (1..5).asFlow()
        .filter { it % 2 == 0 }
        .toList()
    println(list)
}
```

### Flow 上下文

Flow 的收集在调用者的上下文中进行：

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun simple(): Flow<Int> = flow {
    for (i in 1..3) {
        Thread.sleep(100) // 模拟阻塞操作
        log("Emitting $i")
        emit(i)
    }
}.flowOn(Dispatchers.Default) // 在 Default 调度器上发射

fun main() = runBlocking {
    simple().collect { value ->
        log("Collected $value")
    }
}
```

### Flow 异常处理

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun simple(): Flow<String> = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i.toString())
        if (i == 2) {
            throw RuntimeException("Error on $i")
        }
    }
}

suspend fun main() = coroutineScope {
    try {
        simple().collect { value -> println(value) }
    } catch (e: Throwable) {
        println("Caught $e")
    }
}
```

## 测试

Kotlin 协程提供了测试工具来测试协程代码。

### 基本测试

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.test.*
import kotlin.test.*

class CoroutineTest {

    @Test
    fun testBasicCoroutine() = runTest {
        val result = async {
            delay(1000L)
            "Hello"
        }.await()

        assertEquals("Hello", result)
    }
}
```

### 虚拟时间测试

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.test.*
import kotlin.test.*
import kotlin.time.Duration.Companion.seconds

class VirtualTimeTest {

    @Test
    fun testWithVirtualTime() = runTest {
        val result = async {
            delay(5.seconds)
            "Done"
        }

        // 虚拟时间前进
        advanceTimeBy(5.seconds)
        runCurrent()

        assertEquals("Done", result.await())
    }
}
```

### 测试调度器

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.test.*
import kotlin.test.*

class TestDispatcherTest {

    @Test
    fun testDispatcher() = runTest {
        val testDispatcher = StandardTestDispatcher(testScheduler)

        val result = withContext(testDispatcher) {
            delay(1000L)
            "Result"
        }

        assertEquals("Result", result)
    }
}
```

## 与其他库集成

### Retrofit

```kotlin
interface ApiService {
    @GET("users")
    suspend fun getUsers(): List<User>
}

val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val apiService = retrofit.create(ApiService::class.java)

suspend fun fetchUsers(): List<User> {
    return apiService.getUsers()
}
```

### Room

```kotlin
@Dao
interface UserDao {
    @Query("SELECT * FROM user")
    suspend fun getAll(): List<User>

    @Insert
    suspend fun insertAll(vararg users: User)

    @Delete
    suspend fun delete(user: User)
}

class UserRepository(private val userDao: UserDao) {
    suspend fun getUsers(): List<User> = userDao.getAll()

    suspend fun addUser(user: User) = userDao.insertAll(user)
}
```

### LiveData (Android)

```kotlin
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    private val _users = MutableLiveData<List<User>>()
    val users: LiveData<List<User>> = _users

    fun fetchUsers() {
        viewModelScope.launch {
            try {
                val userList = repository.getUsers()
                _users.value = userList
            } catch (e: Exception) {
                // 处理错误
            }
        }
    }
}
```

### StateFlow (Android)

```kotlin
class UserViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val uiState: StateFlow<UserUiState> = _uiState

    fun fetchUsers() {
        viewModelScope.launch {
            _uiState.value = UserUiState.Loading
            try {
                val users = repository.getUsers()
                _uiState.value = UserUiState.Success(users)
            } catch (e: Exception) {
                _uiState.value = UserUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

sealed class UserUiState {
    object Loading : UserUiState()
    data class Success(val users: List<User>) : UserUiState()
    data class Error(val message: String) : UserUiState()
}
```

## 最佳实践

1. **使用结构化并发**：始终在适当的作用域中启动协程
2. **避免 GlobalScope**：除非协程需要独立于调用者生命周期存在
3. **正确处理异常**：使用适当的异常处理机制
4. **选择合适的调度器**：根据任务类型选择合适的调度器
5. **使用 Flow 处理数据流**：对于异步数据流，使用 Flow 而不是 Channel
6. **测试协程代码**：编写全面的单元测试，包括超时和异常情况
7. **避免阻塞操作**：不要在协程中使用阻塞 API
8. **管理协程生命周期**：正确取消不再需要的协程

## 性能考虑

- 协程是轻量级的，可以创建大量协程
- 使用适当的调度器可以提高性能
- Flow 支持背压，可以处理大量数据
- 协程的启动和切换开销很小
- 内存使用取决于协程的数量和持续时间

## 常见模式

### Repository 模式

```kotlin
class UserRepositoryImpl(
    private val apiService: ApiService,
    private val userDao: UserDao
) : UserRepository {

    override suspend fun getUsers(): List<User> = withContext(Dispatchers.IO) {
        try {
            val users = apiService.getUsers()
            userDao.insertAll(*users.toTypedArray())
            users
        } catch (e: Exception) {
            userDao.getAll() // 降级到本地数据
        }
    }
}
```

### 工作队列模式

```kotlin
class WorkQueue {
    private val channel = Channel<WorkItem>(Channel.BUFFERED)

    init {
        repeat(4) { // 4 个工作协程
            launch {
                for (item in channel) {
                    processWorkItem(item)
                }
            }
        }
    }

    suspend fun submitWork(item: WorkItem) {
        channel.send(item)
    }

    private suspend fun processWorkItem(item: WorkItem) {
        // 处理工作项
    }
}
```

### 重试模式

```kotlin
suspend fun <T> retry(
    times: Int = 3,
    initialDelay: Long = 100,
    maxDelay: Long = 1000,
    factor: Double = 2.0,
    block: suspend () -> T
): T {
    var currentDelay = initialDelay
    repeat(times - 1) {
        try {
            return block()
        } catch (e: Exception) {
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong().coerceAtMost(maxDelay)
        }
    }
    return block() // 最后一次尝试
}