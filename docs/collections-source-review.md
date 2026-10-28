# 集合基础来源审阅 / Collection source review

检查日期：2026-10-28。两章、12 门语言、24 个原创双语实现。
只审阅下列相关章节，不宣称读完所有语言手册。示例未编译或执行；网站测试只验证交付与交互，不验证全部语言运行结果。

## 统一任务与差异

- 顺序集合：以 red、blue、green 说明创建、追加、索引读取、长度和按序遍历。选择可增长容器，不将 Java/C#/Kotlin 的固定数组与列表混同。Go append 的返回值要接回；PHP array 是有序映射，count 不是最大索引加一；JavaScript 稀疏数组 length 可包括空槽。
- 键值映射：以数量存储比较存在性、取值、覆盖与遍历。允许空值的语言另示 empty，非空数值例保留零值；这些样例不是逐字相同的运行输出对照。
- Go 用 comma-ok 区分缺键与零；Rust get 返回 Option；Swift 非可选 Int 值的 Dictionary 读取仍返回 Optional。
- C++ unordered_map 的 operator[] 读取缺键也可能插入；contains/at 不插入。contains 需要 C++20。C++ 来源是滚动工作草案和实现方文档，不标成已出版 ISO 标准。
- C# Dictionary、Go map、Rust HashMap、C++ unordered_map、Swift Dictionary 不承诺按插入顺序遍历。Java 明确选择默认 LinkedHashMap，Kotlin 选择 linkedMapOf；不把这一属性扩展到全部 Map 实现。
- JavaScript Map 与 Object 不等价。TypeScript has 不将随后 get 的结果自动收窄为非 undefined。Python/Ruby/PHP/Java/Kotlin 的 null-like 值也不能当作缺键判断。
- 文档固定版本与示例最低环境分别列出，不声称这些是最新版本。Swift 文档站正文需要 JavaScript，采用 swiftlang 官方书籍源；阅读来源不意味着执行源代码。

页面支持标识沿用当前生产定义：native 显示“原生机制 / 标准库”。本批均使用语言内建或随语言/运行时提供的标准库，不使用外部包；具体属于哪类在实现说明与基线中明确，不以此声称容器都是语法原生。

## 逐项覆盖

机器可读账本见 [collections-source-coverage.json](collections-source-coverage.json)。每个实现保留章节、URL、检查日期与运行基线；下面列出去重来源。

