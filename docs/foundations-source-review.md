# 基础章节来源审阅 / Foundations source review

2026-10-27：5 章、12 种语言、60 个实现。仅审阅所列具体章节，不宣称已读完整手册。基础类型、条件与循环尚未补齐，目录不制造占位章节。

# Dynamic-language foundations review — 2026-10-27

20 original bilingual entries; examples conceptually reviewed, not compiled or executed. No repo files changed.

- MDN JavaScript Guide — Grammar and types: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types — reviewed Comments; declarations; constants.
- MDN JavaScript Guide — Expressions and operators: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators — reviewed Arithmetic, comparison and logical operators.
- MDN JavaScript Guide — Functions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions — reviewed Function declarations; calling functions.
- TypeScript Handbook — Variable Declaration: https://www.typescriptlang.org/docs/handbook/variable-declarations.html — reviewed let declarations; const declarations.
- TypeScript Handbook — The Basics: https://www.typescriptlang.org/docs/handbook/2/basic-types.html — reviewed Static type-checking; erased types.
- TypeScript Handbook — Everyday Types: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html — reviewed Type annotations on variables; functions.
- Python 3.14 Tutorial — An Informal Introduction to Python: https://docs.python.org/3.14/tutorial/introduction.html — reviewed Comments; numbers; assignment.
- Python 3.14 Tutorial — More Control Flow Tools: https://docs.python.org/3.14/tutorial/controlflow.html#defining-functions — reviewed Defining functions.
- PEP 8 — Style Guide for Python Code: https://peps.python.org/pep-0008/#constants — reviewed Constants.
- Python 3.14 — typing.Final: https://docs.python.org/3.14/library/typing.html#typing.Final — reviewed Final; runtime type annotation enforcement.
- Python 3.14 — Built-in Types: https://docs.python.org/3.14/builtins/stdtypes.html#boolean-operations-and-or-not — reviewed Boolean operations; comparisons; numeric types.
- Ruby 3.2 — Assignment: https://docs.ruby-lang.org/en/3.2/syntax/assignment_rdoc.html — reviewed Local variable names; assignment.
- Ruby 3.2 — Code Comments: https://docs.ruby-lang.org/en/3.2/syntax/comments_rdoc.html — reviewed Inline comments.
- Ruby 3.2 — Methods: https://docs.ruby-lang.org/en/3.2/syntax/methods_rdoc.html — reviewed Method definitions; arguments; return values.
- Ruby — Ruby From Other Languages: https://www.ruby-lang.org/en/documentation/ruby-from-other-languages/ — reviewed Constants.
- Official Ruby FAQ — Variables, constants and arguments: https://www.ruby-lang.org/en/documentation/faq/4/ — reviewed Variables and constants.
- Ruby 3.2 — Precedence: https://docs.ruby-lang.org/en/3.2/syntax/precedence_rdoc.html — reviewed Operator precedence.
- Ruby 3.2 — Integer: https://docs.ruby-lang.org/en/3.2/Integer.html#method-i-2F — reviewed Division.

## Boundaries
- Official publisher references only: Mozilla MDN (JavaScript implementer), TypeScript handbook, Python docs/PEP, Ruby docs. Not a claim to have read entire manuals.
- Baselines describe example compatibility, not first-introduction dates: JS Node 22+, TS 5.3+, Python 3.14, Ruby 3.2+. TypeScript web handbook unversioned.
- Python constants idiomatic: PEP8 names + optional Final checker; no runtime prohibition, no object freezing.
- JavaScript/TypeScript const binding is not object immutability. TypeScript readonly checking is separate.
- Ruby constants can be reassigned with warning; constants assignment syntax has restrictions. Ruby methods are accurately named methods.
- JS/TS number division versus Python true/floor division versus Ruby integer division differentiated. Basic operators only, not exhaustive.
- Ruby guessed constants_rdoc.html/operators_rdoc.html returned inaccessible and are NOT used as sources; real official chapters and Ruby official FAQ replaced them.
- No output blocks presented as actual execution.

