# 基础类型与控制流来源审阅 / Types and control-flow source review

2026-10-27：3 章、12 种语言、36 个实现。仅核查所列相关章节，不宣称完整手册通读；示例未执行。

# Foundations batch 2: dynamic languages — 2026-10-27

12 original bilingual entries. All examples not compiled or executed; structural JSON checks only. No repository modification.

## Sources re-opened and specific sections reviewed
- MDN JavaScript — Data types and data structures — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures — Dynamic typing; primitive values; Number, BigInt, null and undefined.
- MDN JavaScript Guide — Control flow and error handling — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling#if...else_statement — if...else; falsy values.
- MDN JavaScript Guide — Loops and iteration — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration — for; while; break; continue.
- MDN JavaScript — Number.MAX_SAFE_INTEGER — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER — Safe integer range.
- TypeScript Handbook — Everyday Types — https://www.typescriptlang.org/docs/handbook/2/everyday-types.html — Primitive types; null and undefined; strictNullChecks.
- TypeScript Handbook — Narrowing — https://www.typescriptlang.org/docs/handbook/2/narrowing.html#truthiness-narrowing — Truthiness narrowing.
- TypeScript Handbook — The Basics — https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types — Static checking; erased types.
- Python 3.14 — Built-in Types — https://docs.python.org/3.14/builtins/stdtypes.html — Truth value testing; numeric types; text sequence type str.
- Python 3.14 Tutorial — More Control Flow Tools — https://docs.python.org/3.14/tutorial/controlflow.html — if statements; for statements; range; break and continue.
- Python 3.14 Tutorial — An Informal Introduction to Python — https://docs.python.org/3.14/tutorial/introduction.html#first-steps-towards-programming — First steps towards programming: while.
- Ruby 3.2 — Literals — https://docs.ruby-lang.org/en/3.2/syntax/literals_rdoc.html — Boolean and nil; number; string; range literals.
- Ruby 3.2 — Control Expressions — https://docs.ruby-lang.org/en/3.2/syntax/control_expressions_rdoc.html — if; while; for; break; next.
- Ruby 3.2 — Float — https://docs.ruby-lang.org/en/3.2/Float.html — Native double precision and inexact representation.
- Ruby 3.2 — Assignment — https://docs.ruby-lang.org/en/3.2/syntax/assignment_rdoc.html — Local variables.

## Scope and correctness notes
- Node 22+, TypeScript 5.3+ strict, Python 3.14, Ruby 3.2+ are compatible example baselines, not introduction dates or claims to newest releases. Python and Ruby pages version-pinned; TypeScript and MDN chapters rolling.
- No complete-manual reading claim. Official publisher/implementation sources only.
- Number safe-integer range and floating point approximation distinguished from arbitrary-size int/Integer and JS bigint.
- Truthiness deliberately differs: JS empty array true; Python empty list false; Ruby 0/empty string/empty array true.
- Loop boundaries: JS/TS <=5; Python range(1,6); Ruby 1..5. Ruby next, not continue.
- Loop examples sum odds 1+3 and use threshold 4 break, exiting before visiting 5; second while decrements separate counter 2 to zero. These are predicted semantics, not captured execution.
- Basic types use label rather than name to avoid ambient window.name collisions in standalone TypeScript; no module syntax added to this beginner example.

## Integration alignment
- All conditions use score 75. All loops break at total >= 4 (1 + 3), before visiting 5; independent countdown remains 2 to 0.
- JavaScript summary explicitly distinguishes dynamic value types, reassignable let bindings and non-reassignable const bindings.


# Foundation batch 2 — Java, C#, Kotlin, PHP

Checked 2026-10-27. Official specific chapters reread using web retrieval. Original complete examples not compiled or executed. No repository edits.

## basic-types

### java
JDK 25; save each example separately as Main.java.
- [Java SE 25 JLS — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.1) — 4.1 Kinds of Types and Values; 4.2 Primitive Types; 4.3 Reference Types