- [ECMAScript® 2024 Language Specification](https://tc39.es/ecma262/2024/multipage/indexed-collections.html#sec-array.prototype.push)：23.1.3.23 Array.prototype.push; 23.1.3.38 values; 23.1.5.1 CreateArrayIterator
- [ECMAScript® 2024 Language Specification](https://tc39.es/ecma262/2024/multipage/ordinary-and-exotic-objects-behaviours.html#sec-array-exotic-objects)：10.4.2 Array Exotic Objects
- [TypeScript: Documentation - Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays)：Arrays
- [TypeScript: TSConfig Option: lib](https://www.typescriptlang.org/tsconfig/lib.html)：lib
- [TypeScript: TSConfig Option: target](https://www.typescriptlang.org/tsconfig/target.html)：target
- [5. Data Structures — Python 3.12 documentation](https://docs.python.org/3.12/tutorial/datastructures.html#more-on-lists)：5.1 More on Lists
- [Built-in Types — Python 3.12 documentation](https://docs.python.org/3.12/library/stdtypes.html#common-sequence-operations)：Common Sequence Operations; Lists
- [The Go Programming Language Specification](https://go.dev/ref/spec#Slice_types)：Slice types
- [The Go Programming Language Specification](https://go.dev/ref/spec#Appending_to_and_copying_slices)：Appending to and copying slices
- [The Go Programming Language Specification](https://go.dev/ref/spec#Index_expressions)：Index expressions
- [The Go Programming Language Specification](https://go.dev/ref/spec#For_range)：For statements with range clause
- [Vec in std::vec — Rust](https://doc.rust-lang.org/stable/std/vec/struct.Vec.html)：Examples; Indexing; push; len; iter
- [The Rust Edition Guide — Rust 2021](https://doc.rust-lang.org/edition-guide/rust-2021/index.html)：Release version
- [ArrayList (Java SE 17 & JDK 17)](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayList.html)：Class description; add(E); get(int); size(); iterator()
- [Arrays (Java SE 17 & JDK 17)](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html#asList(T...))：asList(T...)
- [List (Java SE 17 & JDK 17)](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/List.html)：Interface description; Unmodifiable Lists
- [List<T> Class](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1?view=net-8.0)：Examples; Remarks; Count; Item[Int32]; Add(T)
- [Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)：Array properties
- [IReadOnlyList<T> Interface](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ireadonlylist-1?view=net-8.0)：Remarks
- [What's new in C# 12](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-12)：Introduction
- [class Array - Documentation for Ruby 3.3](https://docs.ruby-lang.org/en/3.3/Array.html)：Creating Arrays; Array Indexes; #<<; #[]; #length; #each
- [PHP: Arrays - Manual](https://www.php.net/manual/en/language.types.array.php)：Arrays; Syntax: key casts; Accessing array elements with square bracket syntax; Creating/modifying with square bracket syntax
- [PHP: count - Manual](https://www.php.net/manual/en/function.count.php)：Description; Return Values
- [PHP: foreach - Manual](https://www.php.net/manual/en/control-structures.foreach.php)：Key/value foreach form
- [The Swift Programming Language — Collection Types (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/CollectionTypes.md)：Dictionaries; Accessing and Modifying a Dictionary; Iterating Over a Dictionary
- [Collections overview](https://kotlinlang.org/docs/collections-overview.html)：Collection types; Map
- [mutableListOf](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/mutable-list-of.html)：vararg overload; Since Kotlin 1.0
- [C++ working draft — Class template vector](https://eel.is/c++draft/vector)：[vector.overview]; [vector.capacity]; [vector.modifiers]
- [C++ working draft — Sequence containers](https://eel.is/c++draft/sequence.reqmts)：[sequence.reqmts], element access requirements
- [ECMAScript® 2024 Language Specification](https://tc39.es/ecma262/2024/multipage/keyed-collections.html#sec-map-objects)：24.1 Map Objects; 24.1.3.6 get; 24.1.3.7 has; 24.1.3.9 set; 24.1.5.1 CreateMapIterator
- [TypeScript: Documentation - Iterators and Generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html#forof-statements)：Iterables; for..of statements
- [TypeScript 5.3.3 standard library — es2015.collection.d.ts](https://raw.githubusercontent.com/microsoft/TypeScript/v5.3.3/src/lib/es2015.collection.d.ts)：interface Map<K, V>: get, has, set; MapConstructor
- [5. Data Structures — Python 3.12 documentation](https://docs.python.org/3.12/tutorial/datastructures.html#dictionaries)：5.5 Dictionaries; 5.6 Looping Techniques
- [Built-in Types — Python 3.12 documentation](https://docs.python.org/3.12/library/stdtypes.html#mapping-types-dict)：Mapping Types — dict; get; items; insertion-order guarantee
- [The Go Programming Language Specification](https://go.dev/ref/spec#Map_types)：Map types
- [HashMap in std::collections — Rust](https://doc.rust-lang.org/stable/std/collections/struct.HashMap.html)：new; insert; contains_key; get; iter; IntoIterator
- [LinkedHashMap (Java SE 17 & JDK 17)](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/LinkedHashMap.html)：Class description: insertion order, reinsertion, null elements
- [Map (Java SE 17 & JDK 17)](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Map.html)：containsKey(Object); get(Object); put(K,V); entrySet()
- [Dictionary<TKey,TValue> Class](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2?view=net-8.0)：Examples; Remarks: enumeration order; Item[TKey]; ContainsKey(TKey)
- [Dictionary<TKey,TValue>.TryGetValue(TKey, TValue) Method](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2.trygetvalue?view=net-8.0)：Parameters; Returns; Examples
- [class Hash - Documentation for Ruby 3.3](https://docs.ruby-lang.org/en/3.3/Hash.html)：Creating a Hash; Entry Order; Default Values; #[]=; #[]; #key?; #each
- [PHP: array_key_exists - Manual](https://www.php.net/manual/en/function.array-key-exists.php)：Description; Example #2 array_key_exists() vs isset()
- [linkedMapOf](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/linked-map-of.html)：vararg overload; iteration order; Since Kotlin 1.0
- [Map-specific operations](https://kotlinlang.org/docs/map-operations.html)：Retrieve keys and values; Map write operations
- [containsKey](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-map/contains-key.html)：containsKey; Since Kotlin
- [LinkedHashMap](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-linked-hash-map/)：JVM typealias; Iteration order
- [C++ working draft — Class template unordered_map](https://eel.is/c++draft/unord.map)：[unord.map.overview]; [unord.map.elem]
- [C++ working draft — Unordered associative containers](https://eel.is/c++draft/unord.req)：[unord.req.general], ordering and contains
- [Microsoft Learn — unordered_map Class](https://learn.microsoft.com/en-us/cpp/standard-library/unordered-map-class?view=msvc-170#contains)：Members; unordered_map::contains