## Follow-up validation
- TypeScript operators example alone: original `const a: number = 7; const b: number = 2;` including `a === b` passed installed compiler with `tsc --noEmit --skipLibCheck --target ES2022 /tmp/foundations-ts-operators.ts` (exit 0); no TS2367. Explicit number annotation avoids inferred singleton const types here. Not executed. Only this entry verification wording updated; other 19 examples remain uncompiled/unexecuted.


# Managed-language foundation sources

Reviewed 2026-10-27 using official chapter bodies through web retrieval. Original examples are authored, not executed. No repository files modified.

## syntax-basics

### java
Use main inside a class as the entry point, braces for blocks, and semicolons for statements. // starts a line comment; /* ... */ encloses a block comment.
- [Java SE 25 JLS — Comments](https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.7) — 3.7 Comments
- [Java SE 25 JLS — Invoke a main Method](https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.1.4) — 12.1.4 Invoke a main Method

### csharp
This example declares an explicit Main entry point, groups code with braces and ends statements with semicolons. // and /* ... */ write line and block comments. Console.WriteLine prints a line.
- [C# — Main() and command-line arguments](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/main-command-line) — Overview
- [C# — Code comments](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/comments) — Single-line and multiline comments

### kotlin
main is the entry point and braces delimit its body. A statement per line usually needs no semicolon. // starts a line comment, /* ... */ encloses a block comment, and println prints a line.
- [Kotlin — Basic syntax overview](https://kotlinlang.org/docs/basic-syntax.html) — Program entry point; Comments

### php
A PHP file starts with <?php and executes top-level statements without requiring main. Statements end with semicolons; // and /* ... */ write line and block comments.
- [PHP Manual — PHP tags](https://www.php.net/manual/en/language.basic-syntax.phptags.php) — PHP tags
- [PHP Manual — Comments](https://www.php.net/manual/en/language.basic-syntax.comments.php) — Comments
## variables

### java
Declare a type and name, then assign a value. A non-final local variable can be reassigned with a compatible value and must be initialized before use.
- [Java SE 25 JLS — Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12) — 4.12 Variables; 4.12.5 Initial Values of Variables

### csharp
Local variables can use explicit types or var to infer a type from the initializer. var is still statically typed; it does not allow arbitrary type changes later.
- [C# — Declaration statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/declarations) — Implicitly typed local variables

### kotlin
var permits reassignment; a local val cannot be reassigned after initialization. A type follows the name after a colon or can be inferred from the initializer; inference does not make the variable dynamically typed.
- [Kotlin — Basic syntax overview](https://kotlinlang.org/docs/basic-syntax.html#variables) — Variables

### php
Variable names begin with $ and are case-sensitive. Assignment creates an ordinary variable. The example initializes and updates an integer; ordinary PHP variables do not acquire a fixed type from their first assignment.
- [PHP Manual — Variable basics](https://www.php.net/manual/en/language.variables.basics.php) — Basics
## constants

### java
final prevents reassignment, not mutation of a referenced object. Only a final primitive or String variable initialized by a constant expression is a constant variable in the specification.
- [Java SE 25 JLS — final Variables](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.4) — 4.12.4 final Variables

### csharp
const requires a compile-time constant expression. A readonly field can be assigned in its declaration or a constructor of the same class; afterward its reference cannot be replaced, but the object can still be mutable.
- [C# — const](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/const) — Constant expressions
- [C# — readonly](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly) — Field declaration

### kotlin
const val declares a restricted compile-time constant. An ordinary val is a read-only binding, not a guarantee of object immutability. const val is limited to eligible top-level, object or companion-object properties, not local variables.
- [Kotlin — Properties](https://kotlinlang.org/docs/properties.html#compile-time-constants) — Compile-time constants; Declaring properties

### php
const declares a named constant, referenced without $. Its value cannot be changed after definition. It is not a read-only modifier for ordinary variables; this example uses scalar constant expressions, not readonly object properties.
- [PHP Manual — Constants syntax](https://www.php.net/manual/en/language.constants.syntax.php) — Syntax
## operators

### java
Numbers support +, -, *, / and %. Comparisons yield booleans; && and || short-circuit and ! negates. int division truncates toward zero; == on references is not general content equality.
- [Java SE 25 JLS — Expressions](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.17) — 15.17–15.24 Arithmetic, equality and conditional operators

### csharp
Numbers support +, -, *, / and %. Relational operations yield bool; && and || short-circuit and ! negates. int division truncates toward zero; floating-point and decimal arithmetic follow different numeric rules.
- [C# — Arithmetic operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/arithmetic-operators) — Division operator /
- [C# — Boolean logical operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/boolean-logical-operators) — Conditional logical AND and OR
- [C# — Comparison operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/comparison-operators) — Relational operators

### kotlin
Numbers support +, -, *, / and %. Int division discards the fractional part. Comparisons yield Boolean; && and || short-circuit and ! negates. == checks structural equality, while === checks reference identity.
- [Kotlin — Numbers](https://kotlinlang.org/docs/numbers.html#arithmetic-operations) — Arithmetic operations; Integer division
- [Kotlin — Booleans](https://kotlinlang.org/docs/booleans.html) — Boolean operations
- [Kotlin — Equality](https://kotlinlang.org/docs/equality.html) — Structural and referential equality

### php
Arithmetic, comparison and logical operators are available. / is not always integer division: 7 / 2 gives 3.5. === compares both type and value, avoiding the conversion performed by ==. && and || short-circuit; ! negates.
- [PHP Manual — Arithmetic operators](https://www.php.net/manual/en/language.operators.arithmetic.php) — Arithmetic Operators
- [PHP Manual — Comparison operators](https://www.php.net/manual/en/language.operators.comparison.php) — Comparison Operators
- [PHP Manual — Logical operators](https://www.php.net/manual/en/language.operators.logical.php) — Logical Operators
## functions

### java
This example uses a static method as a reusable function: parameter types precede names and the return type precedes the method name. return gives the result to the caller; main calls add without constructing an object.
- [Java SE 25 JLS — Method Declarations](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4) — 8.4 Method Declarations; 8.4.3.2 static Methods; 8.4.5 Method Result

### csharp
Encapsulate an operation in a method with explicit parameter and return types. Main calls the static Add method directly and return passes back the result; no Program instance is needed.
- [C# — Methods](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/methods) — Method signatures; Method access; Return values

### kotlin
fun declares a function. Types follow parameter names and the return type follows the parameter list. Functions may be top-level; main calls add and return passes back its result.
- [Kotlin — Functions](https://kotlinlang.org/docs/functions.html) — Function declaration; Parameters; Return type

### php
function declares a function with $-prefixed parameter names. return ends the call and passes back a result. This script calls a top-level function directly, without a class or main.
- [PHP Manual — User-defined functions](https://www.php.net/manual/en/functions.user-defined.php) — User-defined functions
- [PHP Manual — Returning values](https://www.php.net/manual/en/functions.returning-values.php) — Returning values

## Review cautions
- Java 25 expands entry forms; traditional static main is an example, not the only supported form. Java final is not universal compile-time constness.
- C# readonly applies to fields here, not ordinary local variables. References may still point to mutable objects.
- Kotlin val bindings do not freeze arrays. const val excludes local variables and arbitrary object values.
- PHP / differs from Java/C#/Kotlin integer division. === checks type and value. No reliance on user-contributed PHP manual notes.
- Microsoft Learn retrieval contains a generic authorization banner but the official article bodies were accessible; no sign-in attempted.
- dev.java returned empty/inaccessible pages; authoritative Java SE 25 JLS chapters were read instead and only these are cited.


# Systems-language foundation source ledger

Checked 2026-10-27. 20 original entries, five chapters × Go/Rust/Swift/C++. Sources read via web tool, examples NOT compiled or executed. No repository edits.

## Baselines and limits
- Go examples use long-established Go 1.x syntax, not a claim about the newest release. Current specification was consulted at its named sections.
- Rust examples use stable ordinary syntax, no edition-specific feature; Book and Reference checked.
- Swift examples target Swift 5+ command-line main.swift; not SwiftUI/app entry points. Rendered docs returned only a JavaScript shell; actual official swiftlang/swift-book Markdown bodies read instead.
- C++17 hosted examples; eel.is is the live HTML rendering of the C++ working draft linked to cplusplus/draft. Draft is not misrepresented as a frozen C++17 standard. Only long-established rules used.

## Semantic review
Go const uses constant expressions, not arbitrary runtime results. Rust const differs from ordinary immutable let. Swift let may hold runtime values; class properties can still mutate through a fixed reference. C++ const need not be constexpr and is not deep freezing. Examples deliberately use small integer addition, equality, and Boolean AND rather than implying cross-language overflow/division equivalence.

## Reviewed sources
- [Go Language Specification — Comments](https://go.dev/ref/spec#Comments) — Comments
- [Go Language Specification — Program execution](https://go.dev/ref/spec#Program_execution) — Program execution
- [The Rust Programming Language — Functions](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html) — Functions
- [The Rust Programming Language — Comments](https://doc.rust-lang.org/book/ch03-04-comments.html) — Comments
- [The Swift Programming Language — A Swift Tour (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/GuidedTour/GuidedTour.md) — A Swift Tour; Simple Values
- [The Swift Programming Language — The Basics (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/TheBasics.md) — The Basics
- [C++ working draft — basic.start.main](https://eel.is/c++draft/basic.start.main) — basic.start.main
- [C++ working draft — lex.comment](https://eel.is/c++draft/lex.comment) — lex.comment
- [Go Language Specification — Variable declarations](https://go.dev/ref/spec#Variable_declarations) — Variable declarations
- [Go Language Specification — Short variable declarations](https://go.dev/ref/spec#Short_variable_declarations) — Short variable declarations
- [The Rust Programming Language — Variables and Mutability](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html) — Variables and Mutability
- [C++ working draft — dcl.init.general](https://eel.is/c++draft/dcl.init.general) — dcl.init.general
- [Go Language Specification — Constant declarations](https://go.dev/ref/spec#Constant_declarations) — Constant declarations
- [Go Language Specification — Constants](https://go.dev/ref/spec#Constants) — Constants
- [The Swift Programming Language — Structures and Classes (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/ClassesAndStructures.md) — Structures and Classes
- [C++ working draft — dcl.type.cv](https://eel.is/c++draft/dcl.type.cv) — dcl.type.cv
- [C++ working draft — dcl.constexpr](https://eel.is/c++draft/dcl.constexpr) — dcl.constexpr
- [Go Language Specification — Arithmetic operators](https://go.dev/ref/spec#Arithmetic_operators) — Arithmetic operators
- [Go Language Specification — Comparison operators](https://go.dev/ref/spec#Comparison_operators) — Comparison operators
- [Go Language Specification — Logical operators](https://go.dev/ref/spec#Logical_operators) — Logical operators
- [The Rust Reference — Operator expressions](https://doc.rust-lang.org/reference/expressions/operator-expr.html) — Arithmetic and logical binary operators; Comparison operators; Lazy boolean operators
- [The Swift Programming Language — Basic Operators (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/BasicOperators.md) — Basic Operators
- [C++ working draft — expr.add](https://eel.is/c++draft/expr.add) — expr.add
- [C++ working draft — expr.eq](https://eel.is/c++draft/expr.eq) — expr.eq
- [C++ working draft — expr.log.and](https://eel.is/c++draft/expr.log.and) — expr.log.and
- [Go Language Specification — Function declarations](https://go.dev/ref/spec#Function_declarations) — Function declarations
- [The Swift Programming Language — Functions (official source)](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/Functions.md) — Functions
- [C++ working draft — dcl.fct.def.general](https://eel.is/c++draft/dcl.fct.def.general) — dcl.fct.def.general

## Operator expansion review
All four operator examples now use 7 and 2 and cover +, -, *, /, %, ==, != and &&. Integer 7 / 2 yields 3 and 7 % 2 yields 1; prose does not generalize this to floating-point division. All examples remain unexecuted. Original other sixteen entries unchanged.
- [C++ expr.mul](https://eel.is/c++draft/expr.mul): integer quotient discards fractional part, remainder identity, zero divisor is undefined behavior.
- [Swift official BinaryInteger source documentation](https://raw.githubusercontent.com/swiftlang/swift/main/stdlib/public/core/Integers.swift): division discards remainder; percent returns remainder; nonzero divisor required.
- Rust Reference operator expressions explicitly documents truncation toward zero; Go specification Integer operators explicitly documents truncation toward zero. Examples intentionally use only positive values.