### csharp
.NET 10 SDK console project; replace Program.cs with this example.
- [C# — Built-in types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/built-in-types) — Value types and reference types
- [C# — Nullable value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types) — Declaration and assignment
- [C# — Nullable reference types](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types) — Compile-time analysis and annotations

### kotlin
Kotlin/JVM 1.5+; save each example separately as Main.kt.
- [Kotlin — Numbers](https://kotlinlang.org/docs/numbers.html) — Choose a number type
- [Kotlin — Strings](https://kotlinlang.org/docs/strings.html) — Declare strings
- [Kotlin — Null safety](https://kotlinlang.org/docs/null-safety.html) — Nullable types and non-nullable types
- [Kotlin — Booleans](https://kotlinlang.org/docs/booleans.html) — Declare a Boolean variable

### php
PHP 8.x CLI; save each example separately as main.php.
- [PHP Manual — Type System](https://www.php.net/manual/en/language.types.type-system.php) — Atomic types; Scalar types
- [PHP Manual — Type Juggling](https://www.php.net/manual/en/language.types.type-juggling.php) — Type Juggling

## conditions

### java
JDK 25; save each example separately as Main.java.
- [Java SE 25 JLS — The if Statement](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.9) — 14.9; 14.9.1; 14.9.2

### csharp
.NET 10 SDK console project; replace Program.cs with this example.
- [C# — Selection statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements#the-if-statement) — The if statement

### kotlin
Kotlin/JVM 1.5+; save each example separately as Main.kt.
- [Kotlin — Conditions and loops](https://kotlinlang.org/docs/control-flow.html#if-expression) — If expression
- [Kotlin — Booleans](https://kotlinlang.org/docs/booleans.html) — Boolean in conditions

### php
PHP 8.x CLI; save each example separately as main.php.
- [PHP Manual — if](https://www.php.net/manual/en/control-structures.if.php) — if
- [PHP Manual — elseif/else if](https://www.php.net/manual/en/control-structures.elseif.php) — elseif/else if
- [PHP Manual — Booleans](https://www.php.net/manual/en/language.types.boolean.php#language.types.boolean.casting) — Converting to boolean

## loops

### java
JDK 25; save each example separately as Main.java.
- [Java SE 25 JLS — while and for](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.12) — 14.12 while; 14.14.1 basic for; 14.15 break; 14.16 continue

### csharp
.NET 10 SDK console project; replace Program.cs with this example.
- [C# — Iteration statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements) — The for statement; The while statement; break and continue

### kotlin
Kotlin/JVM 1.5+; save each example separately as Main.kt.
- [Kotlin — Conditions and loops](https://kotlinlang.org/docs/control-flow.html#for-loops) — For loops; While loops
- [Kotlin — Ranges and progressions](https://kotlinlang.org/docs/ranges.html#ranges) — Ranges
- [Kotlin — Returns and jumps](https://kotlinlang.org/docs/returns.html) — break; continue

### php
PHP 8.x CLI; save each example separately as main.php.
- [PHP Manual — for](https://www.php.net/manual/en/control-structures.for.php) — for
- [PHP Manual — while](https://www.php.net/manual/en/control-structures.while.php) — while
- [PHP Manual — continue](https://www.php.net/manual/en/control-structures.continue.php) — continue
- [PHP Manual — break](https://www.php.net/manual/en/control-structures.break.php) — break

## Cautions
- Java primitive types cannot hold null; String is a reference. Boolean conditions can unbox, and null unboxing fails.
- C# int? is Nullable<int>; string? is a compile-time annotation, not a new runtime type. Example enables nullable analysis explicitly.
- Kotlin ranges use longstanding 1..5, inclusive both ends; no new ..< requirement. Conditions require Boolean.
- PHP converts conditions to bool, including false for string "0"; explicit comparisons avoid this trap.
- Loop outputs are reasoning, not observed execution; all examples honestly labeled.
- Kotlin basic-types.html redirects; only actual specific number/string/null/boolean chapters cited. Booleans first request transiently failed, second succeeded. Microsoft Learn generic sign-in banner did not block article body; no sign-in attempted.

## Cross-language alignment
Conditions use score 75, >=90 high / >=60 pass / else retry; Kotlin retains its if expression. Loops traverse 1..5, skip evens, and break when total reaches 4, before reaching 5. A separate while reduces remaining from 2 to 0. Final 4 and 0 are reasoned values, not observed execution.


# Foundation batch 2 — systems languages

Checked 2026-10-27 with fresh official-body reads. 12 original bilingual entries: basic-types, conditions, loops × Go/Rust/Swift/C++. Examples NOT executed. No repository edits.

## Baselines
Go 1.x established syntax; current spec consulted (no new range-over-integer feature used). Rust stable toolchain; inclusive range syntax requires Rust 1.26+, safely covered by modern stable. Current std page displays 1.99.1. Swift 5+ single-file command-line main.swift; official book Markdown source reviewed. C++17 hosted programs; std::optional requires C++17; current working draft is not presented as a frozen C++17 standard.

## Semantic cautions
Go nil applies to specified reference-bearing types, not int/bool/string. Rust Option is an explicit sum type, not universal null; no claim about raw pointers. Swift Optional is a distinct wrapper. C++ string/optional are library types. Go/Rust/Swift ordinary condition expressions require Boolean values, while C++ performs contextual conversion to bool. All loops show inclusive 1-to-5 bounds but deliberately break after sum 4, and demonstrate a condition-controlled countdown. Go spells this second loop for, not while.

## Reviewed sources
- [Go Language Specification — Types](https://go.dev/ref/spec#Types) — Types
- [Go Language Specification — Assignability](https://go.dev/ref/spec#Assignability) — Assignability
- [The Rust Programming Language — Data Types](https://doc.rust-lang.org/book/ch03-02-data-types.html) — Data Types
- [The Rust Programming Language — The String Type](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) — The String Type
- [The Rust Programming Language — The Option Enum and Its Advantages Over Null Values](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html) — The Option Enum and Its Advantages Over Null Values
- [The Swift Programming Language — TheBasics (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/TheBasics.md) — Type Safety and Type Inference; Integers; Floating-Point Numbers; Booleans; Optionals
- [C++ working draft — basic.fundamental](https://eel.is/c++draft/basic.fundamental) — basic.fundamental
- [C++ working draft — string.syn](https://eel.is/c++draft/string.syn) — string.syn
- [C++ working draft — optional.general](https://eel.is/c++draft/optional.general) — optional.general
- [C++ working draft — optional.observe](https://eel.is/c++draft/optional.observe) — optional.observe
- [Go Language Specification — If statements](https://go.dev/ref/spec#If_statements) — If statements
- [The Rust Programming Language — Control Flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) — Control Flow
- [The Swift Programming Language — ControlFlow (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/ControlFlow.md) — Conditional Statements; For-In Loops; While Loops; Control Transfer Statements
- [C++ working draft — stmt.if](https://eel.is/c++draft/stmt.if) — stmt.if
- [C++ working draft — stmt.pre](https://eel.is/c++draft/stmt.pre) — stmt.pre
- [C++ working draft — conv.bool](https://eel.is/c++draft/conv.bool) — conv.bool
- [Go Language Specification — For statements](https://go.dev/ref/spec#For_statements) — For statements
- [Go Language Specification — Break statements](https://go.dev/ref/spec#Break_statements) — Break statements
- [Go Language Specification — Continue statements](https://go.dev/ref/spec#Continue_statements) — Continue statements
- [Rust standard library — RangeInclusive](https://doc.rust-lang.org/std/ops/struct.RangeInclusive.html) — Inclusive range start..=end
- [C++ working draft — stmt.for](https://eel.is/c++draft/stmt.for) — stmt.for
- [C++ working draft — stmt.while](https://eel.is/c++draft/stmt.while) — stmt.while
- [C++ working draft — stmt.break](https://eel.is/c++draft/stmt.break) — stmt.break
- [C++ working draft — stmt.cont](https://eel.is/c++draft/stmt.cont) — stmt.cont
